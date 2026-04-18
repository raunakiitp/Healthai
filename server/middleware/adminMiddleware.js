const authMiddleware = require("./authMiddleware");

function adminMiddleware(req, res, next) {
  // First verify JWT
  authMiddleware(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}

module.exports = adminMiddleware;
