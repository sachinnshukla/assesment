import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.proof.spec.ts",
  outputDir: "./test-results",
  reporter: "list",
  use: {
    baseURL: process.env.QA_BASE_URL,
    browserName: "chromium",
    channel: process.env.QA_BROWSER_CHANNEL || undefined,
    trace: "off",
    screenshot: "off",
  },
});
