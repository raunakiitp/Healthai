require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimiter");
const analyzeRouter = require("./routes/analyze");
const authRouter = require("./routes/auth");
const historyRouter = require("./routes/history");
const adminRouter = require("./routes/admin");

// Crash handler — makes startup errors visible in Cloud Logging
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled rejection:", reason);
  process.exit(1);
});

// Initialize DB on startup
try {
  require("./db/database");
  console.log("✅ Database initialized");
} catch (err) {
  console.error("[FATAL] Database init failed:", err);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Security: CORS allowlist (env-driven in production) ─────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin} not in allowlist`));
    },
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "img-src": ["'self'", "data:", "https://www.gstatic.com", "https://*.googleusercontent.com"],
        "connect-src": ["'self'", "https://prod.spline.design", "https://*.googleapis.com", "https://identitytoolkit.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "object-src": ["'none'"],
        "frame-src": ["'self'", "https://prod.spline.design", "https://*.firebaseapp.com"],
        "media-src": ["'self'"],
        "worker-src": ["'self'", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Security: Input sanitization middleware ──────────────────────────────────
// Strips HTML tags and script injection attempts from string fields
app.use((req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  };

  const sanitizeObject = (obj) => {
    if (typeof obj === "string") return sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
      );
    }
    return obj;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  next();
});

// Trust proxy (required for rate limiting behind Cloud Run / GCP Load Balancer)
app.set("trust proxy", 1);

// Rate limiting on API routes
app.use("/api/", apiLimiter);

// API Routes
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
    security: "helmet + cors-allowlist + input-sanitization + rate-limit",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// Serve React frontend static files
app.use(express.static(path.join(__dirname, "../client/dist")));

// Catch-all: serve React app for any non-API route (client-side routing)
// NOTE: Express v5 no longer supports bare "*" — must use regex
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Only listen when not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`\n🏥 HealthAI Backend running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth: /api/auth/register | /api/auth/login`);
    console.log(`📂 History: /api/history`);
    console.log(`👑 Admin panel: /api/admin`);
    console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Missing key in .env"}`);
    console.log(`🛡️ Security: helmet + CORS allowlist + input sanitization + rate limiting\n`);
  });
}

module.exports = app;
