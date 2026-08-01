/**
 * routes/dentist.js
 * Dentist dashboard APIs
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const supabase = require("../services/supabaseClient");
const {
    getDentistById,
    updateDentist,
    getAppointmentsByDentist,
} = require("../services/database");
const { getAuthUrl } = require("../services/calendar");
const {
    upsertDentistKnowledge,
} = require("../services/knowledge");

// Auth middleware
function auth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        req.dentist = jwt.verify(token, process.env.JWT_SECRET);
        // Set active clinic ID (prioritize X-Clinic-ID header if present)
        req.clinicId = req.headers["x-clinic-id"] || req.dentist.dentistId;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

// GET /api/dentist/profile
router.get("/profile", auth, async (req, res) => {
    try {
        const dentist = await getDentistById(req.clinicId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        res.json({
            dentistId: dentist.dentistId,
            name: dentist.doctorName || dentist.name,
            clinicName: dentist.clinicName,
            email: dentist.email,
            phoneNumber: dentist.whatsAppNumber,
            clinicAddress: dentist.clinicAddress,
            workingHours: dentist.workingHours || {},
            subscriptionStatus: dentist.subscriptionStatus,
            slackConfigured: !!dentist.slackWebhook,
            calendarConnected: !!(dentist.googleCalendarToken && dentist.googleCalendarToken.access_token),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/dentist/profile
router.patch("/profile", auth, async (req, res) => {
    const { name, clinicName, workingHours, clinicAddress } = req.body;

    try {
        const dentist = await getDentistById(req.clinicId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        const fieldsToUpdate = {};
        if (name !== undefined) fieldsToUpdate.doctorName = name;
        if (clinicName !== undefined) fieldsToUpdate.clinicName = clinicName;
        if (workingHours !== undefined) fieldsToUpdate.workingHours = workingHours;
        if (clinicAddress !== undefined) fieldsToUpdate.clinicAddress = clinicAddress;

        const updated = await updateDentist(dentist.id, fieldsToUpdate);
        res.json({ success: true, dentist: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dentist/clinics (List all clinics for switcher)
router.get("/clinics", auth, async (req, res) => {
    try {
        const { getClinicsByOwnerId } = require("../services/database");
        const clinics = await getClinicsByOwnerId(req.dentist.ownerId);
        res.json({
            success: true,
            clinics: clinics.map((c) => ({
                dentistId: c.dentistId,
                clinicName: c.clinicName,
                address: c.clinicAddress,
                phoneNumber: c.whatsAppNumber,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/dentist/clinics (Register additional clinic)
router.post("/clinics", auth, async (req, res) => {
    const { clinicName, phoneNumber, workingHours, address } = req.body;
    if (!clinicName || !address) {
        return res.status(400).json({ error: "Clinic name and address are required" });
    }

    try {
        const { createDentist } = require("../services/database");
        const { v4: uuidv4 } = require("uuid");

        // Validate address is unique in database
        const { data: existingClinic } = await supabase
            .from("dentists")
            .select("id")
            .eq("clinic_address", address.trim())
            .maybeSingle();

        if (existingClinic) {
            return res.status(400).json({ error: `A clinic is already registered at this address: "${address.trim()}"` });
        }

        const dentistId = `DT_${uuidv4().substring(0, 8).toUpperCase()}`;

        await createDentist({
            dentistId: dentistId,
            ownerId: req.dentist.ownerId,
            name: clinicName,
            clinicName: clinicName,
            email: req.dentist.email,
            whatsAppNumber: phoneNumber,
            workingHours: workingHours || {},
            subscriptionStatus: "trial",
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            slackNotificationMode: "none",
            clinicAddress: address,
        });

        const { initializeDentistNamespace } = require("../services/knowledge");
        await initializeDentistNamespace(dentistId);

        res.json({
            success: true,
            clinic: {
                dentistId,
                clinicName,
                address,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dentist/appointments
router.get("/appointments", auth, async (req, res) => {
    try {
        const appointments = await getAppointmentsByDentist(req.clinicId);

        res.json({
            total: appointments.length,
            appointments: appointments.map((a) => ({
                id: a.id,
                patientName: a.patientName,
                patientPhone: a.patientPhone,
                service: a.service,
                dateTime: a.dateTime,
                duration: a.duration,
                status: a.status,
                reminderSent: a.reminderSent,
                notes: a.notes,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/dentist/knowledge
router.post("/knowledge", auth, async (req, res) => {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
        return res.status(400).json({ error: "entries must be an array" });
    }

    try {
        const docs = entries.map((e) => ({
            id: `knowledge_${Date.now()}_${Math.random()}`,
            type: e.type || "general",
            title: e.title,
            text: e.description,
        }));

        await upsertDentistKnowledge(req.clinicId, docs);

        res.json({
            success: true,
            message: `${docs.length} knowledge entries added`,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dentist/knowledge
router.get("/knowledge", auth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("dentist_knowledge")
            .select("id, type, title, content")
            .eq("dentist_id", req.clinicId);

        if (error) throw error;

        res.json({ success: true, entries: data || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/dentist/knowledge/:id
router.delete("/knowledge/:id", auth, async (req, res) => {
    try {
        const { error } = await supabase
            .from("dentist_knowledge")
            .delete()
            .eq("id", req.params.id)
            .eq("dentist_id", req.clinicId);

        if (error) throw error;

        res.json({ success: true, message: "Knowledge entry deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dentist/calendar-url
router.get("/calendar-url", auth, async (req, res) => {
    try {
        const url = getAuthUrl(req.clinicId);
        res.json({ authUrl: url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dentist/upcoming
router.get("/upcoming", auth, async (req, res) => {
    try {
        const dentist = await getDentistById(req.clinicId);
        const appointments = await getAppointmentsByDentist(req.clinicId);

        const upcoming = appointments
            .filter(
                (a) =>
                    new Date(a.dateTime) > new Date() &&
                    a.status === "confirmed"
            )
            .slice(0, 10);

        res.json({ upcoming });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/dentist/test-whatsapp
router.post("/test-whatsapp", auth, async (req, res) => {
    try {
        const dentist = await getDentistById(req.clinicId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        const phoneNumber = dentist.whatsAppNumber;
        if (!phoneNumber) {
            return res.status(400).json({ error: "WhatsApp number not configured in profile" });
        }

        const { sendWhatsAppMessage } = require("../services/whatsapp");
        const result = await sendWhatsAppMessage(
            phoneNumber,
            `🦷 Hello! This is a test message from your BookMyAppointment AI assistant. Your integration is successfully initialized!`
        );

        if (result.success) {
            res.json({ success: true, message: "Test message sent successfully" });
        } else {
            res.status(500).json({ error: result.error || "Failed to send WhatsApp message" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/dentist/disconnect-calendar
router.post("/disconnect-calendar", auth, async (req, res) => {
    try {
        const dentist = await getDentistById(req.clinicId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        await updateDentist(dentist.id, {
            googleCalendarToken: {},
            googleCalendarId: "",
        });

        res.json({ success: true, message: "Google Calendar successfully disconnected." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
