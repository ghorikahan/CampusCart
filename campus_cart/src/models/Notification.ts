import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type NotificationType =
  | "ENQUIRY_RECEIVED"
  | "ENQUIRY_ACCEPTED"
  | "ENQUIRY_REJECTED"
  | "FAVORITE_SOLD"
  | "FAVORITE_PRICE_DROP"
  | "SYSTEM";

export interface INotification {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = Document<Types.ObjectId, object, INotification> &
  INotification;

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    type: {
      type: String,
      enum: [
        "ENQUIRY_RECEIVED",
        "ENQUIRY_ACCEPTED",
        "ENQUIRY_REJECTED",
        "FAVORITE_SOLD",
        "FAVORITE_PRICE_DROP",
        "SYSTEM",
      ],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Notification body is required"],
      trim: true,
      maxlength: [1000, "Body cannot exceed 1000 characters"],
    },
    link: {
      type: String,
      trim: true,
      maxlength: [500, "Link cannot exceed 500 characters"],
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching unread and recent notifications for a user quickly
NotificationSchema.index(
  { user: 1, readAt: 1, createdAt: -1 },
  { name: "user_readAt_created" }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

