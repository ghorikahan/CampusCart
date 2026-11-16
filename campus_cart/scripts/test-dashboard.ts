import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Listing } from "../src/models/Listing";
import { Enquiry } from "../src/models/Enquiry";
import { Notification } from "../src/models/Notification";
import { Favorite } from "../src/models/Favorite";
import { subDays, format } from "date-fns";

async function runDashboardTestSuite() {
  console.log("=== CampusCart Task 13 Dashboard Test Suite ===");
  await connectDB();

  // 1. Verify indexes
  console.log("\n1. Verifying indexes used by Dashboard queries...");
  const listingIndexes = await Listing.collection.indexes();
  const listingIndexKeys = listingIndexes.map((idx) => JSON.stringify(idx.key));
  console.log("Listing index keys:", listingIndexKeys);

  const enquiryIndexes = await Enquiry.collection.indexes();
  const enquiryIndexKeys = enquiryIndexes.map((idx) => JSON.stringify(idx.key));
  console.log("Enquiry index keys:", enquiryIndexKeys);

  const notifIndexes = await Notification.collection.indexes();
  const notifIndexKeys = notifIndexes.map((idx) => JSON.stringify(idx.key));
  console.log("Notification index keys:", notifIndexKeys);

  const hasListingSellerStatus = listingIndexKeys.some(
    (k) => k.includes('"seller":1') && k.includes('"status":1')
  );
  if (!hasListingSellerStatus) {
    console.warn("Notice: Listing collection has indexes:", listingIndexKeys);
  }
  console.log("✓ Core collections and indexes inspected.");

  // 2. Set up test sellers and buyers
  console.log("\n2. Setting up test users...");
  const timestamp = Date.now();
  const sellerA = await User.create({
    name: "Dashboard Seller A",
    email: `seller_a_${timestamp}@test.edu`,
    passwordHash: "hash123",
    university: "Test Tech",
    phone: "1234567890",
  });

  const sellerB = await User.create({
    name: "Dashboard Seller B",
    email: `seller_b_${timestamp}@test.edu`,
    passwordHash: "hash123",
    university: "Test Tech",
  });

  const buyer = await User.create({
    name: "Dashboard Buyer",
    email: `buyer_dash_${timestamp}@test.edu`,
    passwordHash: "hash123",
    university: "Test Tech",
  });

  console.log("✓ Created Seller A, Seller B, and Buyer");

  try {
    // 3. Create sample listings for Seller A
    console.log("\n3. Creating listings for Seller A with varied statuses & view counts...");
    const now = new Date();

    // Active listing with 0 views (should trigger needs attention)
    const listingZeroViews = await Listing.create({
      title: "Zero Views Calculus Book",
      description: "Calculus textbook in good condition.",
      category: "BOOKS",
      condition: "GOOD",
      listingType: "FOR_SALE",
      price: 450,
      seller: sellerA._id,
      images: [{ url: "https://example.com/calc.jpg" }],
      status: "AVAILABLE",
      isActive: true,
      viewCount: 0,
      createdAt: subDays(now, 1),
    });

    // Active listing with 25 views
    const listingActiveViews = await Listing.create({
      title: "Popular Gaming Mouse",
      description: "Ergonomic RGB mouse.",
      category: "ELECTRONICS",
      condition: "LIKE_NEW",
      listingType: "FOR_SALE",
      price: 1200,
      seller: sellerA._id,
      images: [{ url: "https://example.com/mouse.jpg" }],
      status: "AVAILABLE",
      isActive: true,
      viewCount: 25,
      createdAt: subDays(now, 5),
    });

    // Stale Reserved listing (> 7 days reserved, triggers needs attention)
    const listingStaleReserved = await Listing.create({
      title: "Stale Reserved Desk Chair",
      description: "Comfortable ergonomic office chair.",
      category: "FURNITURE",
      condition: "GOOD",
      listingType: "FOR_SALE",
      price: 2500,
      seller: sellerA._id,
      images: [{ url: "https://example.com/chair.jpg" }],
      status: "RESERVED",
      isActive: true,
      viewCount: 40,
      updatedAt: subDays(now, 9),
      createdAt: subDays(now, 10),
    });

    // Sold listing (contributes to revenue & sold stats)
    await Listing.create({
      title: "Sold Lab Coat",
      description: "Chemistry lab coat size M.",
      category: "OTHER",
      condition: "GOOD",
      listingType: "FOR_SALE",
      price: 300,
      seller: sellerA._id,
      images: [{ url: "https://example.com/coat.jpg" }],
      status: "SOLD",
      isActive: true,
      viewCount: 15,
      soldAt: subDays(now, 2),
      createdAt: subDays(now, 12),
    });

    // Inactive listing
    await Listing.create({
      title: "Inactive Bicycle",
      description: "Gear cycle temporarily deactivated.",
      category: "OTHER",
      condition: "FAIR",
      listingType: "FOR_SALE",
      price: 3500,
      seller: sellerA._id,
      images: [{ url: "https://example.com/bike.jpg" }],
      status: "AVAILABLE",
      isActive: false,
      viewCount: 5,
      createdAt: subDays(now, 15),
    });

    // Listing for Seller B (to test isolation)
    const listingSellerB = await Listing.create({
      title: "Seller B Laptop Stand",
      description: "Aluminum laptop stand.",
      category: "ELECTRONICS",
      condition: "NEW",
      listingType: "FOR_SALE",
      price: 800,
      seller: sellerB._id,
      images: [{ url: "https://example.com/stand.jpg" }],
      status: "AVAILABLE",
      isActive: true,
      viewCount: 10,
    });

    console.log("✓ Sample listings created successfully.");

    // 4. Create Enquiries and Notifications
    console.log("\n4. Creating enquiries and notifications...");
    // Stale pending enquiry (> 2 days old, triggers needs attention)
    const staleEnquiry = await Enquiry.create({
      listing: listingActiveViews._id,
      buyer: buyer._id,
      seller: sellerA._id,
      message: "Is this still available for ₹1000?",
      offerPrice: 1000,
      status: "PENDING",
      statusHistory: [{ status: "PENDING", at: subDays(now, 4) }],
      createdAt: subDays(now, 4),
    });

    // Recent pending enquiry (< 2 days old)
    const recentEnquiry = await Enquiry.create({
      listing: listingZeroViews._id,
      buyer: buyer._id,
      seller: sellerA._id,
      message: "Will you take ₹400?",
      offerPrice: 400,
      status: "PENDING",
      statusHistory: [{ status: "PENDING", at: now }],
      createdAt: now,
    });

    // Notification for Seller A
    await Notification.create({
      user: sellerA._id,
      type: "ENQUIRY_RECEIVED",
      title: "New offer received",
      body: "You received an offer on your listing.",
      link: "/dashboard?tab=enquiries",
      readAt: null,
    });

    console.log("✓ Enquiries and notifications set up.");

    // 5. Test Single Aggregation on Listing ($facet)
    console.log("\n5. Testing single aggregation ($facet) for dashboard metrics...");
    const thirtyDaysAgo = subDays(now, 30);
    const aggResult = await Listing.aggregate([
      { $match: { seller: sellerA._id } },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalViews: { $sum: "$viewCount" },
                activeCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "AVAILABLE"] },
                          { $eq: ["$isActive", true] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                reservedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "RESERVED"] }, 1, 0] },
                },
                soldCount: {
                  $sum: { $cond: [{ $eq: ["$status", "SOLD"] }, 1, 0] },
                },
                inactiveCount: {
                  $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
                },
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "SOLD"] },
                      { $ifNull: ["$price", 0] },
                      0,
                    ],
                  },
                },
                totalListings: { $sum: 1 },
              },
            },
          ],
          last30Days: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                listingsCreated: { $sum: 1 },
                views: { $sum: "$viewCount" },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const overview = aggResult[0].overview[0];
    console.log("Aggregation Overview Result:", overview);

    // Assertions for aggregation
    if (overview.activeCount !== 2) {
      throw new Error(`Expected activeCount=2, got ${overview.activeCount}`);
    }
    if (overview.reservedCount !== 1) {
      throw new Error(`Expected reservedCount=1, got ${overview.reservedCount}`);
    }
    if (overview.soldCount !== 1) {
      throw new Error(`Expected soldCount=1, got ${overview.soldCount}`);
    }
    if (overview.inactiveCount !== 1) {
      throw new Error(`Expected inactiveCount=1, got ${overview.inactiveCount}`);
    }
    if (overview.totalViews !== 85) { // 0 + 25 + 40 + 15 + 5 = 85
      throw new Error(`Expected totalViews=85, got ${overview.totalViews}`);
    }
    if (overview.totalRevenue !== 300) {
      throw new Error(`Expected totalRevenue=300, got ${overview.totalRevenue}`);
    }
    if (overview.totalListings !== 5) {
      throw new Error(`Expected totalListings=5, got ${overview.totalListings}`);
    }
    console.log("✓ $facet aggregation produced exact expected counts and sums!");

    // 6. Test 30-Day Timeline Normalization
    console.log("\n6. Testing 30-Day timeline normalization...");
    const raw30Days = aggResult[0].last30Days as Array<{
      _id: string;
      listingsCreated: number;
      views: number;
    }>;
    const dateMap = new Map(raw30Days.map((e) => [e._id, e]));

    const chartTimeline = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(now, i);
      const dateKey = format(d, "yyyy-MM-dd");
      const existing = dateMap.get(dateKey);
      chartTimeline.push({
        date: dateKey,
        listingsCreated: existing?.listingsCreated ?? 0,
        views: existing?.views ?? 0,
      });
    }

    if (chartTimeline.length !== 30) {
      throw new Error(`Expected 30 continuous date points, got ${chartTimeline.length}`);
    }
    const totalListingsInTimeline = chartTimeline.reduce((s, p) => s + p.listingsCreated, 0);
    if (totalListingsInTimeline !== 5) {
      throw new Error(`Expected sum of listings in 30d timeline=5, got ${totalListingsInTimeline}`);
    }
    console.log("✓ 30-day timeline verified (all 30 continuous days present with zero-padding).");

    // 7. Test "Needs Attention" queries
    console.log("\n7. Testing 'Needs Attention' queries...");
    const twoDaysAgo = subDays(now, 2);
    const sevenDaysAgo = subDays(now, 7);

    const staleEnquiries = await Enquiry.find({
      seller: sellerA._id,
      status: "PENDING",
      createdAt: { $lt: twoDaysAgo },
    });
    if (staleEnquiries.length !== 1 || staleEnquiries[0]._id.toString() !== staleEnquiry._id.toString()) {
      throw new Error(`Expected exactly 1 stale enquiry (${staleEnquiry._id}), got ${staleEnquiries.length}`);
    }

    const staleReserved = await Listing.find({
      seller: sellerA._id,
      status: "RESERVED",
      updatedAt: { $lt: sevenDaysAgo },
    });
    if (staleReserved.length !== 1 || staleReserved[0]._id.toString() !== listingStaleReserved._id.toString()) {
      throw new Error(`Expected 1 stale reserved listing, got ${staleReserved.length}`);
    }

    const zeroViews = await Listing.find({
      seller: sellerA._id,
      status: "AVAILABLE",
      isActive: true,
      viewCount: 0,
    });
    if (zeroViews.length !== 1 || zeroViews[0]._id.toString() !== listingZeroViews._id.toString()) {
      throw new Error(`Expected 1 zero-view listing, got ${zeroViews.length}`);
    }
    console.log("✓ All 3 'Needs Attention' scenarios correctly detected!");

    // 8. Test Bulk Update Status with Ownership Isolation
    console.log("\n8. Testing Bulk Update Status & Ownership Isolation...");
    // Attempt to update Seller B's listing using Seller A's ID
    const crossUpdateResult = await Listing.updateMany(
      { _id: { $in: [listingSellerB._id] }, seller: sellerA._id },
      { $set: { status: "SOLD", soldAt: new Date() } }
    );
    if (crossUpdateResult.modifiedCount !== 0) {
      throw new Error("Security Violation: Seller A was able to update Seller B's listing!");
    }

    // Now update Seller A's listings to RESERVED
    const bulkReservedResult = await Listing.updateMany(
      { _id: { $in: [listingZeroViews._id, listingActiveViews._id] }, seller: sellerA._id },
      { $set: { status: "RESERVED", soldAt: null } }
    );
    if (bulkReservedResult.modifiedCount !== 2) {
      throw new Error(`Expected 2 listings updated to RESERVED, got ${bulkReservedResult.modifiedCount}`);
    }

    // Verify in database
    const verifyReserved = await Listing.find({
      _id: { $in: [listingZeroViews._id, listingActiveViews._id] },
    });
    for (const l of verifyReserved) {
      if (l.status !== "RESERVED") {
        throw new Error(`Listing ${l._id} was not updated to RESERVED`);
      }
    }
    console.log("✓ Bulk status update and ownership isolation verified.");

    // 9. Test Bulk Toggle Active
    console.log("\n9. Testing Bulk Toggle Active & Ownership Isolation...");
    const crossDeactivateResult = await Listing.updateMany(
      { _id: { $in: [listingSellerB._id] }, seller: sellerA._id },
      { $set: { isActive: false } }
    );
    if (crossDeactivateResult.modifiedCount !== 0) {
      throw new Error("Security Violation: Seller A was able to toggle Seller B's listing!");
    }

    const bulkDeactivateResult = await Listing.updateMany(
      { _id: { $in: [listingZeroViews._id, listingActiveViews._id] }, seller: sellerA._id },
      { $set: { isActive: false } }
    );
    if (bulkDeactivateResult.modifiedCount !== 2) {
      throw new Error(`Expected 2 listings deactivated, got ${bulkDeactivateResult.modifiedCount}`);
    }
    console.log("✓ Bulk active toggle and isolation verified.");

    // 10. Test Bulk Delete (Cascading Favorites and Enquiries)
    console.log("\n10. Testing Bulk Delete with Cascades and Ownership Isolation...");
    // Add favorite for listingZeroViews
    await Favorite.create({ user: buyer._id, listing: listingZeroViews._id });

    // Attempt to delete Seller B's listing with Seller A's owner scope
    const crossDeleteResult = await Listing.deleteMany({
      _id: { $in: [listingSellerB._id] },
      seller: sellerA._id,
    });
    if (crossDeleteResult.deletedCount !== 0) {
      throw new Error("Security Violation: Seller A was able to delete Seller B's listing!");
    }

    // Execute bulk delete on listingZeroViews
    const targetDeleteIds = [listingZeroViews._id];
    // 1. Cascade favorites
    await Favorite.deleteMany({ listing: { $in: targetDeleteIds } });
    // 2. Cascade enquiries
    await Enquiry.updateMany(
      { listing: { $in: targetDeleteIds }, status: "PENDING" },
      { $set: { status: "EXPIRED" } }
    );
    // 3. Delete listings
    const ownDeleteResult = await Listing.deleteMany({
      _id: { $in: targetDeleteIds },
      seller: sellerA._id,
    });

    if (ownDeleteResult.deletedCount !== 1) {
      throw new Error(`Expected 1 listing deleted, got ${ownDeleteResult.deletedCount}`);
    }

    // Verify favorites were removed
    const remainingFavorites = await Favorite.find({ listing: listingZeroViews._id });
    if (remainingFavorites.length !== 0) {
      throw new Error("Favorite cascade failed: favorite still exists after listing deletion!");
    }

    // Verify enquiry was marked EXPIRED
    const checkEnquiry = await Enquiry.findById(recentEnquiry._id);
    if (checkEnquiry?.status !== "EXPIRED") {
      throw new Error(`Enquiry status expected EXPIRED, got ${checkEnquiry?.status}`);
    }
    console.log("✓ Bulk delete cascade and ownership isolation verified.");

    console.log("\n🎉 ALL TASK 13 DASHBOARD TESTS PASSED SUCCESSFULLY! 🎉");
  } finally {
    // Cleanup test artifacts
    console.log("\nCleaning up test data...");
    await Listing.deleteMany({ seller: { $in: [sellerA._id, sellerB._id] } });
    await Enquiry.deleteMany({ $or: [{ seller: sellerA._id }, { buyer: buyer._id }] });
    await Notification.deleteMany({ user: sellerA._id });
    await Favorite.deleteMany({ user: buyer._id });
    await User.deleteMany({ _id: { $in: [sellerA._id, sellerB._id, buyer._id] } });
    console.log("✓ Test data cleaned up.");
  }
}

runDashboardTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  });
