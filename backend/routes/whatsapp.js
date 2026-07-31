/**
 * routes/whatsapp.js
 * WhatsApp Webhook for Twilio/Meta
 */

const express = require("express");
const router = express.Router();
const { getDentistByPhone, getDentistByWhatsApp } = require("../services/database");
const { processMessage } = require("../services/ai-brain");
const { sendWhatsAppMessage } = require("../services/whatsapp");

// Twilio Webhook (POST /api/webhook/whatsapp)
router.post("/", async (req, res) => {
    const from = req.body.From; // Patient phone (e.g., "whatsapp:+919876543210")
    const to = req.body.To;     // Clinic WhatsApp number (e.g., "whatsapp:+14155238886")
    const body = req.body.Body; // Message text

    if (!body) return res.send("OK");

    try {
        const patientPhone = from.replace("whatsapp:", "");
        const clinicPhone = to.replace("whatsapp:", "");

        // Find dentist by their WhatsApp number
        // (For simplicity, using a mock finder or looking up by number in Database)
        const { getDentistByWhatsAppNumber } = require("../services/database");
        const dentist = await getDentistByWhatsAppNumber(clinicPhone);

        if (!dentist) {
            console.error(`[WhatsApp] Dentist not found for number ${clinicPhone}`);
            return res.send("OK");
        }

        // Process with AI Brain
        const aiResponse = await processMessage(dentist, patientPhone, body);

        // Reply to patient
        await sendWhatsAppMessage(patientPhone, aiResponse.message);

        res.send("OK");
    } catch (err) {
        console.error("[WhatsApp Webhook]", err.message);
        res.send("OK");
    }
});

// Meta Webhook Verification (GET /api/webhook/whatsapp)
router.get("/", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

module.exports = router;
