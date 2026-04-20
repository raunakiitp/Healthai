const express = require("express");
const db = require("../db/database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const SAFE_FIELDS = "id, email, username, avatar_color, role, is_banned, last_login, created_at, updated_at";

/**
 * ─── POST /api/auth/firebase-sync ─────────────────────────────────────────────
 * Syncs a Firebase user with the local SQLite database.
 * Called by the frontend immediately after a successful Firebase login/signup.
 * 
 * Verifies the token via authMiddleware (which attaches req.user).
 * If the user doesn't exist in SQLite, it creates a new record.
 */
router.post("/firebase-sync", authMiddleware, async (req, res) => {
  try {
    const { id, email, name } = req.user; // Attached by authMiddleware from Firebase token

    // 1. Check if user exists in local DB
    let user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

    if (!user) {
      // 2. If not, check if an old JWT user exists with the same email to link them
      user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

      if (user) {
        // Link existing record by updating ID to Firebase UID
        db.prepare("UPDATE users SET id = ?, updated_at = datetime('now') WHERE email = ?")
          .run(id, email.toLowerCase());
        console.log(`🔗 Linked existing email ${email} to Firebase UID ${id}`);
      } else {
        // Create brand new record
        db.prepare("INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)")
          .run(id, email.toLowerCase(), name || email.split('@')[0], "FIREBASE_MANAGED");
        console.log(`✨ Created new local record for Firebase user: ${email}`);
      }
      
      // Fetch the updated/new user record
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    }

    if (user.is_banned) {
      return res.status(403).json({ error: "This account has been banned. Contact support." });
    }

    // 3. Update last login
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(id);

    const safeUser = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(id);
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Firebase sync error:", err);
    res.status(500).json({ error: "Failed to sync user data with server" });
  }
});

/**
 * ─── GET /api/auth/me ─────────────────────────────────────────────────────────
 * Returns current user's full profile.
 * Identity is derived from the Firebase ID token in authMiddleware.
 */
router.get("/me", authMiddleware, (req, res) => {
  try {
    const user = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(req.user.id);
    if (!user) return res.status(404).json({ error: "User profile not found in database" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

/**
 * ─── PUT /api/auth/profile ────────────────────────────────────────────────────
 * Updates username or avatar_color.
 */
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

// Note: /register, /login, and /change-password are removed as identity is now managed by Firebase.
// Legacy endpoints return 410 Gone to indicate the migration.
router.all(["/register", "/login", "/change-password"], (req, res) => {
  res.status(410).json({ 
    error: "Legacy authentication is disabled.",
    message: "This application now uses Firebase Authentication. Please use the /firebase-sync endpoint."
  });
});

module.exports = router;
