import { Page, expect } from "@playwright/test";
import { seedTestDatabase } from "../scripts/seed-test-db";

export async function resetAndSeedTestDb() {
  await seedTestDatabase();
}

export async function loginAs(page: Page, email = "seller@campus.edu", password = "password123") {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait until navigated to dashboard or away from login
  await expect(page).not.toHaveURL(/\/login/);
}
