const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All history routes require authentication
router.use(authMiddleware);

// ─── GET /api/history ─────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const rows = db
      .prepare(
        "SELECT id, input_data, result_data, created_at FROM analysis_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
      )
      .all(req.user.id);

    const history = rows.map((row) => ({
      id: row.id,
      timestamp: row.created_at,
      input: JSON.parse(row.input_data),
      result: JSON.parse(row.result_data),
    }));

    res.json({ history });
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ error: "Could not fetch history" });
  }
});

// ─── POST /api/history ────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const { input, result } = req.body;
    if (!input || !result) {
      return res.status(400).json({ error: "input and result are required" });
    }

    const id = uuidv4();
    db.prepare(
      "INSERT INTO analysis_history (id, user_id, input_data, result_data) VALUES (?, ?, ?, ?)"
    ).run(id, req.user.id, JSON.stringify(input), JSON.stringify(result));

    res.status(201).json({ id, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Save history error:", err);
    res.status(500).json({ error: "Could not save history entry" });
  }
});

// ─── DELETE /api/history/:id ──────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM analysis_history WHERE id = ? AND user_id = ?")
      .run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete history error:", err);
    res.status(500).json({ error: "Could not delete entry" });
  }
});

// ─── DELETE /api/history ──────────────────────────────────────────────────────
router.delete("/", (req, res) => {
  try {
    db.prepare("DELETE FROM analysis_history WHERE user_id = ?").run(req.user.id);
    res.json({ message: "History cleared" });
  } catch (err) {
    console.error("Clear history error:", err);
    res.status(500).json({ error: "Could not clear history" });
  }
});

// ─── GET /api/history/stats ───────────────────────────────────────────────────
router.get("/stats", (req, res) => {
  try {
    const total = db
      .prepare("SELECT COUNT(*) as count FROM analysis_history WHERE user_id = ?")
      .get(req.user.id).count;

    const rows = db
      .prepare("SELECT result_data FROM analysis_history WHERE user_id = ?")
      .all(req.user.id);

    const riskCounts = { low: 0, medium: 0, high: 0 };
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.result_data);
        const level = parsed.risk_level;
        if (level in riskCounts) riskCounts[level]++;
      } catch {}
    }

    res.json({ total, riskCounts });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Could not fetch stats" });
  }
});

module.exports = router;
