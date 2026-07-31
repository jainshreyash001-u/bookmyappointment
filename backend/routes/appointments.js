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
    createAppointment,
    updateAppointment,
} = require("../services/database");
const supabase = require("../services/supabaseClient");
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
                patientPhone: a.fields.PatientPhone,
                service: a.fields.Service,
                dateTime: a.fields.DateTime,
                duration: a.fields.Duration,
                status: a.fields.Status,
                notes: a.fields.Notes,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/appointments
router.post("/", auth, async (req, res) => {
    try {
        const { patientName, patientPhone, service, dateTime, duration, status, notes } = req.body;
        const appt = await createAppointment(req.dentist.dentistId, {
            PatientName: patientName,
            PatientPhone: patientPhone,
            Service: service,
            DateTime: dateTime,
            Duration: duration,
            Status: status,
            Notes: notes,
        });

        res.json({
            success: true,
            appointment: {
                id: appt.id,
                patientName: appt.fields.PatientName,
                patientPhone: appt.fields.PatientPhone,
                service: appt.fields.Service,
                dateTime: appt.fields.DateTime,
                duration: appt.fields.Duration,
                status: appt.fields.Status,
                notes: appt.fields.Notes,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/appointments/:id
router.patch("/:id", auth, async (req, res) => {
    try {
        const { patientName, patientPhone, service, dateTime, duration, status, notes } = req.body;
        const appt = await updateAppointment(req.params.id, {
            PatientName: patientName,
            PatientPhone: patientPhone,
            Service: service,
            DateTime: dateTime,
            Duration: duration,
            Status: status,
            Notes: notes,
        });

        res.json({
            success: true,
            appointment: {
                id: appt.id,
                patientName: appt.fields.PatientName,
                patientPhone: appt.fields.PatientPhone,
                service: appt.fields.Service,
                dateTime: appt.fields.DateTime,
                duration: appt.fields.Duration,
                status: appt.fields.Status,
                notes: appt.fields.Notes,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/appointments/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("id", req.params.id)
            .eq("dentist_id", req.dentist.dentistId);

        if (error) throw error;

        res.json({ success: true, message: "Appointment deleted successfully" });
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
