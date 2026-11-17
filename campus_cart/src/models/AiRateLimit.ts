import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type AiActionType = "DESCRIPTION" | "CATEGORY";

export interface IAiRateLimit {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: AiActionType;
  createdAt: Date;
}

export type AiRateLimitDocument = Document<Types.ObjectId, object, IAiRateLimit> & IAiRateLimit;

const AiRateLimitSchema = new Schema<IAiRateLimit>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["DESCRIPTION", "CATEGORY"],
      default: "DESCRIPTION",
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
AiRateLimitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600, name: "ai_rate_limit_ttl_1h" });

// Compound index for fast rate-limit lookups per user and action
AiRateLimitSchema.index({ user: 1, action: 1 }, { name: "user_action_idx" });

export const AiRateLimit: Model<IAiRateLimit> =
  mongoose.models.AiRateLimit || mongoose.model<IAiRateLimit>("AiRateLimit", AiRateLimitSchema);

export default AiRateLimit;
