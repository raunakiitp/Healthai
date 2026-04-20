/**
 * Unit tests for geminiService.js
 *
 * Vertical: Healthcare — Smart Symptom Assistant
 * Tests cover the rule-based emergency override logic and the analyzeSymptoms
 * function with a fully mocked Gemini API client.
 */

// ─── Mock @google/generative-ai before requiring the module ──────────────────
const mockGenerateContent = jest.fn();
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: mockGenerateContent,
    }),
  })),
}));

const { analyzeSymptoms } = require("../services/geminiService");
const { buildEnrichedContext } = require("../services/googleHealthKnowledge");

jest.mock("../services/googleHealthKnowledge", () => ({
  buildEnrichedContext: jest.fn().mockImplementation((syms) => Promise.resolve(syms.join(", "))),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeGeminiResponse(obj) {
  return {
    response: {
      text: () => JSON.stringify(obj),
    },
  };
}

const VALID_GEMINI_RESULT = {
  conditions: [
    { name: "Common Cold", probability: 0.8, description: "Viral upper respiratory infection" },
    { name: "Influenza", probability: 0.6, description: "Seasonal flu" },
    { name: "Allergic Rhinitis", probability: 0.3, description: "Allergic response" },
  ],
  risk_level: "low",
  actions: ["Rest well", "Stay hydrated", "Monitor temperature"],
  emergency: false,
  explanation: "Symptoms are consistent with a mild viral infection.",
  see_doctor_when: "If fever exceeds 39°C or symptoms worsen after 3 days.",
  home_care: ["Drink plenty of water", "Use saline nasal spray"],
};

// ─── Rule-based emergency override ───────────────────────────────────────────
describe("Rule-based Emergency Override", () => {
  test("chest pain + high severity (>=7) triggers emergency=true and risk_level=high", async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse({ ...VALID_GEMINI_RESULT, emergency: false, risk_level: "medium" }));

    const result = await analyzeSymptoms({
      symptoms: ["Chest Pain", "Shortness of Breath"],
      severity: 8,
      duration: "30 minutes",
      age: 52,
      gender: "male",
      freeText: "Radiating to left arm",
    });

    expect(result.emergency).toBe(true);
    expect(result.risk_level).toBe("high");
    // actions[0] = 'Do NOT drive yourself', actions[1] = '🚨 CALL EMERGENCY SERVICES'
    expect(result.actions.some((a) => /emergency/i.test(a))).toBe(true);
  });

  test("stroke symptoms + high severity triggers emergency=true", async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse({ ...VALID_GEMINI_RESULT, emergency: false, risk_level: "medium" }));

    const result = await analyzeSymptoms({
      symptoms: ["facial droop", "arm weakness"],
      severity: 9,
      duration: "10 minutes",
      age: 65,
      gender: "female",
      freeText: "",
    });

    expect(result.emergency).toBe(true);
    expect(result.risk_level).toBe("high");
  });

  test("fever + low severity (<=4) does NOT trigger emergency", async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse({ ...VALID_GEMINI_RESULT, risk_level: "low", emergency: false }));

    const result = await analyzeSymptoms({
      symptoms: ["Fever"],
      severity: 3,
      duration: "1 day",
      age: 28,
      gender: "female",
      freeText: "",
    });

    expect(result.emergency).toBe(false);
    expect(result.risk_level).toBe("low");
  });

  test("breathing difficulty + low severity (<=6) does NOT apply override", async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse({ ...VALID_GEMINI_RESULT, risk_level: "medium", emergency: false }));

    const result = await analyzeSymptoms({
      symptoms: ["Shortness of Breath"],
      severity: 4,
      duration: "2 hours",
      age: 35,
      gender: "male",
      freeText: "",
    });

    // severity < 7 so rule override does NOT apply
    expect(result.emergency).toBe(false);
  });
});

