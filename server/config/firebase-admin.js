const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

/**
 * Initializes Firebase Admin SDK.
 * 
 * Logic:
 * 1. Look for service account at the path specified in FIREBASE_SERVICE_ACCOUNT_PATH env var.
 * 2. If file missing, log a warning (server won't verify tokens but will still start).
 * 3. Fallback to ENV variables for Cloud Run/Production if file is not preferred.
 */

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json";
const absolutePath = path.isAbsolute(serviceAccountPath) 
    ? serviceAccountPath 
    : path.join(__dirname, "..", serviceAccountPath);

if (fs.existsSync(absolutePath)) {
    try {
        const serviceAccount = require(absolutePath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Admin initialized via service account file.");
    } catch (err) {
        console.error("❌ Error loading Firebase service account file:", err.message);
    }
} else {
    // Fallback logic for environments without a service account file
    // (e.g. using individual env vars for private key, client email, project id)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.VITE_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
        console.log("✅ Firebase Admin initialized via environment variables.");
    } else {
        console.warn("⚠️ Firebase Admin NOT initialized. Authorization will fail.");
        console.warn("   Missing service account file at:", absolutePath);
    }
}

module.exports = admin;
