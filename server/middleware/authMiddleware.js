const admin = require("../config/firebase-admin");

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
    
    // Attach user info to request
    // Note: Firebase uses 'uid', while our previous logic used 'id'.
    // We map uid -> id to maintain compatibility with existing controller logic.
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split('@')[0],
      picture: decodedToken.picture
    };
    
    next();
  } catch (err) {
    console.error("Firebase Auth Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired authentication token" });
  }
}

module.exports = authMiddleware;
