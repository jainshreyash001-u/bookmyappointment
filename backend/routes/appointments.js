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
const { bookAppointment, updateCalendarEvent, deleteAppointment } = require("../services/calendar");

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

// GET /api/appointments
router.get("/", auth, async (req, res) => {
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
                notes: a.notes,
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
        
        let eventId = null;
        try {
            const dentist = await getDentistById(req.clinicId);
            const tokens = dentist.googleCalendarToken || {};
            if (tokens.access_token) {
                const calResult = await bookAppointment(tokens, {
                    patientName,
                    patientPhone,
                    service,
                    dateTime,
                    duration: duration || 60,
                    notes,
                });
                if (calResult.success) {
                    eventId = calResult.eventId;
                }
            }
        } catch (calErr) {
            console.error("[Google Calendar Sync Error]", calErr.message);
        }

        const appt = await createAppointment(req.clinicId, {
            patientName: patientName,
            patientPhone: patientPhone,
            service: service,
            dateTime: dateTime,
            duration: duration,
            status: status,
            notes: notes,
            eventId: eventId,
        });

        res.json({
            success: true,
            appointment: {
                id: appt.id,
                patientName: appt.patientName,
                patientPhone: appt.patientPhone,
                service: appt.service,
                dateTime: appt.dateTime,
                duration: appt.duration,
                status: appt.status,
                notes: appt.notes,
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
        
        // 1. Get existing appointment from database
        const { data: existingAppt } = await supabase
            .from("appointments")
            .select()
            .eq("id", req.params.id)
            .eq("dentist_id", req.clinicId)
            .single();

        if (existingAppt && existingAppt.event_id) {
            try {
                const dentist = await getDentistById(req.clinicId);
                const tokens = dentist.googleCalendarToken || {};
                if (tokens.access_token) {
                    await updateCalendarEvent(tokens, existingAppt.event_id, {
                        patientName: patientName || existingAppt.patient_name,
                        patientPhone: patientPhone || existingAppt.patient_phone,
                        service: service || existingAppt.service,
                        dateTime: dateTime || existingAppt.date_time,
                        duration: duration || existingAppt.duration,
                        notes: notes || existingAppt.notes,
                    });
                }
            } catch (calErr) {
                console.error("[Google Calendar Sync Update Error]", calErr.message);
            }
        }

        const appt = await updateAppointment(req.params.id, {
            patientName: patientName,
            patientPhone: patientPhone,
            service: service,
            dateTime: dateTime,
            duration: duration,
            status: status,
            notes: notes,
        });

        res.json({
            success: true,
            appointment: {
                id: appt.id,
                patientName: appt.patientName,
                patientPhone: appt.patientPhone,
                service: appt.service,
                dateTime: appt.dateTime,
                duration: appt.duration,
                status: appt.status,
                notes: appt.notes,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/appointments/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        // 1. Get existing appointment from database to check for event_id
        const { data: existingAppt } = await supabase
            .from("appointments")
            .select()
            .eq("id", req.params.id)
            .eq("dentist_id", req.clinicId)
            .single();

        if (existingAppt && existingAppt.event_id) {
            try {
                const dentist = await getDentistById(req.clinicId);
                const tokens = dentist.googleCalendarToken || {};
                if (tokens.access_token) {
                    await deleteAppointment(tokens, existingAppt.event_id);
                }
            } catch (calErr) {
                console.error("[Google Calendar Sync Delete Error]", calErr.message);
            }
        }

        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("id", req.params.id)
            .eq("dentist_id", req.clinicId);

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
            const dentist = await getDentistById(reminder.dentistId);

            const result = await sendAppointmentReminder(
                reminder.patientPhone,
                {
                    service: reminder.service,
                    dateTime: reminder.dateTime,
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
