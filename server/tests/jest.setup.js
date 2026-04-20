// Centralized mocks for Jest testing environment

// Mock uuid v9/v11 ESM as CommonJS
jest.mock("uuid", () => ({
  v4: () => "test-uuid-1234",
}));

// Mock firebase-admin package globally
jest.mock("firebase-admin", () => {
  const mockAuth = {
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: "test-auth-uid",
      email: "test@example.com",
      name: "Test User",
      picture: "test-pic"
    }),
  };
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    auth: () => mockAuth,
  };
});

// Mock the internal wrapper as well to be safe
jest.mock("../config/firebase-admin", () => {
  const mockAuth = {
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: "test-auth-uid",
      email: "test@example.com",
      name: "Test User",
      picture: "test-pic"
    }),
  };
  return {
    auth: () => mockAuth,
  };
});
