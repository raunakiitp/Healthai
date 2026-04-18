const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "healthai.db");

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    email        TEXT UNIQUE NOT NULL,
    username     TEXT NOT NULL,
    password     TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#6366f1',
    role         TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    is_banned    INTEGER DEFAULT 0,
    last_login   TEXT,
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS analysis_history (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    input_data  TEXT NOT NULL,
    result_data TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Migrate: add missing columns if upgrading from old schema
const userCols = db.pragma("table_info(users)").map((c) => c.name);
if (!userCols.includes("role"))
  db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
if (!userCols.includes("is_banned"))
  db.exec("ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0");
if (!userCols.includes("last_login"))
  db.exec("ALTER TABLE users ADD COLUMN last_login TEXT");

// ─── Seed default admin user if not exists ───────────────────────────────────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@healthai.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123";
const ADMIN_USERNAME = "Admin";

const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(ADMIN_EMAIL);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 12);
  const id = uuidv4();
  db.prepare(
    "INSERT INTO users (id, email, username, password, role, avatar_color) VALUES (?, ?, ?, ?, 'admin', '#ef4444')"
  ).run(id, ADMIN_EMAIL, ADMIN_USERNAME, hashedPassword);
  console.log(`🔑 Admin account created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

module.exports = db;
