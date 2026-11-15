import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getCurrentUser } from "@/server/auth";
import { serializeDocuments } from "@/lib/serialize";
import type { SerializedNotification, PaginatedNotificationsResult } from "./types";

/**
 * Returns the count of unread notifications for the current authenticated user.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user?.id) return 0;

  await connectDB();
  return Notification.countDocuments({
    user: user.id,
    readAt: null,
  });
}

/**
 * Returns the latest notifications (default 8) for the navbar bell dropdown.
 */
export async function getRecentNotifications(
  limit = 8
): Promise<SerializedNotification[]> {
  const user = await getCurrentUser();
  if (!user?.id) return [];

  await connectDB();
  const docs = await Notification.find({ user: user.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return serializeDocuments<SerializedNotification>(docs);
}

export interface GetNotificationsParams {
  filter?: "all" | "unread";
  page?: number;
  pageSize?: number;
}

/**
 * Returns paginated notifications with total count and unread count for /notifications page.
 */
export async function getNotifications({
  filter = "all",
  page = 1,
  pageSize = 15,
}: GetNotificationsParams = {}): Promise<PaginatedNotificationsResult> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return {
      notifications: [],
      total: 0,
      unreadCount: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    };
  }

  await connectDB();

  const query: Record<string, unknown> = { user: user.id };
  if (filter === "unread") {
    query.readAt = null;
  }

  const validPage = Math.max(1, page);
  const skip = (validPage - 1) * pageSize;

  const [docs, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: user.id, readAt: null }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    notifications: serializeDocuments<SerializedNotification>(docs),
    total,
    unreadCount,
    page: validPage,
    pageSize,
    totalPages,
  };
}
