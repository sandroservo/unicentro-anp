import { defineConfig, devices } from "@playwright/test";

// E2E smoke por marco. App roda em :3001 (nginx ocupa :3000).
// Specs vivem em tests/e2e; adicionados por módulo (spec-first).
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- -p 3001",
    url: "http://localhost:3001/login",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
