module.exports = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  transformIgnorePatterns: [
    "/node_modules/(?!axios)"
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
}