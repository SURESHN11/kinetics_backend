const express = require('express');
const router = express.Router();
const ExerciseBlueprint = require('./models/ExerciseBlueprint');

// POST: Fetch the Camera Math for a specific workout
router.post('/get-blueprints', async (req, res) => {
  try {
    // The Flutter app will send an array of names like: ["BARBELL BACK SQUAT", "OVERHEAD PRESS"]
    const { exerciseNames } = req.body;

    if (!exerciseNames || !Array.isArray(exerciseNames)) {
      return res.status(400).json({ error: "Please provide an array of exercise names." });
    }

    // Convert all names to uppercase so they match the database perfectly
    const upperCaseNames = exerciseNames.map(name => name.toUpperCase());

    // Search the Vault for these specific exercises
    const blueprints = await ExerciseBlueprint.find({
      name: { $in: upperCaseNames }
    });

    // Package the math into a clean dictionary for the Flutter camera
    const trackingDictionary = {};
    blueprints.forEach(bp => {
      trackingDictionary[bp.name] = bp.tracking_engine;
    });

    res.status(200).json({
      message: "Blueprints fetched successfully",
      matchedCount: blueprints.length,
      trackingDictionary: trackingDictionary
    });

  } catch (error) {
    console.error("Vault Access Error:", error);
    res.status(500).json({ error: "Failed to fetch biomechanics blueprints from the Vault." });
  }
});

module.exports = router;