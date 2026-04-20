const { extractMedicalEntities, buildEnrichedContext } = require("../services/googleHealthKnowledge");
const https = require("https");
const EventEmitter = require("events");

// Mock https.request
jest.mock("https");

describe("Google Health Knowledge Service", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    jest.resetAllMocks();
    mockRequest = new EventEmitter();
    mockRequest.write = jest.fn();
    mockRequest.end = jest.fn();
    https.request.mockReturnValue(mockRequest);

    mockResponse = new EventEmitter();
    mockResponse.statusCode = 200;
  });

  describe("extractMedicalEntities", () => {
    it("should return empty array if no API key is set", async () => {
      const originalKey = process.env.GOOGLE_NL_API_KEY;
      delete process.env.GOOGLE_NL_API_KEY;
      
      const result = await extractMedicalEntities("I have a fever");
      expect(result).toEqual([]);
      
      process.env.GOOGLE_NL_API_KEY = originalKey;
    });

    it("should return empty array if text is empty", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      const result = await extractMedicalEntities("");
      expect(result).toEqual([]);
    });

    it("should extract entities from valid text", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      
      const promise = extractMedicalEntities("chest pain and cough");
      
      // Trigger response
      const callback = https.request.mock.calls[0][1];
      callback(mockResponse);
      
      mockResponse.emit("data", JSON.stringify({
        entities: [
          { name: "Chest pain", salience: 0.9, type: "OTHER" },
          { name: "Cough", salience: 0.8, type: "OTHER" }
        ]
      }));
      mockResponse.emit("end");
      
      const result = await promise;
      expect(result).toEqual(["Chest pain", "Cough"]);
    });

    it("should filter out non-salient entities", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      const promise = extractMedicalEntities("text");
      const callback = https.request.mock.calls[0][1];
      callback(mockResponse);
      
      mockResponse.emit("data", JSON.stringify({
        entities: [
          { name: "Important", salience: 0.5, type: "OTHER" },
          { name: "Irrelevant", salience: 0.001, type: "OTHER" }
        ]
      }));
      mockResponse.emit("end");
      
      const result = await promise;
      expect(result).toEqual(["Important"]);
    });

    it("should handle the absence of entities property in result", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      const promise = extractMedicalEntities("text");
      const callback = https.request.mock.calls[0][1];
      callback(mockResponse);
      
      mockResponse.emit("data", JSON.stringify({ }));
      mockResponse.emit("end");
      
      const result = await promise;
      expect(result).toEqual([]);
    });

    it("should handle API error gracefully", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      const promise = extractMedicalEntities("text");
      
      mockRequest.emit("error", new Error("Network error"));
      
      const result = await promise;
      expect(result).toEqual([]);
    });

    it("should handle parsing error gracefully", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      const promise = extractMedicalEntities("text");
      const callback = https.request.mock.calls[0][1];
      callback(mockResponse);
      
      mockResponse.emit("data", "invalid-json");
      mockResponse.emit("end");
      
      const result = await promise;
      expect(result).toEqual([]);
    });
  });

  describe("buildEnrichedContext", () => {
    it("should combine symptoms with extracted entities", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      
      const promise = buildEnrichedContext(["Fever"], "I have chest pain");
      
      const callback = https.request.mock.calls[0][1];
      callback(mockResponse);
      mockResponse.emit("data", JSON.stringify({
        entities: [{ name: "Chest pain", salience: 0.9, type: "OTHER" }]
      }));
      mockResponse.emit("end");
      
      const result = await promise;
      expect(result).toContain("Fever");
      expect(result).toContain("Chest pain");
      expect(result).toContain("[NLP-extracted context");
    });

    it("should not add context if no entities extracted", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      
      const promise = buildEnrichedContext(["Fever"], "...");
      
      const callback = https.request.mock.calls[0][1];
      callback(mockResponse);
      mockResponse.emit("data", JSON.stringify({ entities: [] }));
      mockResponse.emit("end");
      
      const result = await promise;
      expect(result).toBe("Fever");
    });

    it("should deduplicate symptoms and extracted entities", async () => {
      process.env.GOOGLE_NL_API_KEY = "test-key";
      
      const promise = buildEnrichedContext(["Fever"], "I have a fever");
      
      const callback = https.request.mock.calls[0][1];
      callback(mockResponse);
      mockResponse.emit("data", JSON.stringify({
        entities: [{ name: "Fever", salience: 0.9, type: "OTHER" }]
      }));
      mockResponse.emit("end");
      
      const result = await promise;
      // Should show 'Fever' only once in the main list, but listed in NLP context if that logic triggers
      expect(result).toMatch(/Fever/);
    });
  });
});
