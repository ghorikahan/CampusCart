import { test, expect } from "@playwright/test";
import { resetAndSeedTestDb, loginAs } from "./helpers";

test.describe("Favorites and Unavailable Handling", () => {
  test.beforeAll(async () => {
    await resetAndSeedTestDb();
  });

  test("should display available and unavailable saved items correctly", async ({ page }) => {
    await loginAs(page, "buyer@campus.edu", "password123");

    await page.goto("/favorites");
    await expect(page.locator("h1")).toContainText(/saved items|favorites/i);

    // 1. Available listing should be visible
    await expect(page.locator("text=Engineering Physics Textbook Halliday")).toBeVisible({
      timeout: 10000,
    });

    // 2. Sold / Unavailable listing should display with Item Sold badge
    await expect(page.locator("text=Ergonomic Study Desk Chair")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=Item Sold")).toBeVisible();
  });

  test("should allow removing an unavailable favorite item", async ({ page }) => {
    await loginAs(page, "buyer@campus.edu", "password123");

    await page.goto("/favorites");

    // Locate the remove button for the unavailable card
    const removeBtn = page.locator('button:has-text("Remove")').first();
    await expect(removeBtn).toBeVisible({ timeout: 10000 });
    await removeBtn.click();

    // Verify removed confirmation toast
    await expect(page.locator("text=Removed from saved items")).toBeVisible({ timeout: 10000 });

    // Unavailable item should no longer be present
    await expect(page.locator("text=Ergonomic Study Desk Chair")).not.toBeVisible();
  });

  test("should toggle favorite from the browse page", async ({ page }) => {
    await loginAs(page, "buyer@campus.edu", "password123");

    await page.goto("/browse");

    // Click heart button on headphones
    const heartBtn = page.locator('button[aria-label*="favorite"], button[title*="favorite"]').first();
    await heartBtn.click();

    // Verify favorites count indicator in navbar is updated
    await page.goto("/favorites");
    await expect(page.locator("text=Wireless Noise Cancelling Headphones")).toBeVisible({
      timeout: 10000,
    });
  });
});