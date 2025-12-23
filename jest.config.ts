import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  roots: ["<rootDir>/src"],
};

export default config;