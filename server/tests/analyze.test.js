// ─── Mock uuid (uuid v13 ships ESM-only dist; use a simple CJS mock) ─────────
jest.mock("uuid", () => ({
  v4: () => "00000000-0000-0000-0000-000000000000",
}));

// ─── Mock Gemini service (not Google APIs in integration tests) ───────────────
jest.mock("../services/geminiService", () => ({
  analyzeSymptoms: jest.fn().mockResolvedValue({
    conditions: [
      { name: "Common Cold", probability: 0.85, description: "Viral infection" },
    ],
    risk_level: "low",
    actions: ["Rest", "Hydrate", "Monitor temperature"],
    emergency: false,
    explanation: "Mild symptoms consistent with a cold.",
    see_doctor_when: "If symptoms worsen after 48 hours.",
    home_care: ["Rest", "Drink fluids"],
  }),
}));

// ─── Mock DB initialization ───────────────────────────────────────────────────
jest.mock("../db/database", () => ({}));

// ─── Mock rate limiter (bypass for tests) ────────────────────────────────────
jest.mock("../middleware/rateLimiter", () => ({
  apiLimiter: (req, res, next) => next(),
}));

const request = require("supertest");
const app = require("../app");
const { analyzeSymptoms } = require("../services/geminiService");

// ─── Health check ─────────────────────────────────────────────────────────────
describe("GET /health", () => {
  test("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("HealthAI Backend");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

// ─── POST /api/analyze ────────────────────────────────────────────────────────
describe("POST /api/analyze", () => {
  const validBody = {
    symptoms: ["Headache", "Fatigue"],
    severity: 5,
    duration: "2 days",
    age: 30,
    gender: "female",
    freeText: "",
  };

  test("returns 200 and analysis result for valid body", async () => {
    const res = await request(app).post("/api/analyze").send(validBody);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.conditions)).toBe(true);
    expect(res.body.risk_level).toBe("low");
    expect(Array.isArray(res.body.actions)).toBe(true);
    expect(typeof res.body.emergency).toBe("boolean");
  });

  test("accepts freeText only (no symptoms array required)", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ symptoms: [], severity: 4, freeText: "I feel very tired and dizzy" });
    expect(res.statusCode).toBe(200);
    expect(res.body.conditions).toBeDefined();
  });

  test("returns 400 when symptoms AND freeText are both missing", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ symptoms: [], severity: 5, freeText: "" });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/symptom/i);
  });

  test("returns 400 when symptoms is not an array", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ symptoms: "headache", severity: 5 });
    expect(res.statusCode).toBe(400);
  });

  test("returns 400 when severity is missing", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ symptoms: ["Fever"] });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/severity/i);
  });

  test("returns 400 when severity is out of range (< 1)", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ symptoms: ["Fever"], severity: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/severity/i);
  });

  test("returns 400 when severity is out of range (> 10)", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ symptoms: ["Fever"], severity: 11 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/severity/i);
  });

  test("calls analyzeSymptoms with correct parameters", async () => {
    analyzeSymptoms.mockClear();
    await request(app).post("/api/analyze").send(validBody);
    expect(analyzeSymptoms).toHaveBeenCalledTimes(1);
    const args = analyzeSymptoms.mock.calls[0][0];
    expect(args.symptoms).toEqual(["Headache", "Fatigue"]);
    expect(args.severity).toBe(5);
    expect(args.duration).toBe("2 days");
    expect(args.age).toBe(30);
    expect(args.gender).toBe("female");
  });

  test("handles analysySymptoms internal error gracefully (returns 500)", async () => {
    analyzeSymptoms.mockRejectedValueOnce(new Error("Unexpected failure"));
    const res = await request(app).post("/api/analyze").send(validBody);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

// ─── GET /api/analyze/sample ──────────────────────────────────────────────────
describe("GET /api/analyze/sample", () => {
  test("returns 200 with a valid sample case object", async () => {
    const res = await request(app).get("/api/analyze/sample");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.symptoms)).toBe(true);
    expect(res.body.symptoms.length).toBeGreaterThan(0);
    expect(typeof res.body.severity).toBe("number");
    expect(res.body.severity).toBeGreaterThanOrEqual(1);
    expect(res.body.severity).toBeLessThanOrEqual(10);
    expect(typeof res.body.duration).toBe("string");
    expect(typeof res.body.age).toBe("number");
    expect(typeof res.body.gender).toBe("string");
  });

  test("returns different samples across several calls (random selection)", async () => {
    const results = new Set();
    for (let i = 0; i < 30; i++) {
      const res = await request(app).get("/api/analyze/sample");
      results.add(JSON.stringify(res.body));
    }
    // With 3 sample cases, 30 calls should yield at least 2 different results
    expect(results.size).toBeGreaterThan(1);
  });
});

// ─── Security headers ─────────────────────────────────────────────────────────
describe("Security Headers", () => {
  test("includes X-Content-Type-Options header", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("includes X-Frame-Options header", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-frame-options"]).toBeDefined();
  });
});

// ─── Input sanitization ───────────────────────────────────────────────────────
describe("Input Sanitization", () => {
  test("strips HTML/script tags from freeText before analysis", async () => {
    analyzeSymptoms.mockClear();
    await request(app).post("/api/analyze").send({
      symptoms: ["Fever"],
      severity: 5,
      freeText: "<script>alert('xss')</script> feeling feverish",
    });
    if (analyzeSymptoms.mock.calls.length > 0) {
      const args = analyzeSymptoms.mock.calls[0][0];
      expect(args.freeText).not.toMatch(/<script>/i);
    }
  });
});
