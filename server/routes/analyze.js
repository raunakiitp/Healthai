const express = require("express");
const router = express.Router();
const { analyzeSymptoms } = require("../services/geminiService");

// Sample cases for "Try Sample Case" button
const SAMPLE_CASES = [
  {
    symptoms: ["Chest Pain", "Shortness of Breath", "Sweating"],
    severity: 8,
    duration: "30 minutes",
    age: 52,
    gender: "male",
    freeText: "Sharp pain radiating to left arm",
  },
  {
    symptoms: ["Fever", "Headache", "Body Aches", "Fatigue"],
    severity: 5,
    duration: "2 days",
    age: 28,
    gender: "female",
    freeText: "Mild chills and runny nose",
  },
  {
    symptoms: ["Headache", "Nausea", "Sensitivity to Light"],
    severity: 6,
    duration: "4 hours",
    age: 35,
    gender: "male",
    freeText: "Throbbing pain on one side of head",
  },
];

// POST /api/analyze — Main analysis endpoint
router.post("/", async (req, res) => {
  try {
    const { symptoms, severity, duration, age, gender, freeText } = req.body;

    // Validation
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      if (!freeText || !freeText.trim()) {
        return res.status(400).json({
          error: "Please provide at least one symptom",
        });
      }
    }

    if (severity === undefined || severity < 1 || severity > 10) {
      return res.status(400).json({
        error: "Severity must be between 1 and 10",
      });
    }

    const result = await analyzeSymptoms({
      symptoms: symptoms || [],
      severity: Number(severity),
      duration: duration || "Not specified",
      age: age || "Not specified",
      gender: gender || "Not specified",
      freeText: freeText || "",
    });

    res.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Internal server error during analysis" });
  }
});

// GET /api/analyze/sample — Returns a random sample case
router.get("/sample", (req, res) => {
  const sample = SAMPLE_CASES[Math.floor(Math.random() * SAMPLE_CASES.length)];
  res.json(sample);
});

module.exports = router;
