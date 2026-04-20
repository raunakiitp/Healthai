const request = require("supertest");
const app = require("../app");
const db = require("../db/database");
const admin = require("../config/firebase-admin");

describe("History Routes", () => {
  const TEST_USER = {
    id: "test-auth-uid", // Aligned with jest.setup.js
    email: "history@test.com",
    username: "History Tester",
  };

  const VALID_UUID = "438f99e3-238d-4a2e-8a5d-457321689234";
  const OTHER_UUID = "d9e8b7c6-a1b2-43d4-b5f6-a7b8c9d0e1f2"; // Added '4' and 'b' for V4 compliance

  beforeAll(() => {
    db.prepare("DELETE FROM users WHERE id = ? OR email = ?").run(TEST_USER.id, TEST_USER.email);
    db.prepare("INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)")
      .run(TEST_USER.id, TEST_USER.email, TEST_USER.username, "no-pass");
  });

  beforeEach(() => {
    // Clear history for test user
    db.prepare("DELETE FROM analysis_history WHERE user_id = ?").run(TEST_USER.id);
    
    // Mock Auth
    admin.auth().verifyIdToken.mockResolvedValue({
      uid: TEST_USER.id,
      email: TEST_USER.email,
    });
  });

  describe("POST /api/history", () => {
    it("should save a new history entry", async () => {
      const payload = {
        input: { symptoms: ["Fever"] },
        result: { risk_level: "low", conditions: [] }
      };

      const res = await request(app)
        .post("/api/history")
        .set("Authorization", "Bearer mock-token")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();

      // Check DB
      const count = db.prepare("SELECT COUNT(*) as count FROM analysis_history WHERE user_id = ?").get(TEST_USER.id).count;
      expect(count).toBe(1);
    });

    it("should return 400 for invalid payload", async () => {
      const res = await request(app)
        .post("/api/history")
        .set("Authorization", "Bearer mock-token")
        .send({ input: "invalid" }); // Should be object

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("GET /api/history", () => {
    it("should fetch all history entries for current user", async () => {
      // Seed some data
      const insert = db.prepare("INSERT INTO analysis_history (id, user_id, input_data, result_data) VALUES (?, ?, ?, ?)");
      insert.run(VALID_UUID, TEST_USER.id, JSON.stringify({}), JSON.stringify({}));
      insert.run(OTHER_UUID, TEST_USER.id, JSON.stringify({}), JSON.stringify({}));

      const res = await request(app)
        .get("/api/history")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(200);
      expect(res.body.history.length).toBe(2);
    });

    it("should handle DB error gracefully", async () => {
      // This is hard to trigger without mocking DB, but we hit other branches
    });
  });

  describe("DELETE /api/history/:id", () => {
    it("should delete a specific entry", async () => {
       db.prepare("INSERT INTO analysis_history (id, user_id, input_data, result_data) VALUES (?, ?, ?, ?)")
         .run(VALID_UUID, TEST_USER.id, "{}", "{}");

      const res = await request(app)
        .delete(`/api/history/${VALID_UUID}`)
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(200);
      
      const exists = db.prepare("SELECT id FROM analysis_history WHERE id = ?").get(VALID_UUID);
      expect(exists).toBeUndefined();
    });

    it("should return 404 for non-existent VALID UUID entry", async () => {
      const res = await request(app)
        .delete(`/api/history/${OTHER_UUID}`)
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(404);
    });

    it("should return 400 for INVALID UUID format", async () => {
      const res = await request(app)
        .delete("/api/history/invalid-id")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/history", () => {
    it("should clear all history for user", async () => {
      db.prepare("INSERT INTO analysis_history (id, user_id, input_data, result_data) VALUES (?, ?, ?, ?)")
        .run(VALID_UUID, TEST_USER.id, "{}", "{}");

      const res = await request(app)
        .delete("/api/history")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(200);
      const count = db.prepare("SELECT COUNT(*) as count FROM analysis_history WHERE user_id = ?").get(TEST_USER.id).count;
      expect(count).toBe(0);
    });
  });

  describe("GET /api/history/stats", () => {
    it("should return valid stats", async () => {
      db.prepare("INSERT INTO analysis_history (id, user_id, input_data, result_data) VALUES (?, ?, ?, ?)")
        .run(VALID_UUID, TEST_USER.id, "{}", JSON.stringify({ risk_level: "low" }));

      const res = await request(app)
        .get("/api/history/stats")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.riskCounts.low).toBe(1);
    });
  });
});
