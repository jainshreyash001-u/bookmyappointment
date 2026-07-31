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
const { createDentist, getDentistByEmail, updateDentist } = require("../services/database");
const { initializeDentistNamespace } = require("../services/knowledge");
const { sendWhatsAppMessage } = require("../services/whatsapp");
const { createDentistSlackInvite } = require("../services/slack");
const bcrypt = require("bcryptjs");

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
    const { email, clinicName, phoneNumber, workingHours, slackMode, password } = req.body;

    if (!email || !clinicName) {
        return res.status(400).json({ error: "Email and clinic name are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        // Check if dentist already exists
        const existing = await getDentistByEmail(normalizedEmail);
        if (existing) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create dentist ID
        const dentistId = `DT_${uuidv4().substring(0, 8).toUpperCase()}`;

        // Hash password
        let passwordHash = null;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        } else {
            passwordHash = await bcrypt.hash("test_password_123", 10);
        }

        // Create dentist in Database
        const dentist = await createDentist({
            DentistID: dentistId,
            Name: clinicName,
            Email: normalizedEmail,
            WhatsAppNumber: phoneNumber,
            ClinicName: clinicName,
            WorkingHours: JSON.stringify(workingHours || {}),
            SubscriptionStatus: "trial", // 14 day free trial
            TrialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            SlackNotificationMode: slackMode,
            PasswordHash: passwordHash,
        });

        // Initialize knowledge namespace for this dentist
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
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const dentist = await getDentistByEmail(normalizedEmail);
        if (!dentist) {
            return res.status(401).json({ error: "Dentist not found" });
        }

        // Verify password
        const passwordHash = dentist.fields.PasswordHash;
        if (passwordHash) {
            const isMatch = await bcrypt.compare(password, passwordHash);
            if (!isMatch) {
                return res.status(401).json({ error: "Incorrect password" });
            }
        } else {
            // Auto-setup password for legacy database records that have no stored password hash
            const newHash = await bcrypt.hash(password, 10);
            await updateDentist(dentist.id, {
                PasswordHash: newHash
            });
            console.log(`[Auth] Auto-set password hash for legacy dentist ${dentist.fields.Email}`);
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
        const { updateDentist } = require("../services/database");

        const dentistId = state;
        const tokens = await exchangeCodeForTokens(code);

        // Store tokens in Database
        const dentist = await require("../services/database").getDentistById(dentistId);
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

// In-memory OTP storage
const otpStore = {}; // { email: { code, expiresAt } }

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const dentist = await getDentistByEmail(normalizedEmail);
        if (!dentist) {
            return res.status(404).json({ error: "This email is not registered. Please sign up first." });
        }

        // Generate 6-digit code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store in memory with 15-minute expiration
        otpStore[normalizedEmail] = {
            code: otpCode,
            expiresAt: Date.now() + 15 * 60 * 1000,
        };

        // Send via SendGrid
        const { sendOTPEmail } = require("../services/email");
        await sendOTPEmail(normalizedEmail, otpCode);

        res.json({ success: true, message: "Verification code sent to your email" });
    } catch (err) {
        console.error("[Forgot Password Error]", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, code, and new password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const dentist = await getDentistByEmail(normalizedEmail);
        if (!dentist) {
            return res.status(404).json({ error: "Dentist not found" });
        }

        const record = otpStore[normalizedEmail];
        if (!record) {
            return res.status(400).json({ error: "No verification code was sent to this email" });
        }

        if (record.code !== otp.trim()) {
            return res.status(400).json({ error: "Incorrect verification code" });
        }

        if (Date.now() > record.expiresAt) {
            delete otpStore[normalizedEmail];
            return res.status(400).json({ error: "Verification code has expired" });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        // Update in database
        await updateDentist(dentist.id, {
            PasswordHash: passwordHash,
        });

        // Clean up OTP store
        delete otpStore[normalizedEmail];

        res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        console.error("[Verify OTP Error]", err);
        res.status(500).json({ error: err.message });
    }
});

// Auth middleware for authenticated auth routes
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

// POST /api/auth/change-password
router.post("/change-password", auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
    }

    try {
        const { getDentistById } = require("../services/database");
        const dentist = await getDentistById(req.dentist.dentistId);
        if (!dentist) return res.status(404).json({ error: "Dentist not found" });

        // Get stored hash
        const passwordHash = dentist.fields.PasswordHash;
        if (!passwordHash) {
            return res.status(400).json({ error: "Please log out and use Forgot Password to initialize your password first." });
        }

        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect current password" });
        }

        // Hash new password
        const newHash = await bcrypt.hash(newPassword, 10);

        // Update database
        await updateDentist(dentist.id, {
            PasswordHash: newHash,
        });

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("[Change Password Error]", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;