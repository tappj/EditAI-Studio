import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  timeout: 180000,
  use: {
    actionTimeout: 15000,
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:5180",
    channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
    headless: true,
    acceptDownloads: true,
    launchOptions: {
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--autoplay-policy=no-user-gesture-required",
      ],
    },
  },
  workers: 1,
  reporter: "list",
  outputDir: "outputs/test-results",
});
