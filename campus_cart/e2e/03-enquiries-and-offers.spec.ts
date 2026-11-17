import { test, expect } from "@playwright/test";
import { resetAndSeedTestDb, loginAs } from "./helpers";

test.describe("Enquiries and Offer Negotiation", () => {
  test.beforeAll(async () => {
    await resetAndSeedTestDb();
  });

  test("should allow a buyer to send an offer on an item", async ({ page }) => {
    await loginAs(page, "buyer@campus.edu", "password123");

    // Visit browse page and click on the available textbook
    await page.goto("/browse");
    await page.click("text=Engineering Physics Textbook Halliday");

    await page.waitForURL(/\/listings\/[a-f0-9]{24}/);

    // Open enquiry / offer modal
    const enquiryBtn = page.locator('button:has-text("Send Enquiry"), button:has-text("Make Offer")').first();
    await enquiryBtn.click();

    // Fill offer and message
    const offerInput = page.locator("#offerPrice");
    if (await offerInput.isVisible()) {
      await offerInput.fill("400");
    }

    await page.fill("#enquiryMessage", "Hi! Is this available for library handover this evening?");

    // Submit enquiry
    await page.click('button[type="submit"]:has-text("Send")');

    // Wait for success toast / notification
    await expect(page.locator("text=Enquiry sent successfully")).toBeVisible({ timeout: 10000 });
  });

  test("should allow a seller to review and accept a received offer", async ({ page }) => {
    await loginAs(page, "seller@campus.edu", "password123");

    await page.goto("/dashboard?tab=enquiries");
    await expect(page.locator("h1")).toContainText(/dashboard/i);

    // Should see the pending offer on headphones seeded in DB
    await expect(page.locator("text=Wireless Noise Cancelling Headphones")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=Buyer Bob")).toBeVisible();

    // Click Accept button on the enquiry card
    const acceptBtn = page.locator('button:has-text("Accept")').first();
    await acceptBtn.click();

    // Confirm acceptance in modal
    const confirmBtn = page.locator('button:has-text("Confirm & Accept")');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

    // Verify success toast and state transition
    await expect(page.locator("text=Offer accepted")).toBeVisible({ timeout: 10000 });
  });
});
