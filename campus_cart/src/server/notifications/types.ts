import type { NotificationType } from "@/models/Notification";

export type { NotificationType };

export interface SerializedNotification {
  _id: string;
  id: string;
  user: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotificationsResult {
  notifications: SerializedNotification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

