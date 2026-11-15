"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Notification } from "@/models/Notification";
import { isValidObjectId } from "@/lib/serialize";

export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Marks a specific notification as read, scoped strictly to the authenticated user.
 */
export async function markAsRead(
  notificationId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to perform this action." };
    }

    if (!notificationId || !isValidObjectId(notificationId)) {
      return { success: false, error: "Invalid notification ID provided." };
    }

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: user.id,
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!notification) {
      // Check if it was already marked as read or belongs to another user
      const existing = await Notification.findOne({
        _id: notificationId,
        user: user.id,
      });

      if (!existing) {
        return { success: false, error: "Notification not found or access denied." };
      }
      // If already read, return success idempotently
      return { success: true, data: { id: notificationId } };
    }

    revalidatePath("/notifications");
    revalidatePath("/");

    return { success: true, data: { id: notificationId } };
  } catch (error) {
    console.error("markAsRead error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark notification as read.",
    };
  }
}

/**
 * Marks all unread notifications as read for the authenticated user in a single updateMany operation.
 */
export async function markAllAsRead(): Promise<ActionResponse<{ modifiedCount: number }>> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to perform this action." };
    }

    await connectDB();

    const result = await Notification.updateMany(
      {
        user: user.id,
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      }
    );

    revalidatePath("/notifications");
    revalidatePath("/");

    return { success: true, data: { modifiedCount: result.modifiedCount } };
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark all notifications as read.",
    };
  }
}

/**
 * Deletes a notification belonging to the authenticated user.
 */
export async function deleteNotification(
  notificationId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to perform this action." };
    }

    if (!notificationId || !isValidObjectId(notificationId)) {
      return { success: false, error: "Invalid notification ID provided." };
    }

    await connectDB();

    const deleted = await Notification.findOneAndDelete({
      _id: notificationId,
      user: user.id,
    });

    if (!deleted) {
      return { success: false, error: "Notification not found or access denied." };
    }

    revalidatePath("/notifications");
    revalidatePath("/");

    return { success: true, data: { id: notificationId } };
  } catch (error) {
    console.error("deleteNotification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete notification.",
    };
  }
}
