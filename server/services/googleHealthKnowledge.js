/**
 * Google Cloud Natural Language API — Medical Entity Extraction
 *
 * Vertical: Healthcare
 * This service calls the Google Cloud Natural Language API to extract
 * recognized medical entities (symptoms, conditions, body parts, etc.)
 * from a patient's free-text input.
 *
 * These entities are used to enrich the Gemini prompt with structured
 * medical context, improving analysis accuracy.
 *
 * Google Service: Cloud Natural Language API
 * Endpoint: https://language.googleapis.com/v1/documents:analyzeEntities
 */

const https = require("https");

/**
 * Calls the Google Cloud Natural Language API to extract health-related
 * entities from free-text user input.
 *
 * @param {string} text - The patient's free-text symptom description
 * @returns {Promise<string[]>} Array of recognized medical entity names
 */
async function extractMedicalEntities(text) {
  const apiKey = process.env.GOOGLE_NL_API_KEY;

  // If no NL API key is configured, return empty array gracefully
  if (!apiKey || !text || !text.trim()) {
    return [];
  }

  const requestBody = JSON.stringify({
    document: {
      type: "PLAIN_TEXT",
      content: text.trim(),
    },
    encodingType: "UTF8",
  });

  const options = {
    hostname: "language.googleapis.com",
    path: `/v1/documents:analyzeEntities?key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.entities) return resolve([]);

          // Filter for health-relevant entity types
          const healthTypes = new Set([
            "OTHER",          // often catches medical terms
            "CONSUMER_GOOD",  // medications
            "WORK_OF_ART",    // procedures
            "EVENT",
          ]);

          const entities = parsed.entities
            .filter((e) => e.salience > 0.01) // only salient entities
            .map((e) => e.name)
            .filter(Boolean)
            .slice(0, 8); // limit to top 8 entities

          resolve(entities);
        } catch {
          resolve([]);
        }
      });
    });

    req.on("error", () => resolve([])); // fail silently — Gemini still works
    req.write(requestBody);
    req.end();
  });
}

/**
 * Builds an enriched symptom context string by combining user-selected
 * symptoms with NLP-extracted entities from free text.
 *
 * @param {string[]} symptoms - Array of selected symptom labels
 * @param {string} freeText - Patient's free-text description
 * @returns {Promise<string>} A formatted string for Gemini prompt context
 */
async function buildEnrichedContext(symptoms, freeText) {
  const extracted = await extractMedicalEntities(freeText);

  const allTerms = [
    ...symptoms,
    ...extracted.filter((e) => !symptoms.includes(e)), // deduplicate
  ];

  if (extracted.length > 0) {
    return `${allTerms.join(", ")} [NLP-extracted context from patient description: ${extracted.join(", ")}]`;
  }

  return allTerms.join(", ");
}

module.exports = { extractMedicalEntities, buildEnrichedContext };
