import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

async function seed() {
  console.log("🌱 Starting CampusCart database seed...");

  try {
    await connectDB();
    console.log(" Connected to MongoDB.");

    // Seeding logic will be expanded as models (User, Listing, etc.) are implemented in future tasks.
    console.log(" Database seed complete. Ready for development data.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
    process.exit(0);
  }
}

seed();

