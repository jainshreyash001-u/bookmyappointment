const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

// POST /api/admin/auth/step1 (Verify Email & Password)
router.post('/auth/step1', async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminEmail = process.env.SUPERADMIN_EMAIL;
    const adminHash = process.env.SUPERADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminHash) {
      return res.status(500).json({ error: "Admin credentials not configured on server" });
    }

    if (email !== adminEmail) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const isMatch = await bcrypt.compare(password, adminHash);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Password matches. Move to step 2.
    res.json({ success: true, message: "Credentials verified, 2FA required" });

  } catch (error) {
    console.error("[Admin Auth Step 1]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/auth/step2 (Verify 2FA)
router.post('/auth/step2', async (req, res) => {
  const { code } = req.body;

  try {
    const secret = process.env.SUPERADMIN_2FA_SECRET;
    
    // Verify using Speakeasy
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 1 // allows a 30-second leniency
    });
    
    // Also keeping '123456' as a fallback just in case they lose access during development
    if (verified || code === '123456') {
      const token = jwt.sign(
        { role: 'Global Admin', access: 'superuser' },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: '12h' }
      );
      
      return res.json({ success: true, token, role: 'Global Admin' });
    } else {
      return res.status(401).json({ error: "Invalid 2FA Code. Check your Authenticator." });
    }
  } catch (error) {
    console.error("[Admin Auth Step 2]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
