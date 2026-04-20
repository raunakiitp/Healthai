const admin = require("../config/firebase-admin");
const db = require("../db/database");

/**
 * Middleware to verify Firebase ID tokens.
 * Replaces previous custom JWT verification.
 * 
 * Verifies the "Bearer <token>" header using Firebase Admin SDK.
 * Decoded token contains 'uid', 'email', and basic profile info.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No authentication token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify the ID token sent from the client
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch additional fields from local DB (like role, is_banned)
    const localUser = db.prepare("SELECT role, is_banned FROM users WHERE id = ?").get(decodedToken.uid);
    
    // Attach user info to request
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split('@')[0],
      picture: decodedToken.picture,
      role: localUser?.role || "user",
      is_banned: !!localUser?.is_banned
    };
    
    if (req.user.is_banned) {
      return res.status(403).json({ error: "Your account has been suspended" });
    }
    
    next();
  } catch (err) {
    console.error("Firebase Auth Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired authentication token" });
  }
}

module.exports = authMiddleware;
