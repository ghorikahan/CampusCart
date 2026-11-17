import { test, expect } from "@playwright/test";
import { resetAndSeedTestDb } from "./helpers";

test.describe("Authentication (Register & Login)", () => {
  test.beforeAll(async () => {
    await resetAndSeedTestDb();
  });

  test("should register a new student user and redirect to dashboard", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueEmail = `student_${timestamp}@campus.edu`;

    await page.goto("/register");
    await expect(page.locator("h1")).toContainText(/create|register|account/i);

    await page.fill('input[name="name"]', "Test Student");
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");

    await page.click('button[type="submit"]');

    // Should redirect to dashboard or away from register
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should successfully login with existing credentials", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText(/welcome back|sign in|log in/i);

    await page.fill('input[name="email"]', "seller@campus.edu");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should display an error message on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "wrong@campus.edu");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    const alert = page.locator('[role="alert"], text=Invalid email or password');
    await expect(alert.first()).toBeVisible({ timeout: 10000 });
  });
});