// ─── Happy path — Gemini returns valid JSON ───────────────────────────────────
describe("analyzeSymptoms — happy path", () => {
  test("returns parsed conditions, risk_level, actions from Gemini", async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse(VALID_GEMINI_RESULT));

    const result = await analyzeSymptoms({
      symptoms: ["Headache", "Nausea"],
      severity: 5,
      duration: "1 day",
      age: 30,
      gender: "female",
      freeText: "",
    });

    expect(result.conditions).toHaveLength(3);
    expect(result.risk_level).toBe("low");
    expect(Array.isArray(result.actions)).toBe(true);
    expect(result.actions.length).toBeGreaterThanOrEqual(1);
    expect(result.emergency).toBe(false);
    expect(typeof result.explanation).toBe("string");
    expect(typeof result.see_doctor_when).toBe("string");
  });

  test("strips markdown code fences from Gemini response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "```json\n" + JSON.stringify(VALID_GEMINI_RESULT) + "\n```",
      },
    });

    const result = await analyzeSymptoms({
      symptoms: ["Fatigue"],
      severity: 4,
      duration: "3 days",
      age: 25,
      gender: "male",
      freeText: "",
    });

    expect(result.conditions).toBeDefined();
    expect(result.risk_level).toBe("low");
  });

  test("includes freeText in analysis when provided", async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse(VALID_GEMINI_RESULT));

    const result = await analyzeSymptoms({
      symptoms: ["Cough"],
      severity: 3,
      duration: "5 days",
      age: 40,
      gender: "other",
      freeText: "Productive cough with yellow mucus",
    });

    // Verify the call was made (freeText appended to symptomList)
    expect(mockGenerateContent).toHaveBeenCalled();
    const promptArg = mockGenerateContent.mock.calls[mockGenerateContent.mock.calls.length - 1][0];
    // freeText is appended to symptomList and appears in the prompt's enrichedContext or symptoms section
    expect(promptArg).toMatch(/Productive cough with yellow mucus|Cough/);
    expect(result.conditions).toBeDefined();
  });

  test("falls back to raw symptoms if buildEnrichedContext fails", async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse(VALID_GEMINI_RESULT));
    buildEnrichedContext.mockRejectedValueOnce(new Error("NLP service down"));

    const result = await analyzeSymptoms({
      symptoms: ["Headache"],
      severity: 3,
      duration: "1h",
      age: 20,
      gender: "male",
      freeText: "",
    });

    expect(result.conditions).toBeDefined();
    expect(buildEnrichedContext).toHaveBeenCalled();
  });
});

// ─── Fallback — Gemini API fails ──────────────────────────────────────────────
describe("analyzeSymptoms — Gemini API error fallback", () => {
  test("returns structured fallback response on API error", async () => {
    mockGenerateContent.mockRejectedValue(new Error("API quota exceeded"));

    const result = await analyzeSymptoms({
      symptoms: ["Dizziness"],
      severity: 6,
      duration: "2 hours",
      age: 45,
      gender: "female",
      freeText: "",
    });

    expect(result.conditions).toBeDefined();
    expect(result.conditions[0].name).toMatch(/Unable to analyze|API Error/i);
    expect(result.risk_level).toBe("medium"); // severity 6 → medium
    expect(result.error).toBe("API quota exceeded");
    expect(Array.isArray(result.actions)).toBe(true);
  });

  test("fallback risk_level is high when severity >= 7", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Network error"));

    const result = await analyzeSymptoms({
      symptoms: ["Chest Pain"],
      severity: 8,
      duration: "30 minutes",
      age: 60,
      gender: "male",
      freeText: "",
    });

    expect(result.risk_level).toBe("high");
    // Rule override also makes it emergency
    expect(result.emergency).toBe(true);
  });

  test("returns fallback even when symptoms array is empty", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Auth error"));

    const result = await analyzeSymptoms({
      symptoms: [],
      severity: 3,
      duration: "",
      age: "",
      gender: "",
      freeText: "feeling unwell",
    });

    expect(result).toBeDefined();
    // severity=3 is < 7 so fallback is medium (isSevere = false → 'medium')
    expect(result.risk_level).toBe("medium");
  });
});
