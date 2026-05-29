const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the True Gemini Engine
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
    try {
      // THE FIX: Now catching the optional muscleGroup parameter
      const { experienceLevel, goal, muscleGroup } = req.body;
      
      if (!experienceLevel || !goal) {
        return res.status(400).json({ error: "Missing parameters." });
      }
  
      const targetText = muscleGroup ? `| Target: ${muscleGroup}` : "| Target: Full Body/General";
      console.log(`\n[PROGRAM ENGINE] Generating routine for: ${experienceLevel} | ${goal} ${targetText}`);
  
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { temperature: 0.2 } 
      });
  
      // THE FIX: Dynamically injecting the muscle focus into the prompt if the user selected one
      const musclePromptModifier = muscleGroup ? `specifically targeting the ${muscleGroup} muscle group` : "providing a well-rounded routine for this goal";
  
      const prompt = `You are an elite sports scientist AI for FitFuelHub. 
      Create a highly optimized, single-day gym workout routine for a ${experienceLevel} focusing on ${goal}, ${musclePromptModifier}.
      
      You MUST return ONLY a valid JSON object in this exact format. Do not use markdown formatting, do not use backticks, and do not include any other text:
      {
        "routineName": "String (e.g., Alpha Push Day)",
        "estimatedMinutes": "Number",
        "exercises": [
          {
            "name": "String",
            "sets": "Number",
            "reps": "String (e.g., 8-10)",
            "rest": "String (e.g., 60s)"
          }
        ]
      }`;
  
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const workoutPlan = JSON.parse(cleanJsonString);
  
      console.log("[PROGRAM SUCCESS] Routine Generated:", workoutPlan.routineName);
      console.log("=========================================\n");
      
      res.json(workoutPlan);
  
    } catch (error) {
      console.error("[PROGRAM ERROR] Failed to generate routine:", error.message);
      res.status(500).json({ error: "Failed to generate AI program." });
    }
  });

// THE ADAPTIVE AI: Conversational CRUD Engine
router.post('/edit-exercise', async (req, res) => {
    try {
      const { originalExercise, userCommand } = req.body;
      
      if (!originalExercise || !userCommand) {
        return res.status(400).json({ error: "Missing exercise data or command." });
      }
  
      console.log(`\n[ADAPTIVE AI] Modification requested: "${userCommand}"`);
      console.log(`[ADAPTIVE AI] Target: ${originalExercise.name}`);
  
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { temperature: 0.1 } // Extremely strict formatting
      });
  
      const prompt = `You are an elite sports scientist AI for FitFuelHub. 
      The user has been prescribed this specific exercise:
      ${JSON.stringify(originalExercise)}
      
      The user has given this command to modify the exercise: "${userCommand}"
      
      Apply the user's modification intelligently (e.g., swapping a barbell for dumbbells, reducing sets due to injury, changing reps).
      You MUST return ONLY a valid JSON object representing the UPDATED exercise in this exact format. No markdown, no backticks:
      {
        "name": "String",
        "sets": "Number",
        "reps": "String",
        "rest": "String"
      }`;
  
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean the JSON output
      const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const updatedExercise = JSON.parse(cleanJsonString);
  
      console.log("[ADAPTIVE AI SUCCESS] Exercise Modified:", updatedExercise.name);
      console.log("=========================================\n");
      
      res.json(updatedExercise);
  
    } catch (error) {
      console.error("[ADAPTIVE AI ERROR] Failed to modify exercise:", error.message);
      res.status(500).json({ error: "Failed to modify exercise." });
    }
  });

  // THE MANUAL UPLOAD ENGINE (PRD Section 3.2)
router.post('/upload-plan', async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "No image data provided." });
      }
  
      console.log(`\n[PROGRAM ENGINE] Analyzing uploaded trainer plan...`);
  
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { temperature: 0.1 }
      });
  
      const prompt = `You are an elite sports scientist AI. The user has uploaded an image of a workout routine (it could be handwritten, a screenshot, or a printed document). 
      Extract the exercises, sets, reps, and rest times from this image.
      
      You MUST return ONLY a valid JSON object in this exact format. Do not use markdown formatting or backticks:
      {
        "routineName": "Trainer Uploaded Routine",
        "estimatedMinutes": 60,
        "exercises": [
          {
            "name": "String",
            "sets": "Number",
            "reps": "String (e.g., 8-12)",
            "rest": "String (e.g., 60s)"
          }
        ]
      }`;
  
      // Pass both the text prompt and the image to Gemini
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
      ]);
      
      const responseText = result.response.text();
      const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const workoutPlan = JSON.parse(cleanJsonString);
  
      console.log("[PROGRAM SUCCESS] Trainer Routine Parsed Successfully!");
      console.log("=========================================\n");
      
      res.json(workoutPlan);
  
    } catch (error) {
      console.error("[PROGRAM ERROR] Failed to parse uploaded plan:", error.message);
      res.status(500).json({ error: "Failed to parse uploaded plan." });
    }
  });

module.exports = router;

