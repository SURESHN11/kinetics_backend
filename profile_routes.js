const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Simulated PostgreSQL Database Table for Profiles (Keyed by Phone Number)
const userDatabase = new Map();

// SECURITY MIDDLEWARE: The Bouncer
// This checks the VIP Pass before letting anyone Read or Update data
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Access Denied. No VIP Pass." });
  
  const token = authHeader.split(' ')[1]; // Extracts the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fitfuelhub_super_secret_master_key_2026');
    req.user = decoded; // Attaches the phone number to the request
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired VIP Pass." });
  }
};

// CRUD: READ (Fetch the user's profile)
router.get('/', authenticate, (req, res) => {
  const phone = req.user.phone;
  // Fetch from DB, or create a default profile if they are brand new
  const profile = userDatabase.get(phone) || { name: "Suresh N", phone: phone, isPremium: true };
  res.json(profile);
});

// CRUD: UPDATE (Change the user's name)
router.put('/', authenticate, (req, res) => {
  const phone = req.user.phone;
  const { name } = req.body;
  
  const existingProfile = userDatabase.get(phone) || { phone: phone, isPremium: true };
  const updatedProfile = { ...existingProfile, name: name };
  
  // Save the updated profile back into the vault
  userDatabase.set(phone, updatedProfile);
  
  console.log(`[PROFILE UPDATED] Athlete ${phone} changed name to: ${name}`);
  res.json({ message: "Profile synchronized.", profile: updatedProfile });
});

module.exports = router;