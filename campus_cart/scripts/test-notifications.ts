import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Notification } from "../src/models/Notification";
import {
  createNotification,
  createManyNotifications,
} from "../src/server/notifications/create";
import mongoose from "mongoose";

async function runNotificationsTest() {
  console.log("=== CampusCart Task 11 Notifications Test Suite ===");
  await connectDB();

  // 1. Verify indexes
  console.log("\n1. Verifying Notification indexes...");
  await Notification.syncIndexes();
  const indexes = await Notification.collection.indexes();
  const indexNames = indexes.map((idx) => idx.name);
  console.log("Found indexes:", indexNames);

  const hasTtl = indexes.some(
    (idx) => idx.name === "readAt_ttl_90d" && idx.expireAfterSeconds === 90 * 24 * 60 * 60
  );
  const hasCompound = indexes.some((idx) => idx.name === "user_readAt_created");

  if (!hasTtl) {
    throw new Error("Missing readAt_ttl_90d index with 90-day expiration");
  }
  if (!hasCompound) {
    throw new Error("Missing user_readAt_created compound index");
  }
  console.log("✓ TTL (90 days) and compound indexes verified successfully");

  // 2. Set up test users
  console.log("\n2. Setting up test users...");
  const userAEmail = `notif_test_a_${Date.now()}@university.edu`;
  const userBEmail = `notif_test_b_${Date.now()}@university.edu`;

  const userA = await User.create({
    name: "Notification User A",
    email: userAEmail,
    passwordHash: "dummyhash123",
    university: "State University",
  });

  const userB = await User.create({
    name: "Notification User B",
    email: userBEmail,
    passwordHash: "dummyhash123",
    university: "State University",
  });
  console.log(`✓ Created test users: User A (${userA._id}), User B (${userB._id})`);

  try {
    // 3. Test createNotification
    console.log("\n3. Testing createNotification helper...");
    const notif1 = await createNotification({
      user: userA._id,
      type: "ENQUIRY_RECEIVED",
      title: "New Enquiry Received",
      body: "User B sent an enquiry on your Physics Textbook.",
      link: "/enquiries",
    });

    if (!notif1 || notif1.title !== "New Enquiry Received") {
      throw new Error("Failed to create single notification via createNotification");
    }
    console.log("✓ createNotification created document with ID:", notif1._id);

    // 4. Test createManyNotifications
    console.log("\n4. Testing createManyNotifications helper...");
    await createManyNotifications([
      {
        user: userA._id,
        type: "FAVORITE_PRICE_DROP",
        title: "Price Drop Alert!",
        body: "Calculus Early Transcendentals dropped to ₹400.",
        link: "/listings/123",
      },
      {
        user: userA._id,
        type: "ENQUIRY_ACCEPTED",
        title: "Offer Accepted! 🎉",
        body: "Your offer on Lab Coat was accepted.",
        link: "/enquiries",
      },
      {
        user: userB._id,
        type: "SYSTEM",
        title: "Welcome to CampusCart",
        body: "Thanks for joining the student community!",
      },
    ]);

    const countUserA = await Notification.countDocuments({ user: userA._id });
    const countUserB = await Notification.countDocuments({ user: userB._id });
    console.log(`✓ User A notifications: ${countUserA} (expected 3)`);
    console.log(`✓ User B notifications: ${countUserB} (expected 1)`);

    if (countUserA !== 3 || countUserB !== 1) {
      throw new Error("Notification count mismatch after bulk creation");
    }

    // 5. Test Unread Count logic
    console.log("\n5. Testing unread count query logic...");
    const unreadCountA = await Notification.countDocuments({
      user: userA._id,
      readAt: null,
    });
    console.log(`✓ Unread count for User A: ${unreadCountA} (expected 3)`);
    if (unreadCountA !== 3) {
      throw new Error("Unread count incorrect");
    }

    // 6. Test Mark as Read (Atomic update)
    console.log("\n6. Testing mark single notification as read...");
    const updated = await Notification.findOneAndUpdate(
      { _id: notif1._id, user: userA._id, readAt: null },
      { $set: { readAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!updated || !updated.readAt) {
      throw new Error("Failed to mark single notification as read");
    }

    const unreadCountAfterOne = await Notification.countDocuments({
      user: userA._id,
      readAt: null,
    });
    console.log(`✓ Unread count after marking 1 read: ${unreadCountAfterOne} (expected 2)`);
    if (unreadCountAfterOne !== 2) {
      throw new Error("Unread count after marking single read is incorrect");
    }

    // 7. Test User Scoping & Isolation
    console.log("\n7. Testing user security scoping (User B cannot modify User A's notification)...");
    const unauthorizedUpdate = await Notification.findOneAndUpdate(
      { _id: notif1._id, user: userB._id },
      { $set: { readAt: new Date() } }
    );
    if (unauthorizedUpdate) {
      throw new Error("Security violation: User B updated User A's notification!");
    }
    console.log("✓ Access control verified: cross-user modification rejected");

    // 8. Test Mark All As Read (updateMany)
    console.log("\n8. Testing markAllAsRead (updateMany)...");
    const markAllResult = await Notification.updateMany(
      { user: userA._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    console.log(`✓ Modified count: ${markAllResult.modifiedCount} (expected 2)`);

    const unreadFinalA = await Notification.countDocuments({
      user: userA._id,
      readAt: null,
    });
    console.log(`✓ Final unread count for User A: ${unreadFinalA} (expected 0)`);
    if (unreadFinalA !== 0) {
      throw new Error("markAllAsRead failed to set readAt on all unread notifications");
    }

    // 9. Test Delete Notification
    console.log("\n9. Testing deleteNotification...");
    const deleted = await Notification.findOneAndDelete({
      _id: notif1._id,
      user: userA._id,
    });
    if (!deleted) {
      throw new Error("Failed to delete notification");
    }

    const countAfterDelete = await Notification.countDocuments({ user: userA._id });
    console.log(`✓ Count after delete: ${countAfterDelete} (expected 2)`);
    if (countAfterDelete !== 2) {
      throw new Error("Notification count after delete is incorrect");
    }

    console.log("\n=== ALL NOTIFICATION TESTS PASSED SUCCESSFULLY! ===");
  } finally {
    // Cleanup
    console.log("\nCleaning up test records...");
    await Notification.deleteMany({ user: { $in: [userA._id, userB._id] } });
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    await mongoose.disconnect();
    console.log("✓ Cleanup finished and disconnected from DB.");
  }
}

runNotificationsTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
