import { connectDB } from "@/lib/db";
import { Notification, type NotificationType, type INotification } from "@/models/Notification";
import { sendNotificationEmail } from "./email";
import type { Types } from "mongoose";

export interface CreateNotificationParams {
  user: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

/**
 * Creates a single notification in MongoDB and triggers email dispatch if enabled.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<INotification | null> {
  try {
    await connectDB();
    const doc = await Notification.create({
      user: params.user,
      type: params.type,
      title: params.title.trim(),
      body: params.body.trim(),
      link: params.link?.trim(),
      readAt: null,
    });

    // Trigger non-blocking email dispatch if applicable
    sendNotificationEmail({
      userId: params.user.toString(),
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
    }).catch((err) => {
      console.warn("[createNotification] Email dispatch error:", err);
    });

    return doc.toObject() as INotification;
  } catch (err) {
    console.error("[createNotification] Failed to create notification:", err);
    return null;
  }
}

/**
 * Bulk creates notifications in MongoDB (e.g. for price drop or item sold alerts to multiple users).
 */
export async function createManyNotifications(
  items: CreateNotificationParams[]
): Promise<void> {
  if (!items || items.length === 0) return;

  try {
    await connectDB();
    const docs = items.map((item) => ({
      user: item.user,
      type: item.type,
      title: item.title.trim(),
      body: item.body.trim(),
      link: item.link?.trim(),
      readAt: null,
    }));

    await Notification.insertMany(docs, { ordered: false });

    // Non-blocking email dispatch for relevant types
    for (const item of items) {
      if (
        ["ENQUIRY_ACCEPTED", "ENQUIRY_REJECTED", "ENQUIRY_RECEIVED"].includes(
          item.type
        )
      ) {
        sendNotificationEmail({
          userId: item.user.toString(),
          type: item.type,
          title: item.title,
          body: item.body,
          link: item.link,
        }).catch((err) => {
          console.warn("[createManyNotifications] Email dispatch error:", err);
        });
      }
    }
  } catch (err) {
    console.error("[createManyNotifications] Failed to create notifications in bulk:", err);
  }
}

