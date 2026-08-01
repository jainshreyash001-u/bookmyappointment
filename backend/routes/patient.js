/**
 * routes/patient.js
 * Patient CRM APIs
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getPatient } = require("../services/database");
const supabase = require("../services/supabaseClient");

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

// GET /api/patient/list
router.get("/list", auth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("patients")
            .select()
            .eq("dentist_id", req.clinicId)
            .order("last_contact", { ascending: false });

        if (error) throw error;

        res.json({
            total: data.length,
            patients: data.map((r) => ({
                id: r.id,
                name: r.name,
                phoneNumber: r.phone_number,
                email: r.email,
                lastContact: r.last_contact,
                createdAt: r.created_at,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/patient/:phone
router.get("/:phone", auth, async (req, res) => {
    try {
        const patient = await getPatient(req.clinicId, req.params.phone);

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.json({
            name: patient.name,
            phoneNumber: patient.phoneNumber,
            email: patient.email,
            conversationHistory: patient.conversationHistory || "",
            lastContact: patient.lastContact,
            createdAt: patient.createdAt,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
