/**
 * routes/dentist.js
 * Dentist dashboard APIs
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
    getDentistById,
    updateDentist,
    getAppointmentsByDentist,
} = require("../services/database");
const { getAuthUrl } = require("../services/calendar");
const {
    upsertDentistKnowledge,
    queryDentistKnowledge,
} = require("../services/knowledge");

// Auth middleware
function auth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        req.dentist = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

// GET /api/dentist/profile
router.get("/profile", auth, async (req, res) => {
    try {
        const dentist = await getDentistById(req.dentist.dentistId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        res.json({
            dentistId: dentist.fields.DentistID,
            name: dentist.fields.Name,
            clinicName: dentist.fields.ClinicName,
            email: dentist.fields.Email,
            phoneNumber: dentist.fields.WhatsAppNumber,
            clinicAddress: dentist.fields.ClinicAddress,
            workingHours: JSON.parse(dentist.fields.WorkingHours || "{}"),
            subscriptionStatus: dentist.fields.SubscriptionStatus,
            slackConfigured: !!dentist.fields.SlackWebhook,
            calendarConnected: !!dentist.fields.GoogleCalendarToken,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/dentist/profile
router.patch("/profile", auth, async (req, res) => {
    const { clinicName, workingHours, clinicAddress } = req.body;

    try {
        const dentist = await getDentistById(req.dentist.dentistId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        await updateDentist(dentist.id, {
            ClinicName: clinicName || dentist.fields.ClinicName,
            WorkingHours: workingHours
                ? JSON.stringify(workingHours)
                : dentist.fields.WorkingHours,
            ClinicAddress: clinicAddress || dentist.fields.ClinicAddress,
        });

        res.json({ success: true, message: "Profile updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dentist/appointments
router.get("/appointments", auth, async (req, res) => {
    try {
        const appointments = await getAppointmentsByDentist(req.dentist.dentistId);

        res.json({
            total: appointments.length,
            appointments: appointments.map((a) => ({
                id: a.id,
                patientName: a.fields.PatientName,
                patientPhone: a.fields.PatientPhone,
                service: a.fields.Service,
                dateTime: a.fields.DateTime,
                duration: a.fields.Duration,
                status: a.fields.Status,
                reminderSent: a.fields.ReminderSent,
                notes: a.fields.Notes,
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

        await upsertDentistKnowledge(req.dentist.dentistId, docs);

        res.json({
            success: true,
            message: `${docs.length} knowledge entries added`,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dentist/calendar-url
router.get("/calendar-url", auth, async (req, res) => {
    try {
        const url = getAuthUrl(req.dentist.dentistId);
        res.json({ authUrl: url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dentist/upcoming
router.get("/upcoming", auth, async (req, res) => {
    try {
        const dentist = await getDentistById(req.dentist.dentistId);
        const appointments = await getAppointmentsByDentist(req.dentist.dentistId);

        const upcoming = appointments
            .filter(
                (a) =>
                    new Date(a.fields.DateTime) > new Date() &&
                    a.fields.Status === "confirmed"
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
        const dentist = await getDentistById(req.dentist.dentistId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        const phoneNumber = dentist.fields.WhatsAppNumber;
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

module.exports = router;
