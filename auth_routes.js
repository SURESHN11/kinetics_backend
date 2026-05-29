const express = require('express');
const router = express.Router();

// --- DEMO OVERRIDE: BYPASS POSTGRES & SMS ---

router.post('/request-otp', (req, res) => {
    console.log(`🚀 [DEMO MODE] Fake OTP request logged.`);
    res.status(200).json({ message: 'Override active.' });
});

router.post('/verify-otp', (req, res) => {
    console.log(`🚀 [DEMO MODE] Generating VIP token.`);
    res.status(200).json({ 
        token: "vip_founder_token_12345", 
        message: 'Login successful' 
    });
});

module.exports = router;