import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Listing } from "../src/models/Listing";
import { RateLimit } from "../src/models/RateLimit";
import { Favorite } from "../src/models/Favorite";

async function runExplainTests() {
  console.log("=== Testing Database Query Execution Plans (explain) ===");
  await connectDB();

  // Ensure all schema indexes are synced
  await Listing.syncIndexes();
  await RateLimit.syncIndexes();
  await Favorite.syncIndexes();

  console.log("✔ Indexes successfully synced on Listing, RateLimit, and Favorite collections.\n");

  // Helper to extract stage names from explain output
  function findStages(plan: unknown): string[] {
    const stages: string[] = [];
    function traverse(node: unknown) {
      if (!node || typeof node !== "object") return;
      const rec = node as Record<string, unknown>;
      if (typeof rec.stage === "string") stages.push(rec.stage);
      if (rec.inputStage) traverse(rec.inputStage);
      if (Array.isArray(rec.inputStages)) rec.inputStages.forEach(traverse);
      if (rec.executionStages) traverse(rec.executionStages);
      if (rec.queryPlanner) traverse(rec.queryPlanner);
      if (rec.winningPlan) traverse(rec.winningPlan);
      if (Array.isArray(rec.shards)) rec.shards.forEach(traverse);
      if (Array.isArray(rec.stages)) rec.stages.forEach(traverse);
    }
    traverse(plan);
    return stages;
  }

  // 1. Discovery Query: Active listings by category sorted by createdAt
  console.log("1. Checking Discovery Category Query: { isActive: true, status: 'AVAILABLE', category: 'BOOKS' } sorted by createdAt DESC");
  const discoveryExplain = await Listing.find({
    isActive: true,
    status: "AVAILABLE",
    category: "BOOKS",
  })
    .sort({ createdAt: -1 })
    .limit(12)
    .explain("executionStats");

  const discoveryStages = findStages(discoveryExplain);
  const usesIndex = discoveryStages.includes("IXSCAN");
  console.log("   Stages found:", Array.from(new Set(discoveryStages)).join(" -> "));
  if (!usesIndex) {
    throw new Error("Discovery query did not use IXSCAN!");
  }
  console.log("   ✔ Discovery query successfully utilizes IXSCAN!\n");

  // 2. Seller Listings Query: { seller: ..., status: ... }
  const mockSellerId = new mongoose.Types.ObjectId();
  console.log("2. Checking Seller Dashboard Query: { seller: mockId, status: 'AVAILABLE' }");
  const sellerExplain = await Listing.find({
    seller: mockSellerId,
    status: "AVAILABLE",
  })
    .sort({ createdAt: -1 })
    .explain("executionStats");

  const sellerStages = findStages(sellerExplain);
  const sellerUsesIndex = sellerStages.includes("IXSCAN");
  console.log("   Stages found:", Array.from(new Set(sellerStages)).join(" -> "));
  if (!sellerUsesIndex) {
    throw new Error("Seller query did not use IXSCAN!");
  }
  console.log("   ✔ Seller dashboard query successfully utilizes IXSCAN!\n");

  // 3. Text Search Query: $text: { $search: "book" }
  console.log("3. Checking Text Search Query: { $text: { $search: 'book' } }");
  const textExplain = await Listing.find({
    $text: { $search: "book" },
    isActive: true,
  }).explain("executionStats");

  const textStages = findStages(textExplain);
  const textUsesIndex = textStages.includes("TEXT") || textStages.includes("TEXT_MATCH") || textStages.includes("IXSCAN");
  console.log("   Stages found:", Array.from(new Set(textStages)).join(" -> "));
  if (!textUsesIndex) {
    throw new Error("Text search query did not use text index scan!");
  }
  console.log("   ✔ Text search query successfully utilizes TEXT index!\n");

  // 4. Rate Limiting Query: { key: "test", action: "auth" }
  console.log("4. Checking RateLimit Query: { key: 'test', action: 'AUTH', createdAt: { $gte: ... } }");
  const rateLimitExplain = await RateLimit.find({
    key: "127.0.0.1",
    action: "AUTH",
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
  }).explain("executionStats");

  const rlStages = findStages(rateLimitExplain);
  const rlUsesIndex = rlStages.includes("IXSCAN");
  console.log("   Stages found:", Array.from(new Set(rlStages)).join(" -> "));
  if (!rlUsesIndex) {
    throw new Error("Rate limit query did not use IXSCAN!");
  }
  console.log("   ✔ Rate limit query successfully utilizes compound IXSCAN!\n");

  // 5. Geospatial $geoNear aggregation
  console.log("5. Checking Geospatial Aggregation: $geoNear stage");
  const geoExplain: unknown = await Listing.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [77.209, 28.6139] },
        distanceField: "distance",
        maxDistance: 5000,
        spherical: true,
        query: { isActive: true, status: "AVAILABLE" },
      },
    },
    { $limit: 10 },
  ]).explain("executionStats");

  const geoJson = JSON.stringify(geoExplain);
  const geoUsesIndex = geoJson.includes("GEO_NEAR") || geoJson.includes("IXSCAN") || geoJson.includes("location_2dsphere");
  console.log("   Geo plan snippet:", geoJson.slice(0, 300));
  if (!geoUsesIndex) {
    throw new Error("Geospatial aggregation did not use geospatial index!");
  }
  console.log("   ✔ Geospatial query successfully utilizes GEO index!\n");

  console.log("🎉 ALL INDEX PERFORMANCE & EXPLAIN CHECKS PASSED!");
  process.exit(0);
}

runExplainTests().catch((err) => {
  console.error("❌ Performance test failed:", err);
  process.exit(1);
});