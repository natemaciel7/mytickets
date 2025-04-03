module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  setupFiles: ["dotenv/config"],
  testMatch: ["**/tests/**/*.test.ts"],
};
