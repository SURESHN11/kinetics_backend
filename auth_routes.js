const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// --- DEMO OVERRIDE: BYPASS POSTGRES & SMS FOR GYM TESTING ---

// 1. Request Secure Code
router.post('/request-otp', (req, res) => {
    const { phone } = req.body;
    
    if (!phone || phone.length < 10) {
        return res.status(400).json({ error: 'Valid phone number required' });
    }

    console.log(`🚀 [DEMO MODE] Overriding SMS. Fake OTP request logged for ${phone}`);
    
    // Instantly return success to the phone without sending a real text
    res.status(200).json({ message: 'Override active. Code accepted.' });
});

// 2. Verify Identity & Generate VIP Pass
router.post('/verify-otp', (req, res) => {
    const { phone, code } = req.body;

    console.log(`🚀 [DEMO MODE] Bypassing PostgreSQL. Generating VIP token for ${phone}`);

    // Generate a secure JWT using the secret we added to Railway earlier
    const token = jwt.sign(
        { 
            userId: 'fitfuelhub_demo_user', 
            phone: phone, 
            role: 'founder' 
        },
        process.env.JWT_SECRET || 'Kinetics_FitFuelHub_Secure_Auth_Key_2026!*',
        { expiresIn: '30d' } // Keeps the app logged in for 30 days
    );

    // Smash the gate open
    res.status(200).json({ 
        token: token, 
        message: 'Login successful' 
    });
});

module.exports = router;
