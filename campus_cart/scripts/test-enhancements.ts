import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Listing } from "../src/models/Listing";
import { AiRateLimit } from "../src/models/AiRateLimit";
import { generateListingDescription } from "../src/server/ai/description";
import { classifyCategoryByKeywords, suggestListingCategory } from "../src/server/ai/category";
import { getSimilarListings } from "../src/server/listings/queries";
import { searchListings } from "../src/server/listings/search";
import { generateQRCodeDataURL } from "../src/lib/qrcode";
import { getBlurDataURL, getOptimizedImageUrl } from "../src/lib/images";

async function runEnhancementsTestSuite() {
  console.log("=== CampusCart Task 14 Enhancements Test Suite ===");
  await connectDB();

  // 1. Verify AiRateLimit indexes & TTL
  console.log("\n1. Verifying AiRateLimit indexes & TTL...");
  await AiRateLimit.syncIndexes();
  const rateLimitIndexes = await AiRateLimit.collection.indexes();
  const rateIndexNames = rateLimitIndexes.map((idx) => idx.name);
  console.log("Found AiRateLimit indexes:", rateIndexNames);

  const hasTTL = rateLimitIndexes.some(
    (idx) => idx.name === "ai_rate_limit_ttl_1h" && idx.expireAfterSeconds === 3600
  );
  if (!hasTTL) {
    throw new Error("Missing TTL index on AiRateLimit with expireAfterSeconds=3600!");
  }
  console.log("✓ AiRateLimit 1-hour TTL index verified successfully.");

  // 2. Set up test users & test items
  console.log("\n2. Setting up test users...");
  const timestamp = Date.now();
  const testUser = await User.create({
    name: "AI Enhancement Tester",
    email: `ai_tester_${timestamp}@test.edu`,
    passwordHash: "hash123",
    university: "Delhi University",
  });
  const otherSeller = await User.create({
    name: "Other Campus Seller",
    email: `other_seller_${timestamp}@test.edu`,
    passwordHash: "hash123",
    university: "Delhi University",
  });
  console.log("✓ Created test users.");

  try {
    // 3. Test AI Category Suggestion & Keyword Fallback
    console.log("\n3. Testing Category Suggestion & Keyword Classifier...");
    const bookTest = classifyCategoryByKeywords(
      "Thomas Calculus 14th Edition with Solutions",
      "Comprehensive mathematics guide for engineering students"
    );
    console.log("Book classified as:", bookTest);
    if (bookTest.category !== "BOOKS" || bookTest.confidence < 0.7) {
      throw new Error(`Expected BOOKS with confidence >= 0.7, got ${JSON.stringify(bookTest)}`);
    }

    const laptopTest = classifyCategoryByKeywords(
      "Apple MacBook Pro M1 16GB RAM 512GB SSD",
      "Space grey laptop in great working condition"
    );
    console.log("Laptop classified as:", laptopTest);
    if (laptopTest.category !== "ELECTRONICS" || laptopTest.confidence < 0.7) {
      throw new Error(`Expected ELECTRONICS with confidence >= 0.7, got ${JSON.stringify(laptopTest)}`);
    }

    const chairTest = classifyCategoryByKeywords(
      "Ergonomic Mesh Study Chair for Dorm Room",
      "Adjustable height and lumbar support"
    );
    console.log("Chair classified as:", chairTest);
    if (chairTest.category !== "FURNITURE" || chairTest.confidence < 0.7) {
      throw new Error(`Expected FURNITURE with confidence >= 0.7, got ${JSON.stringify(chairTest)}`);
    }

    // Graceful suggestListingCategory fallback call
    const suggestRes = await suggestListingCategory({
      title: "TI-84 Plus CE Graphing Calculator with Charger",
    });
    if (!suggestRes.success || suggestRes.category !== "ELECTRONICS") {
      throw new Error(`suggestListingCategory failed: ${JSON.stringify(suggestRes)}`);
    }
    console.log("✓ Category Suggestion & Keyword Classification verified.");

    // 4. Test AI Description Generator & Rate Limiting (10/hour)
    console.log("\n4. Testing AI Description Generator & 10/hour Rate Limiting...");
    // Clear any prior rate limit entries for this user
    await AiRateLimit.deleteMany({ user: testUser._id });

    // Perform first generation (should succeed with smart template or API)
    const gen1 = await generateListingDescription({
      title: "Fundamentals of Electric Circuits 6th Edition",
      category: "BOOKS",
      condition: "LIKE_NEW",
      listingType: "FOR_SALE",
      keywords: "No highlighting, includes formula sheet",
      userId: testUser._id.toString(),
    });

    if (!gen1.success || !gen1.description) {
      throw new Error(`Expected description generation to succeed, got: ${JSON.stringify(gen1)}`);
    }
    const wordCount = gen1.description.split(/\s+/).length;
    console.log(`Generated description word count: ${wordCount}`);
    console.log(`Sample output: "${gen1.description.slice(0, 100)}..."`);
    if (wordCount < 40 || wordCount > 150) {
      throw new Error(`Word count out of reasonable range (expected ~60-120): ${wordCount}`);
    }

    // Fill remaining 9 attempts to hit limit (10 total)
    console.log("Simulating 9 more requests to reach the 10/hour limit...");
    for (let i = 0; i < 9; i++) {
      await AiRateLimit.create({
        user: testUser._id,
        action: "DESCRIPTION",
      });
    }

    const countAfter10 = await AiRateLimit.countDocuments({
      user: testUser._id,
      action: "DESCRIPTION",
    });
    console.log(`AiRateLimit records for user: ${countAfter10}`);

    // 11th request MUST be rejected by rate limiter
    const gen11 = await generateListingDescription({
      title: "Another Book to Trigger Rate Limit",
      userId: testUser._id.toString(),
    });

    if (gen11.success !== false || !gen11.error?.toLowerCase().includes("rate limit")) {
      throw new Error(`Expected 11th request to fail with rate limit error, got: ${JSON.stringify(gen11)}`);
    }
    console.log("✓ Rate limiting (10/hour per user) verified successfully.");

    // 5. Test QR Code Generator
    console.log("\n5. Testing QR Code Generator...");
    const sampleUrl = "https://campuscart.test/listings/670000000000000000000001";
    const qrDataUrl = await generateQRCodeDataURL(sampleUrl, { width: 300 });
    if (!qrDataUrl.startsWith("data:image/png;base64,")) {
      throw new Error("QR Code did not produce a valid PNG data URL!");
    }
    console.log(`✓ QR Code generated successfully (data URL length: ${qrDataUrl.length} chars).`);

    // 6. Test Image Optimization Helpers
    console.log("\n6. Testing Image Optimization Helpers...");
    const blurUrl = getBlurDataURL("#e2e8f0");
    if (!blurUrl.startsWith("data:image/svg+xml;base64,")) {
      throw new Error("getBlurDataURL did not produce a valid base64 SVG!");
    }

    const cloudinaryUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const optimizedCloudinary = getOptimizedImageUrl(cloudinaryUrl, { width: 800 });
    if (!optimizedCloudinary.includes("f_auto,q_80,w_800")) {
      throw new Error(`Optimized Cloudinary URL mismatch: ${optimizedCloudinary}`);
    }
    console.log("✓ Blur placeholders and Cloudinary URL optimization verified.");

    // 7. Test Location-Based Discovery ($geoNear aggregation)
    console.log("\n7. Testing Location-Based Discovery ($geoNear 2dsphere)...");
    // Listing A: Near Delhi University (~1.2 km away)
    // DU North Campus coords: [77.2090, 28.6920] (lng, lat)
    const duCoords: [number, number] = [77.2090, 28.6920];
    const nearCoords: [number, number] = [77.2180, 28.6980]; // ~1.2 km away
    const farCoords: [number, number] = [77.0688, 28.4595];  // Gurgaon (~35 km away)

    const nearListing = await Listing.create({
      title: "Nearby Python Crash Course Textbook",
      description: "Introductory Python textbook for CS students.",
      category: "BOOKS",
      condition: "GOOD",
      listingType: "FOR_SALE",
      price: 450,
      seller: otherSeller._id,
      images: [{ url: "https://example.com/python.jpg" }],
      status: "AVAILABLE",
      isActive: true,
      locationText: "Near North Campus Library",
      location: {
        type: "Point",
        coordinates: nearCoords,
      },
    });

    const farListing = await Listing.create({
      title: "Far Away Desktop Monitor 35km",
      description: "24 inch monitor located in Gurgaon.",
      category: "ELECTRONICS",
      condition: "GOOD",
      listingType: "FOR_SALE",
      price: 5000,
      seller: otherSeller._id,
      images: [{ url: "https://example.com/monitor.jpg" }],
      status: "AVAILABLE",
      isActive: true,
      locationText: "Gurgaon Cyber City",
      location: {
        type: "Point",
        coordinates: farCoords,
      },
    });

    // Search with 5 km radius from DU North Campus
    const search5km = await searchListings({
      lat: duCoords[1],
      lng: duCoords[0],
      radiusKm: 5,
    });

    console.log(`5km search returned ${search5km.listings.length} listings.`);
    const hasNearItem = search5km.listings.some((l) => l.id === nearListing._id.toString());
    const hasFarItem = search5km.listings.some((l) => l.id === farListing._id.toString());

    if (!hasNearItem) {
      throw new Error(`Expected near listing (${nearListing._id}) within 5km radius!`);
    }
    if (hasFarItem) {
      throw new Error(`Far listing (${farListing._id}) should NOT be within 5km radius!`);
    }

    const matchedItem = search5km.listings.find((l) => l.id === nearListing._id.toString());
    console.log(`Computed distance for near listing: ${matchedItem?.distance} meters`);
    if (typeof matchedItem?.distance !== "number" || matchedItem.distance <= 0) {
      throw new Error("Missing or invalid computed distance on card!");
    }

    // Now search with 50 km radius: far listing should now be included
    const search50km = await searchListings({
      lat: duCoords[1],
      lng: duCoords[0],
      radiusKm: 50,
    });
    const hasFarItemIn50km = search50km.listings.some((l) => l.id === farListing._id.toString());
    if (!hasFarItemIn50km) {
      throw new Error("Expected far listing to appear in 50km radius search!");
    }
    console.log("✓ $geoNear aggregation and distance calculation verified.");

    // 8. Test Improved Similar-Item Recommendations Aggregation
    console.log("\n8. Testing Similar-Item Recommendations Aggregation Pipeline...");
    const targetBook = await Listing.create({
      title: "Advanced Engineering Mathematics 10th Edition",
      description: "Kreyszig advanced math textbook.",
      category: "BOOKS",
      condition: "LIKE_NEW",
      listingType: "FOR_SALE",
      price: 600,
      seller: testUser._id,
      images: [{ url: "https://example.com/math.jpg" }],
      status: "AVAILABLE",
      isActive: true,
    });

    const closePriceBook = await Listing.create({
      title: "Engineering Mathematics Volume 2",
      description: "Great textbook for engineering mathematics.",
      category: "BOOKS",
      condition: "GOOD",
      listingType: "FOR_SALE",
      price: 550, // Very close to 600
      seller: otherSeller._id,
      images: [{ url: "https://example.com/math2.jpg" }],
      status: "AVAILABLE",
      isActive: true,
    });

    const farPriceBook = await Listing.create({
      title: "Rare Vintage Handwritten Math Notes",
      description: "Vintage notes on engineering mathematics.",
      category: "BOOKS",
      condition: "FAIR",
      listingType: "FOR_SALE",
      price: 3500, // Much further price
      seller: otherSeller._id,
      images: [{ url: "https://example.com/notes.jpg" }],
      status: "AVAILABLE",
      isActive: true,
    });

    const similarListings = await getSimilarListings(targetBook, 4);
    console.log(`Retrieved ${similarListings.length} similar listings.`);
    if (similarListings.length < 2) {
      throw new Error(`Expected at least 2 similar listings, got ${similarListings.length}`);
    }

    // Target book and seller's own listings should be excluded
    if (similarListings.some((l) => l.id === targetBook._id.toString())) {
      throw new Error("Target book was not excluded from its own similar listings!");
    }

    // Close price book should rank higher due to price proximity + text relevance
    const closeIndex = similarListings.findIndex((l) => l.id === closePriceBook._id.toString());
    const farIndex = similarListings.findIndex((l) => l.id === farPriceBook._id.toString());
    console.log(`Close price rank: ${closeIndex}, Far price rank: ${farIndex}`);
    if (closeIndex === -1 || (farIndex !== -1 && closeIndex > farIndex)) {
      throw new Error("Expected closer priced similar item to rank higher!");
    }
    console.log("✓ Similar-item recommendations aggregation ranking verified.");

    console.log("\n🎉 ALL TASK 14 ENHANCEMENT TESTS PASSED SUCCESSFULLY! 🎉");
  } finally {
    // Cleanup
    console.log("\nCleaning up test artifacts...");
    await Listing.deleteMany({ seller: { $in: [testUser._id, otherSeller._id] } });
    await AiRateLimit.deleteMany({ user: testUser._id });
    await User.deleteMany({ _id: { $in: [testUser._id, otherSeller._id] } });
    console.log("✓ Test artifacts cleaned up.");
  }
}

runEnhancementsTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  });
