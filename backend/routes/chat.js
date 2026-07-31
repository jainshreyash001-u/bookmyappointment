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
            Name: "Web Chat User",
            ConversationHistory:
                JSON.stringify(sessions.get(sid).messages) || message,
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

module.exports = router;
