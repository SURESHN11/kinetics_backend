require('dotenv').config();
const { Pool } = require('pg');

// Connect to the database using your hidden .env credentials
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const createTables = async () => {
  try {
    // Injecting the SQL commands to build the tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        subscription_tier VARCHAR(50) DEFAULT 'Standard',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workout_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_date DATE NOT NULL,
        total_reps INTEGER DEFAULT 0,
        average_form_score DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    pool.end(); // Close the connection once finished
  }
};

createTables();