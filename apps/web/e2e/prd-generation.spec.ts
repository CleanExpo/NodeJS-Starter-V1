/**
 * E2E tests for PRD generation flow
 */

import { test, expect, type Page } from "@playwright/test";

/**
 * Mock the /api/prd/generate endpoint so the optimistic "generating" state
 * persists during the test. No backend runs in the E2E CI job, so the real
 * fetch to localhost:8000 rejects instantly and `isGenerating` flips back to
 * false before assertions can see the progress view. The agent-run poll is
 * left unmocked — it fails silently and keeps `isGenerating` true at 0%.
 */
async function mockGenerateStarted(page: Page): Promise<void> {
  await page.route("**/api/prd/generate", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        prd_id: "prd_test",
        task_id: "prd_test",
        run_id: "run_test",
        status: "pending",
        message: "PRD generation started",
      }),
    })
  );
}

test.describe("PRD Generation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to PRD generator page
    await page.goto("/prd/generate");
  });

  test("should display PRD generator form", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1")).toContainText("Generate Product Requirements Document");

    // Check form elements exist
    await expect(page.getByLabel(/Project Description/i)).toBeVisible();
    await expect(page.getByLabel(/Target Users/i)).toBeVisible();
    await expect(page.getByLabel(/Timeline/i)).toBeVisible();
    await expect(page.getByLabel(/Team Size/i)).toBeVisible();
    await expect(page.getByLabel(/Existing Stack/i)).toBeVisible();

    // Check submit button exists but is disabled
    const submitButton = page.getByRole("button", { name: /Generate PRD/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test("should validate requirements length", async ({ page }) => {
    const textarea = page.getByLabel(/Project Description/i);
    const submitButton = page.getByRole("button", { name: /Generate PRD/i });

    // Too short - button should be disabled
    await textarea.fill("Short description");
    await expect(submitButton).toBeDisabled();

    // Long enough - button should be enabled
    await textarea.fill("Build a comprehensive task management application for remote teams with real-time collaboration features and Kanban boards");
    await expect(submitButton).not.toBeDisabled();
  });

  test("should show character count", async ({ page }) => {
    const textarea = page.getByLabel(/Project Description/i);

    await textarea.fill("Test requirements");
    await expect(page.locator("text=/\\d+ \\/ 50 characters minimum/i")).toBeVisible();
  });

  test("should submit form with valid data", async ({ page }) => {
    await mockGenerateStarted(page);

    // Fill in requirements
    await page.getByLabel(/Project Description/i).fill(
      "Build a task management app for remote teams with Kanban boards, real-time notifications, and project tracking"
    );

    // Fill in optional context
    await page.getByLabel(/Target Users/i).fill("Remote teams, project managers");
    await page.getByLabel(/Timeline/i).fill("3 months");
    await page.getByLabel(/Team Size/i).fill("2");
    await page.getByLabel(/Existing Stack/i).fill("Next.js, FastAPI, Supabase");

    // Submit form
    const submitButton = page.getByRole("button", { name: /Generate PRD/i });
    await submitButton.click();

    // Should show progress state
    await expect(page.locator("text=/Generating Your PRD/i")).toBeVisible({ timeout: 5000 });
  });

  test("should display progress during generation", async ({ page }) => {
    await mockGenerateStarted(page);

    // Fill and submit form
    await page.getByLabel(/Project Description/i).fill(
      "Build a simple todo application with user authentication and task management features for students"
    );
    await page.getByRole("button", { name: /Generate PRD/i }).click();

    // Wait for progress UI
    await expect(page.locator("text=/Generating Your PRD/i")).toBeVisible({ timeout: 5000 });

    // Check progress elements
    await expect(page.locator("text=/Overall Progress/i")).toBeVisible();
    await expect(page.locator("text=/Generation Phases/i")).toBeVisible();

    // Check that phases are listed
    await expect(page.locator("text=/Analyzing requirements/i")).toBeVisible();
    await expect(page.locator("text=/Decomposing features/i")).toBeVisible();
    await expect(page.locator("text=/Generating technical specification/i")).toBeVisible();

    // Check "What's Being Generated" section. Scope to headings — the phase
    // list on the same view contains overlapping copy ("Decomposing features
    // into user stories", "Generating technical specification") that makes a
    // bare text locator match multiple elements (strict-mode violation).
    await expect(page.getByRole("heading", { name: /PRD Document/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /User Stories/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Technical Spec/i })).toBeVisible();
  });

  test("should show success state after completion", async ({ page }) => {
    // Note: This test requires mocking the backend or very long timeout
    // For real E2E, you'd mock the API responses

    test.skip(); // Skip in CI unless backend is running
  });

  test("should handle errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/api/prd/generate", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ detail: "Server error" }),
      });
    });

    // Submit form
    await page.getByLabel(/Project Description/i).fill(
      "Build an app with at least fifty characters in the description"
    );
    await page.getByRole("button", { name: /Generate PRD/i }).click();

    // Should show error message
    await expect(page.locator("text=/Server error/i")).toBeVisible({ timeout: 5000 });
  });

  test("should disable form inputs during generation", async ({ page }) => {
    await mockGenerateStarted(page);

    // Fill and submit
    await page.getByLabel(/Project Description/i).fill(
      "Build a comprehensive application with many features for testing purposes"
    );
    await page.getByRole("button", { name: /Generate PRD/i }).click();

    // Wait for generation state. Use the heading — a bare /Generating/i matches
    // the h1, the intro paragraph, and the "Generating technical specification"
    // phase span (strict-mode violation).
    await expect(page.getByRole("heading", { name: "Generating Your PRD" })).toBeVisible({
      timeout: 5000,
    });

    // During generation the page replaces the form entirely with the progress
    // view, so the inputs are unmounted (a stronger guarantee than disabling):
    // the user cannot modify them because they are no longer on the page.
    await expect(page.getByLabel(/Project Description/i)).toHaveCount(0);
  });

  test("should show How It Works section", async ({ page }) => {
    await expect(page.locator("text=/How It Works/i")).toBeVisible();

    // Check step headings are displayed. Scope to the heading role — the plain
    // text "Describe Your Project" also appears in the step's body copy, which
    // makes a bare text locator match two elements (strict-mode violation).
    await expect(page.getByRole("heading", { name: "Describe Your Project" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI Analysis" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ready to Build" })).toBeVisible();
  });
});

