import { connectDB } from "../src/lib/db";
import { Listing } from "../src/models/Listing";
import { isValidObjectId } from "../src/lib/serialize";
import { getListingById, getSimilarListings } from "../src/server/listings/queries";

interface TestListingSeller {
  id?: string;
  _id?: string;
  name?: string;
  passwordHash?: string;
}

interface TestListingDetail {
  id?: string;
  _id?: string;
  title: string;
  category: string;
  condition: string;
  price: number | null;
  seller?: TestListingSeller;
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 CampusCart Task 8: Listing Detail Page Verification");
  console.log("==================================================");

  await connectDB();

  // Test 1: Invalid ID checks
  console.log("\n1. Testing ObjectId validation:");
  if (!isValidObjectId("invalid-id-123")) {
    console.log("✅ PASS: 'invalid-id-123' rejected");
  } else {
    throw new Error("FAIL: 'invalid-id-123' should be invalid");
  }

  if (!isValidObjectId("64b1f8")) {
    console.log("✅ PASS: Short hex string rejected");
  } else {
    throw new Error("FAIL: Short hex string should be invalid");
  }

  // Test 2: Fetching an existing listing
  console.log("\n2. Testing getListingById & Public Seller Projection:");
  const sampleListing = await Listing.findOne({ isActive: true, status: "AVAILABLE" }).lean();
  if (!sampleListing) {
    console.log("⚠️ No listings found in database to test getListingById against. Skipping live query check.");
    return;
  }

  const listingDetail = (await getListingById(
    String(sampleListing._id)
  )) as unknown as TestListingDetail | null;
  if (!listingDetail) {
    throw new Error(`FAIL: Could not retrieve listing ${sampleListing._id}`);
  }

  console.log(`✅ PASS: Retrieved listing "${listingDetail.title}"`);
  console.log(`  - Category: ${listingDetail.category}`);
  console.log(`  - Condition: ${listingDetail.condition}`);
  console.log(`  - Price: ${listingDetail.price}`);
  console.log(`  - Seller Name: ${listingDetail.seller?.name}`);

  if (listingDetail.seller?.passwordHash) {
    throw new Error("FAIL: passwordHash leaked in seller projection!");
  }
  console.log("✅ PASS: Seller sensitive fields (passwordHash) securely excluded");

  // Test 3: Similar Listings Aggregation
  console.log("\n3. Testing getSimilarListings Aggregation Pipeline:");
  const similar = await getSimilarListings(listingDetail, 4);
  console.log(`✅ PASS: getSimilarListings returned ${similar.length} listings`);

  for (const item of similar) {
    // Current listing should be excluded
    if (String(item.id) === String(listingDetail.id || listingDetail._id)) {
      throw new Error(`FAIL: Current listing ${item.id} was not excluded from similar items!`);
    }

    // Seller's own listings should be excluded
    const sellerId = listingDetail.seller?.id || listingDetail.seller?._id;
    const itemSeller = item.seller as { id?: string; _id?: string } | undefined;
    const itemSellerId = itemSeller?.id || itemSeller?._id;
    if (sellerId && itemSellerId && String(sellerId) === String(itemSellerId)) {
      throw new Error(`FAIL: Seller's own listing ${item.id} was not excluded from similar items!`);
    }

    // Category should match
    if (item.category !== listingDetail.category) {
      throw new Error(`FAIL: Category mismatch! Expected ${listingDetail.category}, got ${item.category}`);
    }
  }

  console.log("✅ PASS: All similar listings matched category and excluded current listing and seller's own");

  console.log("\n==================================================");
  console.log("🎉 All Task 8 Listing Detail tests passed successfully!");
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
