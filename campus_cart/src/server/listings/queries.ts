import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Listing, type ListingStatus } from "@/models/Listing";
import { isValidObjectId, serializeDocument, serializeDocuments } from "@/lib/serialize";

const PUBLIC_SELLER_FIELDS =
  "name email image bio university course city phone showPhone contactPreference createdAt";

/**
 * Retrieves a single listing by its MongoDB ID.
 * Populates the seller reference with safe public profile fields only.
 */
export async function getListingById(id: string) {
  try {
    if (!isValidObjectId(id)) {
      return null;
    }

    await connectDB();

    const listing = await Listing.findById(id)
      .populate("seller", PUBLIC_SELLER_FIELDS)
      .lean();

    if (!listing) {
      return null;
    }

    return serializeDocument(listing);
  } catch (error) {
    console.error("getListingById query error:", error);
    return null;
  }
}

/**
 * Retrieves listings posted by a specific seller.
 */
export async function getListingsBySeller(
  sellerId: string,
  options: {
    limit?: number;
    page?: number;
    activeOnly?: boolean;
  } = {}
) {
  try {
    if (!isValidObjectId(sellerId)) {
      return [];
    }

    const { limit = 20, page = 1, activeOnly = true } = options;
    const skip = Math.max(0, (page - 1) * limit);

    await connectDB();

    const filter: Record<string, unknown> = { seller: sellerId };
    if (activeOnly) {
      filter.isActive = true;
    }

    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("seller", PUBLIC_SELLER_FIELDS)
      .lean();

    return serializeDocuments(listings);
  } catch (error) {
    console.error("getListingsBySeller query error:", error);
    return [];
  }
}

/**
 * Retrieves listings created by the current authenticated user.
 * Supports filtering by status ("ALL", "AVAILABLE", "RESERVED", "SOLD").
 */
export async function getMyListings(
  statusFilter?: "ALL" | ListingStatus
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return [];
    }

    await connectDB();

    const filter: Record<string, unknown> = { seller: user.id };
    if (statusFilter && statusFilter !== "ALL") {
      filter.status = statusFilter;
    }

    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return serializeDocuments(listings);
  } catch (error) {
    console.error("getMyListings query error:", error);
    return [];
  }
}

/**
 * Atomically increments the view count of a listing once per session / 24 hours.
 * Uses a secure cookie containing visited listing IDs to avoid spam.
 */
export async function incrementViewCount(listingId: string): Promise<boolean> {
  try {
    if (!isValidObjectId(listingId)) {
      return false;
    }

    await connectDB();

    // Check cookie store to avoid double-counting within 24 hours
    const cookieStore = await cookies();
    const cookieName = "cc_viewed_listings";
    const viewedRaw = cookieStore.get(cookieName)?.value ?? "";

    const viewedSet = new Set(
      viewedRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );

    if (viewedSet.has(listingId)) {
      // Already viewed recently
      return false;
    }

    // Atomic increment in MongoDB
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { viewCount: 1 },
    });

    // Update cookie with new listing ID
    viewedSet.add(listingId);
    // Keep max 50 recent listing IDs to prevent cookie header bloat
    const updatedIds = Array.from(viewedSet).slice(-50).join(",");

    cookieStore.set(cookieName, updatedIds, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return true;
  } catch (error) {
    // If called in a context where cookies cannot be set (e.g., streaming/static), handle gracefully
    console.warn("incrementViewCount skipped or failed:", error);
    return false;
  }
}

