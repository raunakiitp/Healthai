require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { apiLimiter } = require("./middleware/rateLimiter");
const analyzeRouter = require("./routes/analyze");
const authRouter = require("./routes/auth");
const historyRouter = require("./routes/history");
const adminRouter = require("./routes/admin");

// Initialize DB on startup
require("./db/database");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting on API routes
app.use("/api/", apiLimiter);

// Routes
app.use("/api/analyze", analyzeRouter);
app.use("/api/auth", authRouter);
app.use("/api/history", historyRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "HealthAI Backend",
    timestamp: new Date().toISOString(),
    gemini: process.env.GEMINI_API_KEY ? "configured" : "missing - add to .env",
    auth: "enabled",
    db: "sqlite",
  });
});
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production" || process.env.SERVE_STATIC === "true") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
} else {
  // 404 for dev mode where frontend is separate
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
}

app.listen(PORT, () => {
  console.log(`\n🏥 HealthAI Backend running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: /api/auth/register | /api/auth/login`);
  console.log(`📂 History: /api/history`);
  console.log(`👑 Admin panel: /api/admin (admin@healthai.com / admin@123)`);
  console.log(
    `🤖 Gemini API: ${process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Missing key in .env"}\n`
  );
});