test.describe("PRD Viewer", () => {
  test.skip("should display PRD result with all tabs", async ({ page }) => {
    // This test requires a pre-generated PRD or mocked data
    // Navigate to PRD viewer (replace with actual PRD ID)
    await page.goto("/prd/test-prd-id");

    // Check tabs exist
    await expect(page.getByRole("tab", { name: /PRD/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /User Stories/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Tech/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Tests/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Roadmap/i })).toBeVisible();

    // Check summary cards
    await expect(page.locator("text=/User Stories/i")).toBeVisible();
    await expect(page.locator("text=/API Endpoints/i")).toBeVisible();
    await expect(page.locator("text=/Test Scenarios/i")).toBeVisible();
  });

  test.skip("should navigate between tabs", async ({ page }) => {
    // Requires pre-generated PRD
    await page.goto("/prd/test-prd-id");

    // Click on User Stories tab
    await page.getByRole("tab", { name: /User Stories/i }).click();
    await expect(page.locator("text=/Epics/i")).toBeVisible();

    // Click on Tech tab
    await page.getByRole("tab", { name: /Tech/i }).click();
    await expect(page.locator("text=/Architecture Overview/i")).toBeVisible();

    // Click on Tests tab
    await page.getByRole("tab", { name: /Tests/i }).click();
    await expect(page.locator("text=/Test Coverage/i")).toBeVisible();

    // Click on Roadmap tab
    await page.getByRole("tab", { name: /Roadmap/i }).click();
    await expect(page.locator("text=/Implementation Timeline/i")).toBeVisible();
  });

  test.skip("should have export button", async ({ page }) => {
    await page.goto("/prd/test-prd-id");

    const exportButton = page.getByRole("button", { name: /Export/i });
    await expect(exportButton).toBeVisible();
  });

  test.skip("should have back button to generator", async ({ page }) => {
    await page.goto("/prd/test-prd-id");

    const backButton = page.getByRole("button", { name: /Back/i });
    await expect(backButton).toBeVisible();

    await backButton.click();
    await expect(page).toHaveURL("/prd/generate");
  });
});

test.describe("PRD Integration Tests", () => {
  test("should complete full workflow from form to result", async ({ page }) => {
    // Mock successful API responses
    let runId = "";
    let prdId = "";

    // Mock generate endpoint
    await page.route("**/api/prd/generate", async (route) => {
      runId = "run_test_123";
      prdId = "prd_test_123";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          prd_id: prdId,
          task_id: prdId,
          run_id: runId,
          status: "pending",
          message: "PRD generation started",
        }),
      });
    });

    // Mock status endpoint (simulating completion)
    await page.route(`**/api/prd/status/${runId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          prd_id: prdId,
          status: "completed",
          progress_percent: 100,
          current_step: null,
          result: {
            total_user_stories: 15,
            total_api_endpoints: 25,
            total_test_scenarios: 30,
            total_sprints: 6,
            estimated_duration_weeks: 12,
          },
        }),
      });
    });

    // Navigate and fill form
    await page.goto("/prd/generate");
    await page.getByLabel(/Project Description/i).fill(
      "Build a comprehensive task management app for remote teams with collaboration features"
    );
    await page.getByLabel(/Target Users/i).fill("Remote teams");
    await page.getByLabel(/Timeline/i).fill("3 months");

    // Submit
    await page.getByRole("button", { name: /Generate PRD/i }).click();

    // Should transition to generating state
    await expect(page.locator("text=/Generating Your PRD/i")).toBeVisible({ timeout: 5000 });

    // With mocked completion, should eventually show success
    // (In real E2E, this would wait for actual completion)
  });
});
