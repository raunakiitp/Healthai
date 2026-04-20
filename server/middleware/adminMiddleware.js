const authMiddleware = require("./authMiddleware");

async function adminMiddleware(req, res, next) {
  // First verify JWT and populate req.user
  try {
    await authMiddleware(req, res, () => {});
    
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
}

module.exports = adminMiddleware;
