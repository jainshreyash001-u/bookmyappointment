/**
 * routes/auth.js
 * ──────────────────────────────────────────────────
 * Authentication routes:
 * - Signup
 * - Login
 * - Google Calendar OAuth callback
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { createDentist, getDentistByEmail } = require("../services/airtable");
const { initializeDentistNamespace } = require("../services/pinecone");
const { sendWhatsAppMessage } = require("../services/whatsapp");
const { createDentistSlackInvite } = require("../services/slack");

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
    const { email, clinicName, phoneNumber, workingHours, slackMode, password } = req.body;

    if (!email || !clinicName) {
        return res.status(400).json({ error: "Email and clinic name are required" });
    }

    try {
        // Check if dentist already exists
        const existing = await getDentistByEmail(email);
        if (existing) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create dentist ID
        const dentistId = `DT_${uuidv4().substring(0, 8).toUpperCase()}`;

        // Create dentist in Airtable
        const dentist = await createDentist({
            DentistID: dentistId,
            Name: clinicName,
            Email: email,
            WhatsAppNumber: phoneNumber,
            ClinicName: clinicName,
            WorkingHours: JSON.stringify(workingHours || {}),
            SubscriptionStatus: "trial", // 14 day free trial
            TrialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            SlackNotificationMode: slackMode,
        });

        // Initialize Pinecone namespace for this dentist
        await initializeDentistNamespace(dentistId);

        // Send welcome WhatsApp message
        await sendWhatsAppMessage(phoneNumber, `Welcome to BookMyAppointment! Your clinic ${clinicName} has been activated. Start receiving appointments via WhatsApp! 🦷`);

        // Get Slack invite URL
        const slackInviteUrl = await createDentistSlackInvite(dentist);

        // Create JWT token
        const token = jwt.sign(
            { dentistId, email, clinicName },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            token,
            dentist: {
                dentistId,
                email,
                clinicName,
            },
            nextSteps: {
                connectCalendar: "/setup",
                installSlack: slackInviteUrl,
                addKnowledge: "/knowledge",
            },
        });
    } catch (err) {
        console.error("[Signup]", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const dentist = await getDentistByEmail(email);
        if (!dentist) {
            return res.status(401).json({ error: "Dentist not found" });
        }

        const token = jwt.sign(
            { dentistId: dentist.fields.DentistID, email: dentist.fields.Email },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            token,
            dentist: {
                dentistId: dentist.fields.DentistID,
                email: dentist.fields.Email,
                clinicName: dentist.fields.ClinicName,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/google/callback
router.get("/google/callback", async (req, res) => {
    const { code, state } = req.query;

    try {
        const { getCalendarClient, exchangeCodeForTokens } = require("../services/calendar");
        const { updateDentist } = require("../services/airtable");

        const dentistId = state;
        const tokens = await exchangeCodeForTokens(code);

        // Store tokens in Airtable
        const dentist = await require("../services/airtable").getDentistById(dentistId);
        await updateDentist(dentist.id, {
            GoogleCalendarToken: JSON.stringify(tokens),
            GoogleCalendarId: "primary",
        });

        res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>✅ Google Calendar Connected!</h1>
          <p>Your Google Calendar has been successfully connected.</p>
          <p>Close this window and return to the app.</p>
          <script>window.close();</script>
        </body>
      </html>
    `);
    } catch (err) {
        console.error("[OAuth Callback]", err);
        res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Error</h1>
          <p>${err.message}</p>
        </body>
      </html>
    `);
    }
});

module.exports = router;