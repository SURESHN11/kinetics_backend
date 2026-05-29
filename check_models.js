require('dotenv').config();

async function findMyModels() {
  try {
    console.log("Connecting to Google's servers...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    console.log("\n--- YOUR APPROVED GOOGLE AI MODELS ---");
    data.models.forEach(model => {
      // We only want models that can actually generate content
      if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
        console.log(model.name);
      }
    });
    console.log("--------------------------------------\n");
  } catch (error) {
    console.error("Diagnostic failed:", error);
  }
}

findMyModels();