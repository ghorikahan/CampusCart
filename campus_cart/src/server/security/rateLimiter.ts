import { connectDB } from "@/lib/db";
import { RateLimit, type SecurityActionType } from "@/models/RateLimit";
import { subSeconds } from "date-fns";

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  total: number;
  error?: string;
}

/**
 * Checks and records an action attempt against a rate limiting window.
 */
export async function checkRateLimit(
  key: string,
  action: SecurityActionType,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitStatus> {
  await connectDB();

  const now = new Date();
  const windowStart = subSeconds(now, windowSeconds);

  // Count recent attempts within the rolling window
  const recentCount = await RateLimit.countDocuments({
    key,
    action,
    createdAt: { $gte: windowStart },
  });

  if (recentCount >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      total: recentCount,
      error: `Too many requests. Limit is ${maxRequests} per ${Math.round(windowSeconds / 60)} minutes. Please wait before trying again.`,
    };
  }

  // Record this attempt
  await RateLimit.create({
    key,
    action,
    createdAt: now,
  });

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - (recentCount + 1)),
    total: recentCount + 1,
  };
}

/**
 * Rate limit check for Auth attempts (login/register): max 5 attempts per 15 minutes.
 */
export async function checkAuthRateLimit(identifier: string): Promise<RateLimitStatus> {
  const cleanKey = `auth:${identifier.toLowerCase().trim()}`;
  return checkRateLimit(cleanKey, "AUTH", 5, 15 * 60);
}

/**
 * Rate limit check for Image uploads: max 20 uploads per hour.
 */
export async function checkUploadRateLimit(userId: string): Promise<RateLimitStatus> {
  const cleanKey = `upload:${userId}`;
  return checkRateLimit(cleanKey, "UPLOAD", 20, 60 * 60);
}

/**
 * Rate limit check for Buyer enquiries: max 15 enquiries created per hour.
 */
export async function checkEnquiryRateLimit(userId: string): Promise<RateLimitStatus> {
  const cleanKey = `enquiry:${userId}`;
  return checkRateLimit(cleanKey, "ENQUIRY", 15, 60 * 60);
}
