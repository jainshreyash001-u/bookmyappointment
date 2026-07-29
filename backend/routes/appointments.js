/**
 * routes/appointments.js
 * Appointment management
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
    getAppointmentsByDentist,
    getPendingReminders,
    markReminderSent,
    getDentistById,
} = require("../services/airtable");
const { sendAppointmentReminder } = require("../services/whatsapp");

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

// GET /api/appointments
router.get("/", auth, async (req, res) => {
    try {
        const appointments = await getAppointmentsByDentist(req.dentist.dentistId);

        res.json({
            total: appointments.length,
            appointments: appointments.map((a) => ({
                id: a.id,
                patientName: a.fields.PatientName,
                service: a.fields.Service,
                dateTime: a.fields.DateTime,
                status: a.fields.Status,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/appointments/send-reminders (Protected by API key)
router.post("/send-reminders", async (req, res) => {
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const pendingReminders = await getPendingReminders();

        let sent = 0;
        let failed = 0;

        for (const reminder of pendingReminders) {
            const dentist = await getDentistById(reminder.fields.DentistID);

            const result = await sendAppointmentReminder(
                reminder.fields.PatientPhone,
                {
                    service: reminder.fields.Service,
                    dateTime: reminder.fields.DateTime,
                }
            );

            if (result.success) {
                await markReminderSent(reminder.id);
                sent++;
            } else {
                failed++;
            }
        }

        res.json({
            success: true,
            totalReminders: pendingReminders.length,
            sent,
            failed,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
