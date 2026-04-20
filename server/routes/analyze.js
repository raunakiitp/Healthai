const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
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
router.post(
  "/",
  [
    body("symptoms").optional().isArray().withMessage("Symptoms must be an array"),
    body("severity").isInt({ min: 1, max: 10 }).withMessage("Severity must be between 1 and 10"),
    body("freeText").optional().isString().trim().escape(),
    body("age").optional().custom((val) => val === "" || (Number(val) >= 0 && Number(val) <= 120)).withMessage("Valid age required"),
    body("gender").optional().isIn(["male", "female", "other", ""]).withMessage("Invalid gender selection"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { symptoms, severity, duration, age, gender, freeText } = req.body;

      // Business logic validation
      if ((!symptoms || symptoms.length === 0) && (!freeText || !freeText.trim())) {
        return res.status(400).json({
          error: "Please provide at least one symptom or a description",
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
  }
);

// GET /api/analyze/sample — Returns a random sample case
router.get("/sample", (req, res) => {
  const sample = SAMPLE_CASES[Math.floor(Math.random() * SAMPLE_CASES.length)];
  res.json(sample);
});

module.exports = router;
