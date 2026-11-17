import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type SecurityActionType = "AUTH" | "UPLOAD" | "ENQUIRY" | "AI";

export interface IRateLimit {
  _id: Types.ObjectId;
  key: string;
  action: SecurityActionType;
  createdAt: Date;
}

export type RateLimitDocument = Document<Types.ObjectId, object, IRateLimit> & IRateLimit;

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["AUTH", "UPLOAD", "ENQUIRY", "AI"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// TTL index to automatically purge records older than 1 hour (3600 seconds)
RateLimitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600, name: "rate_limit_ttl_1h" });

// Fast lookup compound index
RateLimitSchema.index({ key: 1, action: 1, createdAt: -1 }, { name: "key_action_created_idx" });

export const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);

export default RateLimit;
