const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const SAFE_FIELDS = "id, email, username, avatar_color, role, is_banned, last_login, created_at, updated_at";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ error: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email address" });

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();
    db.prepare("INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)")
      .run(id, email.toLowerCase(), username.trim(), hashedPassword);

    const newUser = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(id);
    const token = signToken(newUser);
    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    if (user.is_banned)
      return res.status(403).json({ error: "This account has been banned. Contact support." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
    const safeUser = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(user.id);
    const token = signToken(safeUser);
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authMiddleware, (req, res) => {
  const user = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put("/profile", authMiddleware, (req, res) => {
  try {
    const { username, avatar_color } = req.body;
    const updates = [];
    const values = [];
    if (username && username.trim()) { updates.push("username = ?"); values.push(username.trim()); }
    if (avatar_color) { updates.push("avatar_color = ?"); values.push(avatar_color); }
    if (updates.length === 0) return res.status(400).json({ error: "Nothing to update" });
    updates.push("updated_at = datetime('now')");
    values.push(req.user.id);
    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    const updated = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(req.user.id);
    res.json({ user: updated });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Could not update profile" });
  }
});

// ─── PUT /api/auth/change-password ───────────────────────────────────────────
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both fields are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });
    const hashed = await bcrypt.hash(newPassword, 12);
    db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?").run(hashed, req.user.id);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Could not change password" });
  }
});

module.exports = router;
