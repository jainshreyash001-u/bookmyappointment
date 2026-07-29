/**
 * routes/patient.js
 * Patient CRM APIs
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getPatient, upsertPatient } = require("../services/airtable");
const Airtable = require("airtable");

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

// GET /api/patient/list
router.get("/list", auth, async (req, res) => {
    try {
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
            process.env.AIRTABLE_BASE_ID
        );

        const records = await base(process.env.AIRTABLE_PATIENTS_TABLE || "Patients")
            .select({
                filterByFormula: `{DentistID} = '${req.dentist.dentistId}'`,
                sort: [{ field: "LastContact", direction: "desc" }],
            })
            .all();

        res.json({
            total: records.length,
            patients: records.map((r) => ({
                id: r.id,
                name: r.fields.Name,
                phoneNumber: r.fields.PhoneNumber,
                email: r.fields.Email,
                lastContact: r.fields.LastContact,
                createdAt: r.fields.CreatedAt,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/patient/:phone
router.get("/:phone", auth, async (req, res) => {
    try {
        const patient = await getPatient(req.dentist.dentistId, req.params.phone);

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.json({
            name: patient.fields.Name,
            phoneNumber: patient.fields.PhoneNumber,
            email: patient.fields.Email,
            conversationHistory: patient.fields.ConversationHistory || "",
            lastContact: patient.fields.LastContact,
            createdAt: patient.fields.CreatedAt,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
