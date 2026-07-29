/**
 * routes/dentist-communication.js
 * ──────────────────────────────────────────────────────────
 * Routes for dentist to communicate with AI agent
 * - Send policy updates
 * - Announce holidays
 * - Reschedule appointments
 * - Update working hours
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getDentistById } = require("../services/airtable");
const {
  processDentistMessage,
  handleAddPolicy,
  handleRemovePolicy,
  handleRescheduleRequest,
  handleHolidayAnnouncement,
  handleWorkingHoursUpdate,
} = require("../services/dentist-agent-communication");

// ─── Auth Middleware ──────────────────────────────────────────────────────
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

// ─── POST /api/dentist/message ────────────────────────────────────────────
// Dentist sends natural language message to AI agent
router.post("/message", auth, async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const dentist = await getDentistById(req.dentist.dentistId);
    if (!dentist) return res.status(404).json({ error: "Dentist not found" });

    // Process dentist's natural language message
    const result = await processDentistMessage(dentist, message);

    res.json(result);
  } catch (err) {
    console.error("[Dentist Message]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/dentist/policy/add ─────────────────────────────────────────
router.post("/policy/add", auth, async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "title and description are required" });
  }

  try {
    const dentist = await getDentistById(req.dentist.dentistId);
    if (!dentist) return res.status(404).json({ error: "Dentist not found" });

    const result = await handleAddPolicy(dentist, { title, description }, "");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/dentist/policy/:policyId ─────────────────────────────────
router.delete("/policy/:policyId", auth, async (req, res) => {
  const { policyId } = req.params;

  try {
    const dentist = await getDentistById(req.dentist.dentistId);
    if (!dentist) return res.status(404).json({ error: "Dentist not found" });

    const result = await handleRemovePolicy(dentist, { id: policyId }, "");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/dentist/holiday ────────────────────────────────────────────
router.post("/holiday", auth, async (req, res) => {
  const { startDate, endDate, reason } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate and endDate are required" });
  }

  try {
    const dentist = await getDentistById(req.dentist.dentistId);
    if (!dentist) return res.status(404).json({ error: "Dentist not found" });

    const result = await handleHolidayAnnouncement(
      dentist,
      { start_date: startDate, end_date: endDate, reason: reason || "Vacation" },
      ""
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/dentist/reschedule ─────────────────────────────────────────
// Dentist can reschedule a patient's appointment
router.post("/reschedule", auth, async (req, res) => {
  const { appointmentId, patientPhone, newDateTime, reason } = req.body;

  if (!patientPhone || !newDateTime) {
    return res
      .status(400)
      .json({ error: "patientPhone and newDateTime are required" });
  }

  try {
    const dentist = await getDentistById(req.dentist.dentistId);
    if (!dentist) return res.status(404).json({ error: "Dentist not found" });

    const result = await handleRescheduleRequest(
      dentist,
      {
        appointment_id: appointmentId,
        patient_phone: patientPhone,
        new_date_time: newDateTime,
        reason: reason || "Rescheduled by dentist",
      },
      ""
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/dentist/working-hours ──────────────────────────────────────
router.post("/working-hours", auth, async (req, res) => {
  const { days, open, close, active } = req.body;

  if (!days || !Array.isArray(days)) {
    return res.status(400).json({ error: "days array is required" });
  }

  try {
    const dentist = await getDentistById(req.dentist.dentistId);
    if (!dentist) return res.status(404).json({ error: "Dentist not found" });

    const result = await handleWorkingHoursUpdate(
      dentist,
      { days, open, close, active },
      ""
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/dentist/vacations ───────────────────────────────────────────
// Get all scheduled vacations/holidays
router.get("/vacations", auth, async (req, res) => {
  try {
    const dentist = await getDentistById(req.dentist.dentistId);
    if (!dentist) return res.status(404).json({ error: "Dentist not found" });

    const vacations = JSON.parse(dentist.fields.Vacations || "[]");
    res.json({ vacations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/dentist/policies ────────────────────────────────────────────
// Get all policies
router.get("/policies", auth, async (req, res) => {
  try {
    const dentist = await getDentistById(req.dentist.dentistId);
    if (!dentist) return res.status(404).json({ error: "Dentist not found" });

    const notes = dentist.fields.PoliciesNotes || "";
    const policies = notes
      .split("\n")
      .filter((line) => line.trim())
      .map((line, idx) => ({
        id: idx,
        text: line,
      }));

    res.json({ policies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
