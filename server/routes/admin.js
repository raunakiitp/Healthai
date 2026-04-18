const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();
router.use(adminMiddleware);

const SAFE_FIELDS = "id, email, username, avatar_color, role, is_banned, last_login, created_at, updated_at";

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
// Overall platform statistics
router.get("/stats", (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
    const activeToday = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE last_login >= datetime('now', '-1 day') AND role = 'user'"
    ).get().count;
    const totalAnalyses = db.prepare("SELECT COUNT(*) as count FROM analysis_history").get().count;
    const bannedUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_banned = 1").get().count;
    const newUsersWeek = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days') AND role = 'user'"
    ).get().count;

    // Risk level breakdown across all analyses
    const allResults = db.prepare("SELECT result_data FROM analysis_history").all();
    const riskCounts = { low: 0, medium: 0, high: 0 };
    for (const r of allResults) {
      try { const p = JSON.parse(r.result_data); if (p.risk_level in riskCounts) riskCounts[p.risk_level]++; } catch {}
    }

    // Analyses per day (last 7 days)
    const dailyAnalyses = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM analysis_history
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all();

    res.json({ totalUsers, activeToday, totalAnalyses, bannedUsers, newUsersWeek, riskCounts, dailyAnalyses });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Could not fetch stats" });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// List all users with their analysis counts
router.get("/users", (req, res) => {
  try {
    const search = req.query.search || "";
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const users = db.prepare(`
      SELECT u.${SAFE_FIELDS.split(", ").join(", u.")},
             COUNT(h.id) as analysis_count
      FROM users u
      LEFT JOIN analysis_history h ON h.user_id = u.id
      WHERE (u.email LIKE ? OR u.username LIKE ?)
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(`%${search}%`, `%${search}%`, limit, offset);

    const total = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE email LIKE ? OR username LIKE ?"
    ).get(`%${search}%`, `%${search}%`).count;

    res.json({ users, total });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────
// Get one user + their full history
router.get("/users/:id", (req, res) => {
  try {
    const user = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const history = db.prepare(
      "SELECT id, input_data, result_data, created_at FROM analysis_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
    ).all(req.params.id).map(r => ({
      id: r.id,
      timestamp: r.created_at,
      input: JSON.parse(r.input_data),
      result: JSON.parse(r.result_data),
    }));

    res.json({ user, history });
  } catch (err) {
    console.error("Admin get user error:", err);
    res.status(500).json({ error: "Could not fetch user" });
  }
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete("/users/:id", (req, res) => {
  try {
    const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.id === req.user.id) return res.status(400).json({ error: "Cannot delete your own account" });
    if (user.role === "admin") return res.status(400).json({ error: "Cannot delete another admin" });

    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Admin delete error:", err);
    res.status(500).json({ error: "Could not delete user" });
  }
});

// ─── POST /api/admin/users/:id/ban ────────────────────────────────────────────
router.post("/users/:id/ban", (req, res) => {
  try {
    const user = db.prepare("SELECT id, role, is_banned FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.id === req.user.id) return res.status(400).json({ error: "Cannot ban yourself" });
    if (user.role === "admin") return res.status(400).json({ error: "Cannot ban an admin" });

    const newBanned = user.is_banned ? 0 : 1;
    db.prepare("UPDATE users SET is_banned = ? WHERE id = ?").run(newBanned, req.params.id);
    res.json({ is_banned: newBanned, message: newBanned ? "User banned" : "User unbanned" });
  } catch (err) {
    console.error("Admin ban error:", err);
    res.status(500).json({ error: "Could not update ban status" });
  }
});

// ─── POST /api/admin/users/:id/promote ────────────────────────────────────────
router.post("/users/:id/promote", (req, res) => {
  try {
    const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.id === req.user.id) return res.status(400).json({ error: "Cannot change your own role" });

    const newRole = user.role === "admin" ? "user" : "admin";
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(newRole, req.params.id);
    res.json({ role: newRole, message: `User ${newRole === "admin" ? "promoted to admin" : "demoted to user"}` });
  } catch (err) {
    console.error("Admin promote error:", err);
    res.status(500).json({ error: "Could not update role" });
  }
});

// ─── DELETE /api/admin/users/:id/history ─────────────────────────────────────
router.delete("/users/:id/history", (req, res) => {
  try {
    db.prepare("DELETE FROM analysis_history WHERE user_id = ?").run(req.params.id);
    res.json({ message: "User history cleared" });
  } catch (err) {
    console.error("Admin clear history error:", err);
    res.status(500).json({ error: "Could not clear user history" });
  }
});

// ─── POST /api/admin/users/create ─────────────────────────────────────────────
router.post("/users/create", async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ error: "All fields are required" });
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const id = uuidv4();
    db.prepare("INSERT INTO users (id, email, username, password, role) VALUES (?, ?, ?, ?, ?)")
      .run(id, email.toLowerCase(), username.trim(), hashed, role === "admin" ? "admin" : "user");

    const newUser = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(id);
    res.status(201).json({ user: newUser });
  } catch (err) {
    console.error("Admin create user error:", err);
    res.status(500).json({ error: "Could not create user" });
  }
});

// ─── GET /api/admin/activity ──────────────────────────────────────────────────
// Recent system-wide activity feed
router.get("/activity", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT h.id, h.created_at, h.result_data,
             u.username, u.email, u.avatar_color
      FROM analysis_history h
      JOIN users u ON u.id = h.user_id
      ORDER BY h.created_at DESC
      LIMIT 30
    `).all();

    const feed = rows.map(r => {
      let riskLevel = "unknown";
      try { riskLevel = JSON.parse(r.result_data).risk_level; } catch {}
      return {
        id: r.id,
        timestamp: r.created_at,
        username: r.username,
        email: r.email,
        avatarColor: r.avatar_color,
        riskLevel,
      };
    });
    res.json({ feed });
  } catch (err) {
    console.error("Activity feed error:", err);
    res.status(500).json({ error: "Could not fetch activity" });
  }
});

module.exports = router;
