module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: "tsconfig.test.json",
      useESM: false,
    }],
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js",
    "^leaflet$": "<rootDir>/__mocks__/leafletMock.js",
    "^../services/vehicle.service$": "<rootDir>/src/__mocks__/vehicle.service.ts",
    "^../../services/vehicle.service$": "<rootDir>/src/__mocks__/vehicle.service.ts"
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.cjs"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  transformIgnorePatterns: [
    "/node_modules/(?!axios)"
  ],
}