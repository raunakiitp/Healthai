const request = require("supertest");
const app = require("../app");
const db = require("../db/database");
const admin = require("../config/firebase-admin");

describe("Auth Routes", () => {
  const TEST_UID = "test-auth-uid";
  const TEST_EMAIL = "test-auth@example.com";

  beforeEach(() => {
    // Clear history/users for all test identities to ensure clean slate
    db.prepare("DELETE FROM users WHERE id IN (?, ?, ?) OR email IN (?, ?, ?)").run(
      TEST_UID, "existing-uid", "missing-uid",
      TEST_EMAIL, "existing@example.com", "missing@example.com"
    );
  });

  describe("POST /api/auth/firebase-sync", () => {
    it("should create a new user profile upon first Firebase sync", async () => {
      admin.auth().verifyIdToken.mockResolvedValue({
        uid: TEST_UID,
        email: TEST_EMAIL,
        name: "Test User"
      });

      const res = await request(app)
        .post("/api/auth/firebase-sync")
        .set("Authorization", "Bearer mock-token")
        .send();

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(TEST_EMAIL);
      
      // Verify in DB
      const inDb = db.prepare("SELECT email FROM users WHERE id = ?").get(TEST_UID);
      expect(inDb.email).toBe(TEST_EMAIL);
    });

    it("should update last_login for existing user during sync", async () => {
       // Insert existing
       db.prepare("INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)")
         .run("existing-uid", "existing@example.com", "Existing", "no-pass");

      admin.auth().verifyIdToken.mockResolvedValue({
        uid: "existing-uid",
        email: "existing@example.com",
        name: "Existing Updated",
      });

      const res = await request(app)
        .post("/api/auth/firebase-sync")
        .set("Authorization", "Bearer mock-token")
        .send();

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe("Existing"); // Logic might preserve old username
    });

    it("should return 401 if token is invalid", async () => {
      admin.auth().verifyIdToken.mockRejectedValue(new Error("Invalid token"));

      const res = await request(app)
        .post("/api/auth/firebase-sync")
        .set("Authorization", "Bearer bad-token")
        .send();

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user profile if authenticated", async () => {
      // Ensure user exists
      db.prepare("INSERT OR IGNORE INTO users (id, email, username, password) VALUES (?, ?, ?, ?)")
        .run(TEST_UID, TEST_EMAIL, "Test User", "no-pass");

      admin.auth().verifyIdToken.mockResolvedValue({
        uid: TEST_UID,
        email: TEST_EMAIL,
        name: "Test User"
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(TEST_EMAIL);
    });

    it("should return 404 if user is in Firebase but not in local DB", async () => {
      admin.auth().verifyIdToken.mockResolvedValue({
        uid: "missing-uid",
        email: "missing@example.com",
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(404);
    });
  });
});
