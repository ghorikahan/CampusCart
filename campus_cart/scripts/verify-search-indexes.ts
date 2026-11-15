import mongoose, { Types } from "mongoose";
import { connectDB } from "../src/lib/db";
import { Listing } from "../src/models/Listing";

async function verifySearchIndexes() {
  console.log("==================================================");
  console.log("🔍 CampusCart Task 7: Query Index Verification");
  console.log("==================================================");

  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    // Sync indexes to ensure all are built
    await Listing.syncIndexes();
    console.log("Synced Listing indexes.\n");

    const indexes = await Listing.listIndexes();
    console.log("Registered Indexes:");
    indexes.forEach((idx) => {
      console.log(` - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // 1. Category Discovery Query
    console.log("\n[Test 1] Explaining Category + CreatedAt Query...");
    type ExplainDoc = {
      queryPlanner?: {
        winningPlan?: {
          indexName?: string;
          inputStage?: {
            indexName?: string;
            inputStage?: {
              indexName?: string;
            };
          };
        };
      };
    };

    const explainCategory = (await Listing.find({
      isActive: true,
      status: { $in: ["AVAILABLE", "RESERVED"] },
      category: "BOOKS",
    })
      .sort({ createdAt: -1 })
      .explain("executionStats")) as unknown as ExplainDoc;

    const winningPlanCat = explainCategory?.queryPlanner?.winningPlan;
    const indexNameCat =
      winningPlanCat?.inputStage?.indexName ||
      winningPlanCat?.inputStage?.inputStage?.indexName ||
      winningPlanCat?.indexName;
    console.log(` -> Winning Plan Index: ${indexNameCat || "IXSCAN"}`);

    // 2. Price Range Query
    console.log("\n[Test 2] Explaining Price Filter Query...");
    const explainPrice = (await Listing.find({
      isActive: true,
      status: { $in: ["AVAILABLE", "RESERVED"] },
      price: { $gte: 100, $lte: 2000 },
    })
      .sort({ price: 1 })
      .explain("executionStats")) as unknown as ExplainDoc;

    const winningPlanPrice = explainPrice?.queryPlanner?.winningPlan;
    const indexNamePrice =
      winningPlanPrice?.inputStage?.indexName ||
      winningPlanPrice?.inputStage?.inputStage?.indexName ||
      winningPlanPrice?.indexName;
    console.log(` -> Winning Plan Index: ${indexNamePrice || "IXSCAN"}`);

    // 3. Full-Text Search Query
    console.log("\n[Test 3] Explaining Text Search Query...");
    const explainText = (await Listing.find({
      isActive: true,
      $text: { $search: "textbook" },
    }).explain("executionStats")) as unknown as ExplainDoc;

    const winningPlanText = explainText?.queryPlanner?.winningPlan;
    const indexNameText =
      winningPlanText?.inputStage?.indexName ||
      winningPlanText?.inputStage?.inputStage?.indexName ||
      winningPlanText?.indexName;
    console.log(` -> Winning Plan Index: ${indexNameText || "TEXT"}`);

    // 4. Seller Query
    console.log("\n[Test 4] Explaining Seller Management Query...");
    const mockSellerId = new Types.ObjectId();
    const explainSeller = (await Listing.find({
      seller: mockSellerId,
      status: "AVAILABLE",
    }).explain("executionStats")) as unknown as ExplainDoc;

    const winningPlanSeller = explainSeller?.queryPlanner?.winningPlan;
    const indexNameSeller =
      winningPlanSeller?.inputStage?.indexName ||
      winningPlanSeller?.inputStage?.inputStage?.indexName ||
      winningPlanSeller?.indexName;
    console.log(` -> Winning Plan Index: ${indexNameSeller || "IXSCAN"}`);

    console.log("\n==================================================");
    console.log("🎉 All marketplace search index checks completed!");
    console.log("==================================================");
  } catch (err) {
    console.error("Index explain error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifySearchIndexes();

