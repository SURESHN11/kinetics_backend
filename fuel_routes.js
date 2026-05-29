const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/analyze', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) return res.status(400).json({ error: "No image data received." });

    console.log("\n=========================================");
    console.log("[GEMINI ENGINE] Image received. Transmitting to Google...");

    // THE FIX: We lock the temperature to 0.0 for absolute mathematical consistency
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: {
        temperature: 0.0, // Zero creativity. Strict clinical calculation.
        topK: 1,
        topP: 0.1
      }
    });

    // THE FIX: Stricter Prompt Engineering
    const prompt = `You are a clinical sports nutritionist AI. Analyze this exact meal image. 
    Calculate the macronutrients with absolute mathematical precision using standard USDA nutritional databases.
    Do not guess. Do not estimate creatively. If presented with this exact image again, you MUST return these exact same numbers.
    You must strictly return ONLY a valid JSON object in this exact format, with no markdown, no backticks, and no other text:
    { "Protein": "0g", "Carbs": "0g", "Fat": "0g", "Fiber": "0g" }`;

    const imagePart = { inlineData: { data: imageBase64, mimeType: "image/jpeg" } };
    
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const macros = JSON.parse(cleanJsonString);

    console.log("[GEMINI SUCCESS] Clinical Macros Calculated:", macros);
    console.log("=========================================\n");
    
    res.json(macros);

  } catch (error) {
    console.error("[GEMINI ERROR] Failed to analyze meal:", error.message);
    res.status(500).json({ error: "Failed to analyze meal." });
  }
});

module.exports = router;