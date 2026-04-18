const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rule-based emergency override
function applyRuleBasedFallback(symptoms, severity) {
  const symLower = symptoms.map((s) => s.toLowerCase());
  const hasChestPain = symLower.some((s) => s.includes("chest"));
  const hasFever = symLower.some((s) => s.includes("fever"));
  const hasBreathing = symLower.some(
    (s) => s.includes("breath") || s.includes("breathing")
  );
  const hasStroke = symLower.some(
    (s) =>
      s.includes("stroke") ||
      s.includes("facial droop") ||
      s.includes("arm weakness")
  );

  if ((hasChestPain || hasBreathing || hasStroke) && severity >= 7) {
    return { emergency: true, risk_level: "high" };
  }
  if (hasFever && severity <= 4) {
    return { emergency: false, risk_level: "low" };
  }
  return null;
}

async function analyzeSymptoms({ symptoms, severity, duration, age, gender, freeText }) {
  const symptomList = [...symptoms];
  if (freeText && freeText.trim()) {
    symptomList.push(freeText.trim());
  }

  const ruleOverride = applyRuleBasedFallback(symptomList, severity);

  const prompt = `You are a medical AI assistant. A patient has provided the following information:
  
- Symptoms: ${symptomList.join(", ")}
- Severity (1-10): ${severity}
- Duration: ${duration}
- Age: ${age}
- Gender: ${gender}

Based on this information, provide a thorough analysis. You MUST respond ONLY with a valid JSON object matching this exact schema:

{
  "conditions": [
    { "name": "Condition Name", "probability": 0.85, "description": "Brief description" }
  ],
  "risk_level": "low" | "medium" | "high",
  "actions": [
    "Action step 1",
    "Action step 2"
  ],
  "emergency": false,
  "explanation": "Simple plain-language explanation of reasoning in 3-5 sentences.",
  "see_doctor_when": "Description of when to seek medical care",
  "home_care": ["Home care tip 1", "Home care tip 2"]
}

Rules:
- Include 3-5 possible conditions ranked by probability (0.0 to 1.0)
- risk_level must be exactly "low", "medium", or "high"
- emergency must be true ONLY if symptoms suggest immediate danger (chest pain + high severity, difficulty breathing, stroke symptoms, etc.)
- actions must include 3-6 practical recommended steps
- Keep language simple, empathetic, and non-alarming unless truly warranted
- DO NOT prescribe specific medications or exact dosages
- Always include a note that this is AI guidance, not a medical diagnosis
- Respond ONLY with the JSON object, no markdown, no preamble`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    // Apply rule-based override if applicable
    if (ruleOverride) {
      parsed.emergency = ruleOverride.emergency;
      parsed.risk_level = ruleOverride.risk_level;
      if (ruleOverride.emergency) {
        parsed.actions.unshift("🚨 CALL EMERGENCY SERVICES (911) IMMEDIATELY");
        parsed.actions.unshift("Do NOT drive yourself — call for ambulance");
      }
    }

    return parsed;
  } catch (err) {
    console.error("Gemini API error:", err.message);

    // Fallback response if Gemini fails
    const isSevere = severity >= 7;
    return {
      conditions: [
        {
          name: "Unable to analyze – API Error",
          probability: 0,
          description: "Could not connect to AI service. Please check your API key.",
        },
      ],
      risk_level: isSevere ? "high" : "medium",
      actions: [
        "Please consult a healthcare professional",
        "If symptoms are severe, seek emergency care",
        "Monitor your symptoms closely",
      ],
      emergency: ruleOverride ? ruleOverride.emergency : false,
      explanation:
        "AI analysis is currently unavailable. Please consult a medical professional for proper diagnosis.",
      see_doctor_when: "If symptoms worsen or persist beyond 24 hours",
      home_care: ["Rest", "Stay hydrated", "Monitor temperature"],
      error: err.message,
    };
  }
}

module.exports = { analyzeSymptoms };
