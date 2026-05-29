require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const mongoose = require('mongoose'); // NEW: The MongoDB Engine

// Initialize the Express Server
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Expose the Local Data Lake so Flutter can see the images
app.use('/uploads', express.static('uploads'));

// --- ROUTE ENGINES ---
const fuelRoutes = require('./fuel_routes');
app.use('/api/fuel', fuelRoutes);

const authRoutes = require('./auth_routes');
app.use('/api/auth', authRoutes);

const profileRoutes = require('./profile_routes');
app.use('/api/profile', profileRoutes);

const logsRoutes = require('./logs_routes');
app.use('/api/logs', logsRoutes);

const programRoutes = require('./program_routes');
app.use('/api/program', programRoutes);

const libraryRoutes = require('./library_routes');
app.use('/api/library', libraryRoutes);


// --- DATABASE BRIDGES (HYBRID ARCHITECTURE) ---

// 1. PostgreSQL Database Bridge (For Users, Logs, and App Data)
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.connect()
  .then(() => console.log('🔵 SUCCESS: Connected to PostgreSQL (User Data)'))
  .catch(err => console.error('🔴 Postgres Connection Error:', err.stack));

// 2. MongoDB Atlas Bridge (The Centralized Biomechanics Vault)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 SUCCESS: Connected to the Kinetics MongoDB Vault!'))
  .catch((err) => console.log('🔴 FATAL ERROR: MongoDB connection failed.', err));


// A simple test route to verify the app is working
app.get('/', (req, res) => {
  res.send('Kinetics Backend is Live and Ready!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Kinetics Enterprise Server running on port ${PORT}`);
});