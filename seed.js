const mongoose = require('mongoose');
const fs = require('fs');
const ExerciseBlueprint = require('./models/ExerciseBlueprint');
require('dotenv').config(); // Load variables from .env

async function seedDatabase() {
  console.log("🚀 Starting Seeding Process...");
  
  try {
    // 1. Connect
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // 2. Read File
    const filePath = './exercises.json';
    if (!fs.existsSync(filePath)) {
      console.error("❌ ERROR: exercises.json not found in this folder!");
      return;
    }
    
    const exercisesRaw = fs.readFileSync(filePath, 'utf-8');
    const exercises = JSON.parse(exercisesRaw);
    console.log(`📦 Found ${exercises.length} exercises in JSON.`);

    // 3. Upload
    for (let exercise of exercises) {
      await ExerciseBlueprint.findOneAndUpdate(
        { exercise_id: exercise.exercise_id },
        exercise,
        { upsert: true, new: true }
      );
    }

    console.log("✅ Vault Seeding Complete! The library is live.");
    process.exit();
  } catch (error) {
    console.error("❌ CRITICAL SEED ERROR:", error);
    process.exit(1);
  }
}

seedDatabase();