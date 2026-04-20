const request = require("supertest");
const app = require("../app");
const db = require("../db/database");
const admin = require("../config/firebase-admin");

describe("Admin Routes", () => {
  const ADMIN_USER = {
    id: "test-auth-uid", // Aligned with jest.setup.js
    email: "admin@test.com",
    username: "Admin Tester",
    role: "admin"
  };

  const REGULAR_USER = {
    id: "regular-user-123",
    email: "user@test.com",
    username: "Regular User",
    role: "user"
  };

  beforeAll(() => {
    // Clean start for test users (Delete by ID and Email)
    db.prepare("DELETE FROM users WHERE id IN (?, ?) OR email IN (?, ?)").run(
      ADMIN_USER.id, REGULAR_USER.id, 
      ADMIN_USER.email, REGULAR_USER.email
    );
    
    // Ensure users exist with correct roles
    db.prepare("INSERT INTO users (id, email, username, password, role) VALUES (?, ?, ?, ?, ?)")
      .run(ADMIN_USER.id, ADMIN_USER.email, ADMIN_USER.username, "no-pass", "admin");
    db.prepare("INSERT INTO users (id, email, username, password, role) VALUES (?, ?, ?, ?, ?)")
      .run(REGULAR_USER.id, REGULAR_USER.email, REGULAR_USER.username, "no-pass", "user");
  });

  beforeEach(() => {
    // Default mock as Admin
    admin.auth().verifyIdToken.mockResolvedValue({
      uid: ADMIN_USER.id,
      email: ADMIN_USER.email,
    });
  });

  describe("Security Constraints", () => {
    it("should block non-admin users from admin routes", async () => {
      admin.auth().verifyIdToken.mockResolvedValue({
        uid: REGULAR_USER.id,
        email: REGULAR_USER.email,
      });

      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(403); // Forbidden
    });
  });

  describe("GET /api/admin/users", () => {
    it("should list all users for admin", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.some(u => u.id === REGULAR_USER.id)).toBe(true);
    });
  });

  describe("POST /api/admin/users/:id/ban", () => {
    it("should toggle ban status for a regular user", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${REGULAR_USER.id}/ban`)
        .set("Authorization", "Bearer mock-token");
      
      expect(res.status).toBe(200);
      
      const user = db.prepare("SELECT is_banned FROM users WHERE id = ?").get(REGULAR_USER.id);
      expect(user.is_banned).toBe(1);
    });

    it("should not allow admin to ban themselves", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${ADMIN_USER.id}/ban`)
        .set("Authorization", "Bearer mock-token")
        .send({ isBanned: true });
      
      expect(res.status).toBe(400); // Bad Request
    });
  });

  describe("GET /api/admin/stats", () => {
    it("should return system-wide stats for admin", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", "Bearer mock-token");

      expect(res.status).toBe(200);
      expect(res.body.totalUsers).toBeDefined();
      expect(res.body.totalAnalyses).toBeDefined();
    });
  });
});
