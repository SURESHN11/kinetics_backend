const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Temporary memory vault for OTPs
const otpVault = new Map();

// --- ROUTE 1: REQUEST SECURE CODE ---
router.post('/request-otp', async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: "Mobile number is required." });
  }

  // Generate a mock 6-digit code. 
  const otpCode = "123456"; 
  otpVault.set(phone, otpCode);

  // Print the receipt to the terminal
  console.log(`\n=========================================`);
  console.log(`[SECURE SMS] Send to +91 ${phone}`);
  console.log(`[SECURE SMS] Code: ${otpCode}`);
  console.log(`=========================================\n`);

  res.json({ message: "Secure code dispatched." });
});

// --- ROUTE 2: VERIFY CODE & LOGIN ---
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;

  if (otpVault.get(phone) !== code) {
    return res.status(401).json({ error: "Invalid or expired secure code." });
  }

  otpVault.delete(phone);

  const vipPass = jwt.sign(
    { phone: phone }, 
    process.env.JWT_SECRET || 'fitfuelhub_super_secret_master_key_2026', 
    { expiresIn: '30d' }
  );

  res.json({
    message: "Identity verified. Welcome Athlete.",
    token: vipPass,
    user: {
      phone: phone,
      isPremium: false
    }
  });
});

module.exports = router;