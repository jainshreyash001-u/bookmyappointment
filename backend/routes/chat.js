/**
 * routes/chat.js
 * Web chat endpoint
 */

const express = require("express");
const router = express.Router();
const { getDentistById, upsertPatient } = require("../services/database");
const { processMessage } = require("../services/ai-brain");
const { sendWhatsAppMessage } = require("../services/whatsapp");

// Session tracking (in production, use Redis)
const sessions = new Map();

// POST /api/chat/:dentistId
router.post("/:dentistId", async (req, res) => {
    const { message, sessionId } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message required" });
    }

    try {
        // Non-blocking trigger of reschedule escalations
        const { processRescheduleEscalations } = require("../services/doctor-ai");
        processRescheduleEscalations().catch(err => console.error("[Escalation trigger error]", err.message));

        const dentist = await getDentistById(req.params.dentistId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        // Generate session ID
        const sid = sessionId || `web_${Date.now()}_${Math.random()}`;
        const phoneNumber = `${sid.substring(0, 20)}@webchat`;

        // Track session
        if (!sessions.has(sid)) {
            sessions.set(sid, { dentistId: req.params.dentistId, messages: [] });
        }

        // Store message in session
        sessions.get(sid).messages.push({
            role: "user",
            content: message,
            timestamp: new Date(),
        });

        // Process with AI
        const aiResponse = await processMessage(dentist, phoneNumber, message);

        // Store patient interaction
        await upsertPatient(req.params.dentistId, phoneNumber, {
            name: "Web Chat User",
            conversationHistory: sessions.get(sid).messages,
        });

        // Add AI response to session
        sessions.get(sid).messages.push({
            role: "assistant",
            content: aiResponse.message,
            timestamp: new Date(),
        });

        res.json({
            sessionId: sid,
            message: aiResponse.message,
            intent: aiResponse.intent,
            appointmentData: aiResponse.appointmentData,
        });
    } catch (err) {
        console.error("[Chat]", err);
        res.status(500).json({ error: err.message });
    }
});

// Auth Middleware for dentist commands
const jwt = require("jsonwebtoken");
function auth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        req.dentist = jwt.verify(token, process.env.JWT_SECRET);
        req.clinicId = req.headers["x-clinic-id"] || req.dentist.dentistId;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

// POST /api/chat/:dentistId/admin
router.post("/:dentistId/admin", auth, async (req, res) => {
    const { message } = req.body;
    const { dentistId } = req.params;

    if (req.clinicId !== dentistId) {
        return res.status(403).json({ error: "Forbidden: Access denied to this clinic" });
    }

    if (!message) {
        return res.status(400).json({ error: "Message required" });
    }

    try {
        // Non-blocking trigger of reschedule escalations
        const { processRescheduleEscalations } = require("../services/doctor-ai");
        processRescheduleEscalations().catch(err => console.error("[Escalation trigger error]", err.message));

        const { processDoctorMessage, processLeaveAndReschedule } = require("../services/doctor-ai");

        // Process doctor message with LLM using full context
        const parsedCommand = await processDoctorMessage(dentistId, message);

        let finalReply = parsedCommand.message;

        if (parsedCommand.isLeaveRequest && parsedCommand.leaveStart && parsedCommand.leaveEnd) {
            // Process leaves and reschedule patients
            const rescheduleResult = await processLeaveAndReschedule(dentistId, parsedCommand.leaveStart, parsedCommand.leaveEnd);
            finalReply += `\n\n[System Update]: Swept calendar for leave. Found ${rescheduleResult.count} affected appointments. Rescheduling invitations dispatched via WhatsApp.`;
        }

        res.json({
            message: finalReply,
            intent: "admin_command",
            parsedCommand,
        });
    } catch (err) {
        console.error("[Doctor Admin Chat Error]", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/chat/voice/inbound - Simulated incoming call webhook
router.post("/voice/inbound", async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    try {
        const supabase = require("../services/supabaseClient");
        const { data: appt } = await supabase
            .from("appointments")
            .select("*")
            .eq("patient_phone", phone)
            .eq("status", "rescheduling")
            .limit(1)
            .maybeSingle();

        if (appt) {
            res.json({
                message: `Hello ${appt.patient_name || "there"}, I recognize your phone number. Let's reschedule your appointment for ${appt.service || "dental consultation"}. What day and time works best for you?`,
                recognized: true,
                appointment: appt
            });
        } else {
            res.json({
                message: "Welcome to our dental clinic. How can Ressa help you today?",
                recognized: false
            });
        }
    } catch (err) {
        console.error("[Voice Inbound Error]", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
