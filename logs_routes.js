const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// 1. CONFIGURE THE LOCAL DATA LAKE (MULTER)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 2. THE NEW NESTED DATABASE SCHEMA
// Keyed by Phone -> Date -> { workoutLog, intakeLog, sessionMetrics, bodyMeasurements, progressPhotos }
const logsVault = new Map();

// Security Bouncer
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Access Denied." });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'fitfuelhub_super_secret_master_key_2026');
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid VIP Pass." });
  }
};

// GET: Fetch the entire history
router.get('/', authenticate, (req, res) => {
  const phone = req.user.phone;
  const userLogs = logsVault.get(phone) || {};
  res.json(userLogs);
});

// POST (IMAGE): Catch physical files and return the local URL
router.post('/upload-image', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image file detected." });
  
  // Create the URL that Flutter will use to display the image
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  console.log(`[DATA LAKE] Image Saved: ${fileUrl}`);
  
  res.json({ url: fileUrl });
});

// POST (DATA): Save JSON data to the specific day's nested structure
router.post('/save', authenticate, (req, res) => {
  const phone = req.user.phone;
  const { date, section, data } = req.body; 
  // 'section' will be one of: workoutLog, intakeLog, sessionMetrics, bodyMeasurements, progressPhotos
  
  if (!logsVault.has(phone)) logsVault.set(phone, {});
  const userLogs = logsVault.get(phone);
  
  if (!userLogs[date]) userLogs[date] = {};
  
  // Merge the new data into the specific section
  userLogs[date][section] = { ...userLogs[date][section], ...data };
  
  logsVault.set(phone, userLogs);
  
  console.log(`\n[DATA MOAT] Updated '${section}' for ${date}`);
  res.json({ message: "Saved to Data Moat.", logs: userLogs[date] });
});

module.exports = router;