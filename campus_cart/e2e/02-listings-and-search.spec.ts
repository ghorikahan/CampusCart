import { test, expect } from "@playwright/test";
import { resetAndSeedTestDb, loginAs } from "./helpers";

test.describe("Listings Creation, Search and Filter", () => {
  test.beforeAll(async () => {
    await resetAndSeedTestDb();
  });

  test("should allow an authenticated seller to create a new listing", async ({ page }) => {
    await loginAs(page, "seller@campus.edu", "password123");

    await page.goto("/listings/new");
    await expect(page.locator("h1")).toContainText(/create a listing|sell an item/i);

    // Fill Basic Info
    await page.fill("#title", "Data Structures in C++ Cormen");

    // Select Category (BOOKS)
    await page.click("#category");
    await page.getByRole("option", { name: /Textbooks & Notes|Books/i }).click();

    // Select Condition (GOOD)
    await page.click("#condition");
    await page.getByRole("option", { name: /Good/i }).click();

    // Fill Price
    await page.fill("#price", "550");

    // Fill Description
    await page.fill(
      "#description",
      "Comprehensive computer science textbook on algorithms and data structures. Minimal highlighting."
    );

    // Location
    await page.fill("#locationText", "Central Library Counter");

    // Upload test image
    await page.setInputFiles('input[type="file"]', {
      name: "sample-book.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64"
      ),
    });

    // Wait for image thumbnail to appear
    await expect(page.locator('button[title="Remove photo"]')).toBeVisible({ timeout: 10000 });

    // Submit form
    await page.click('button[type="submit"]:has-text("Publish Listing")');

    // Should redirect to the new listing's page or dashboard
    await page.waitForURL(/\/listings\/[a-f0-9]{24}/, { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Data Structures in C++ Cormen");
  });

  test("should search and filter listings on the browse page", async ({ page }) => {
    await page.goto("/browse");

    // 1. Initial browse page shows available listings
    await expect(page.locator("text=Engineering Physics Textbook Halliday")).toBeVisible({
      timeout: 10000,
    });

    // 2. Search by query "Physics"
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill("Physics");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/q=Physics/);
    await expect(page.locator("text=Engineering Physics Textbook Halliday")).toBeVisible();

    // 3. Category Filter
    await page.goto("/browse?category=ELECTRONICS");
    await expect(page.locator("text=Wireless Noise Cancelling Headphones")).toBeVisible({
      timeout: 10000,
    });
    // Books shouldn't be in the electronics filtered list
    await expect(page.locator("text=Engineering Physics Textbook Halliday")).not.toBeVisible();
  });
});
