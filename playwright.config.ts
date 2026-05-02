// Playwright config — Chromium-only, dev-server-driven E2E suite.
//
// We use port 3000 (the default `next dev` port) and reuse any existing
// server. Next 16 refuses to start a second dev server inside the same
// project directory — even on a different port — so a worktree-isolated
// alternate-port setup wouldn't help. The trade-off: running tests will
// share whatever dev server you already have warm; if none is running,
// Playwright boots one via `npm run dev`.
//
// On CI we use `next start` against a prebuilt app (no Next-dev lock).

import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI
      ? `npm run start -- -p ${PORT}`
      : `npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
