import { defineConfig } from "@playwright/test";

import baseConfig from "./playwright.config";

/**
 * Accessibility test config.
 *
 * The base Playwright config sets `testDir: "./e2e"`, so running
 * `playwright test tests/accessibility/` against it resolves no files
 * ("No tests found") because the accessibility specs live outside `./e2e`.
 * This config repoints `testDir` at the accessibility suite while inheriting
 * the base `webServer`, `baseURL`, reporters, and chromium project.
 */
export default defineConfig({
  ...baseConfig,
  testDir: "./tests/accessibility",
});
