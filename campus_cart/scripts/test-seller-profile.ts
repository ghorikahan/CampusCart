import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { isValidObjectId } from "../src/lib/serialize";
import {
  getSellerProfile,
  getSellerActiveListings,
  getSellerSoldListings,
  type PublicSellerProfile,
} from "../src/server/sellers/queries";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 CampusCart Task 9: Seller Profile Verification");
  console.log("==================================================");

  await connectDB();

  // Test 1: Invalid ObjectId rejection
  console.log("\n1. Testing ObjectId validation:");
  if (!isValidObjectId("not-valid-id")) {
    console.log("✅ PASS: Non-hex string 'not-valid-id' rejected");
  } else {
    throw new Error("FAIL: Non-hex string should be invalid");
  }

  if (!isValidObjectId("123")) {
    console.log("✅ PASS: Short ID '123' rejected");
  } else {
    throw new Error("FAIL: Short ID should be invalid");
  }

  // Test 2: Fetching an existing user
  console.log("\n2. Testing getSellerProfile & Security Redaction:");
  const sampleUser = await User.findOne().lean();
  if (!sampleUser) {
    console.log("⚠️ No users found in database to test seller profile against. Skipping live query check.");
    return;
  }

  const sellerId = String(sampleUser._id);
  const profile = (await getSellerProfile(sellerId, null)) as PublicSellerProfile | null;

  if (!profile) {
    throw new Error(`FAIL: Could not retrieve seller profile for user ${sellerId}`);
  }

  console.log(`✅ PASS: Retrieved seller profile for "${profile.name}"`);
  console.log(`  - University: ${profile.university || "N/A"}`);
  console.log(`  - City: ${profile.city || "N/A"}`);
  console.log(`  - Active Listings Count: ${profile.activeListingsCount}`);
  console.log(`  - Sold Items Count: ${profile.soldCount}`);

  // Security checks: email and passwordHash must NEVER be present
  const rawProfile = profile as unknown as Record<string, unknown>;
  if ("passwordHash" in rawProfile && rawProfile.passwordHash) {
    throw new Error("SECURITY FAILURE: passwordHash exposed in seller profile!");
  }
  if ("email" in rawProfile && rawProfile.email) {
    throw new Error("SECURITY FAILURE: email exposed in seller profile!");
  }
  console.log("✅ PASS: Sensitive credentials (email, passwordHash) strictly excluded");

  // Phone privacy check
  if (!profile.showPhone && profile.phone) {
    throw new Error("PRIVACY FAILURE: Phone number exposed when showPhone is false!");
  }
  console.log("✅ PASS: Phone number privacy verified based on showPhone setting");

  // Test 3: Active and Sold Listings queries
  console.log("\n3. Testing Active and Sold listings separation:");
  const [activeListings, soldListings] = await Promise.all([
    getSellerActiveListings(sellerId, false),
    getSellerSoldListings(sellerId, false),
  ]);

  console.log(`✅ PASS: Found ${activeListings.length} public active items and ${soldListings.length} sold items`);

  // Verify active listings are all available/reserved and active
  for (const item of activeListings) {
    if (item.status === "SOLD") {
      throw new Error(`FAIL: Sold listing ${item.id} returned in active listings tab!`);
    }
  }
  console.log("✅ PASS: Active listings tab contains no sold items");

  // Verify sold listings are all SOLD
  for (const item of soldListings) {
    if (item.status !== "SOLD") {
      throw new Error(`FAIL: Non-sold listing ${item.id} returned in sold history tab!`);
    }
  }
  console.log("✅ PASS: Sold history tab contains only completed/sold items");

  console.log("\n==================================================");
  console.log("🎉 All Task 9 Seller Profile tests passed successfully!");
  console.log("==================================================");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

