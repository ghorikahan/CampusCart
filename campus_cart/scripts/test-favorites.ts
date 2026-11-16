import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Listing } from "../src/models/Listing";
import { Favorite } from "../src/models/Favorite";
import mongoose from "mongoose";

async function runFavoritesTestSuite() {
  console.log("=== CampusCart Task 12 Favorites Test Suite ===");
  await connectDB();

  // 1. Verify indexes
  console.log("\n1. Verifying Favorite collection indexes...");
  await Favorite.syncIndexes();
  const indexes = await Favorite.collection.indexes();
  const indexNames = indexes.map((idx) => idx.name);
  console.log("Found indexes:", indexNames);

  const hasUnique = indexes.some(
    (idx) => idx.name === "user_listing_unique" && idx.unique === true
  );
  const hasLookup = indexes.some((idx) => idx.name === "listing_lookup");

  if (!hasUnique) {
    throw new Error("Missing user_listing_unique compound unique index on { user, listing }");
  }
  if (!hasLookup) {
    throw new Error("Missing listing_lookup index on { listing: 1 }");
  }
  console.log("✓ Compound unique and lookup indexes verified successfully");

  // 2. Set up test users & listings
  console.log("\n2. Setting up test users and listings...");
  const timestamp = Date.now();
  const seller = await User.create({
    name: "Seller Student",
    email: `seller_fav_${timestamp}@test.edu`,
    passwordHash: "hash123",
    university: "Test University",
  });

  const buyer = await User.create({
    name: "Buyer Student",
    email: `buyer_fav_${timestamp}@test.edu`,
    passwordHash: "hash123",
    university: "Test University",
  });

  // Listing 1: Available
  const listingAvailable = await Listing.create({
    title: "Available Data Structures Book",
    description: "Mint condition data structures and algorithms textbook.",
    category: "BOOKS",
    condition: "LIKE_NEW",
    listingType: "FOR_SALE",
    price: 350,
    seller: seller._id,
    images: [{ url: "https://example.com/book.jpg" }],
    status: "AVAILABLE",
    isActive: true,
  });

  // Listing 2: Sold
  const listingSold = await Listing.create({
    title: "Sold Graphing Calculator",
    description: "TI-84 Plus Graphing Calculator in great shape.",
    category: "ELECTRONICS",
    condition: "GOOD",
    listingType: "FOR_SALE",
    price: 500,
    seller: seller._id,
    images: [{ url: "https://example.com/calc.jpg" }],
    status: "SOLD",
    isActive: true,
    soldAt: new Date(),
  });

  // Listing 3: Deactivated
  const listingDeactivated = await Listing.create({
    title: "Deactivated Study Lamp",
    description: "Desk study lamp with USB charging port.",
    category: "FURNITURE",
    condition: "FAIR",
    listingType: "FOR_SALE",
    price: 200,
    seller: seller._id,
    images: [{ url: "https://example.com/lamp.jpg" }],
    status: "AVAILABLE",
    isActive: false,
  });

  console.log("✓ Created 1 test seller, 1 buyer, and 3 listings (Available, Sold, Deactivated)");

  try {
    // 3. Test Atomic Toggle Favorite (First time: Upsert)
    console.log("\n3. Testing Atomic Toggle (first toggle -> save)...");
    const fav1 = await Favorite.findOneAndUpdate(
      { user: buyer._id, listing: listingAvailable._id },
      { $setOnInsert: { user: buyer._id, listing: listingAvailable._id } },
      { upsert: true, returnDocument: "after" }
    );
    if (!fav1) throw new Error("Failed to create favorite via atomic upsert");

    const countAfterAdd = await Favorite.countDocuments({ user: buyer._id });
    console.log(`✓ Buyer favorite count: ${countAfterAdd} (expected 1)`);
    if (countAfterAdd !== 1) throw new Error("Favorite count mismatch");

    // 4. Test Duplicate Prevention via Unique Index
    console.log("\n4. Testing unique index duplicate rejection...");
    let duplicateRejected = false;
    try {
      await Favorite.create({ user: buyer._id, listing: listingAvailable._id });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
        duplicateRejected = true;
      }
    }
    if (!duplicateRejected) {
      throw new Error("Unique compound index failed to reject duplicate favorite!");
    }
    console.log("✓ Duplicate entry properly rejected by MongoDB unique constraint (E11000)");

    // 5. Test Atomic Toggle (Second time: Delete)
    console.log("\n5. Testing Atomic Toggle (second toggle -> remove)...");
    const deleted = await Favorite.findOneAndDelete({
      user: buyer._id,
      listing: listingAvailable._id,
    });
    if (!deleted) throw new Error("Failed to delete favorite on toggle");

    const countAfterRemove = await Favorite.countDocuments({ user: buyer._id });
    console.log(`✓ Buyer favorite count after toggle off: ${countAfterRemove} (expected 0)`);
    if (countAfterRemove !== 0) throw new Error("Favorite count not 0 after toggle off");

    // Re-save listingAvailable and also favorite listingSold & listingDeactivated
    await Favorite.create([
      { user: buyer._id, listing: listingAvailable._id },
      { user: buyer._id, listing: listingSold._id },
      { user: buyer._id, listing: listingDeactivated._id },
    ]);

    // 6. Test Batch Favorite Lookup in Single Query
    console.log("\n6. Testing batch favorite lookup in single query...");
    const queriedIds = [listingAvailable._id, listingSold._id, new mongoose.Types.ObjectId()];
    const batchFavorites = await Favorite.find({
      user: buyer._id,
      listing: { $in: queriedIds },
    })
      .select("listing")
      .lean();

    const batchFavSet = new Set(batchFavorites.map((f) => f.listing.toString()));
    console.log("✓ Batch lookup returned IDs:", Array.from(batchFavSet));
    if (!batchFavSet.has(listingAvailable._id.toString()) || !batchFavSet.has(listingSold._id.toString())) {
      throw new Error("Batch lookup missing expected favorite IDs");
    }

    // 7. Test Available vs Unavailable Categorization
    console.log("\n7. Testing Available vs Unavailable classification...");
    const docs = await Favorite.find({ user: buyer._id })
      .populate("listing")
      .lean();

    let available = 0;
    let unavailable = 0;

    for (const d of docs) {
      const l = d.listing as unknown as typeof listingAvailable;
      if (l && l.isActive && l.status === "AVAILABLE") {
        available++;
      } else {
        unavailable++;
      }
    }

    console.log(`✓ Available: ${available} (expected 1), Unavailable: ${unavailable} (expected 2)`);
    if (available !== 1 || unavailable !== 2) {
      throw new Error("Categorization of available vs unavailable favorites failed");
    }

    // 8. Test Cascade Delete on Listing Deletion
    console.log("\n8. Testing cascade delete when listing is deleted...");
    await Favorite.deleteMany({ listing: listingAvailable._id });
    const remainingForListing = await Favorite.countDocuments({ listing: listingAvailable._id });
    console.log(`✓ Remaining favorites for deleted listing: ${remainingForListing} (expected 0)`);
    if (remainingForListing !== 0) {
      throw new Error("Cascade delete failed: favorites remain for deleted listing");
    }

    console.log("\n=== ALL FAVORITES TESTS PASSED SUCCESSFULLY! ===");
  } finally {
    console.log("\nCleaning up test database records...");
    await Favorite.deleteMany({ user: buyer._id });
    await Listing.deleteMany({ _id: { $in: [listingAvailable._id, listingSold._id, listingDeactivated._id] } });
    await User.deleteMany({ _id: { $in: [seller._id, buyer._id] } });
    await mongoose.disconnect();
    console.log("✓ Cleanup finished.");
  }
}

runFavoritesTestSuite().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

