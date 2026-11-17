import { cookies } from "next/headers";
import mongoose, { type Types, type PipelineStage } from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Listing, type ListingStatus } from "@/models/Listing";
import { isValidObjectId, serializeDocument, serializeDocuments } from "@/lib/serialize";
import { type ListingCardData } from "@/components/shared/ListingCard";

const PUBLIC_SELLER_FIELDS =
  "name image bio university course city phone showPhone contactPreference createdAt";

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

    const serialized = serializeDocument(listing);
    if (serialized && typeof serialized === "object" && "seller" in serialized) {
      const seller = (serialized as Record<string, unknown>).seller as Record<string, unknown> | null;
      if (seller && typeof seller === "object") {
        if (!seller.showPhone) {
          seller.phone = null;
        }
        delete seller.passwordHash;
        delete seller.email;
      }
    }

    return serialized;
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

/**
 * Retrieves similar listings based on:
 * - Same category
 * - Price within ±40% (for FOR_SALE listings)
 * - Excluding current listing and the seller's own listings
 * - Ranked using $text similarity on the title when possible, then recency
 * Implemented with an aggregation pipeline.
 */
/**
 * Retrieves similar listings based on:
 * - Combining MongoDB $text relevance score on title keywords
 * - Exact category match boost (40 pts)
 * - Price proximity score (up to 30 pts inversely proportional to price difference)
 * in a unified aggregation pipeline.
 */
export async function getSimilarListings(
  listing: {
    _id?: string | Types.ObjectId;
    id?: string;
    title: string;
    category: string;
    price?: number | null;
    listingType?: string;
    seller?: string | Types.ObjectId | { _id?: string | Types.ObjectId; id?: string };
  },
  limit: number = 6
): Promise<ListingCardData[]> {
  try {
    await connectDB();

    const listingIdStr = String(listing.id || listing._id);
    if (!isValidObjectId(listingIdStr)) {
      return [];
    }

    const currentListingId = new mongoose.Types.ObjectId(listingIdStr);

    let sellerObjectId: mongoose.Types.ObjectId | null = null;
    if (listing.seller) {
      const sellerIdStr =
        typeof listing.seller === "object"
          ? String(
              (listing.seller as { _id?: string; id?: string })._id ||
                (listing.seller as { id?: string }).id
            )
          : String(listing.seller);
      if (isValidObjectId(sellerIdStr)) {
        sellerObjectId = new mongoose.Types.ObjectId(sellerIdStr);
      }
    }

    const targetLimit = Math.min(8, Math.max(4, limit));
    const targetPrice =
      typeof listing.price === "number" && listing.price > 0 ? listing.price : null;

    // Shared aggregation lookup stage for seller public fields
    const sellerLookupStage: PipelineStage[] = [
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
                image: 1,
                university: 1,
                city: 1,
                contactPreference: 1,
                createdAt: 1,
              },
            },
          ],
          as: "seller",
        },
      },
      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const titleWords = (listing.title || "")
      .replace(/[^\w\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 5)
      .join(" ");

    const baseFilter: Record<string, unknown> = {
      _id: { $ne: currentListingId },
      category: listing.category,
      isActive: true,
      status: { $in: ["AVAILABLE", "RESERVED"] },
      ...(sellerObjectId ? { seller: { $ne: sellerObjectId } } : {}),
    };

    const pipeline: PipelineStage[] = [
      // Candidate collection: text search candidates unioned with category candidates
      ...(titleWords
        ? [
            {
              $match: {
                $text: { $search: titleWords },
                ...baseFilter,
              },
            },
            {
              $addFields: {
                textScore: { $meta: "textScore" },
              },
            },
            { $limit: 15 },
            {
              $unionWith: {
                coll: "listings",
                pipeline: [
                  {
                    $match: baseFilter,
                  },
                  { $limit: 15 },
                ],
              },
            },
          ]
        : [
            {
              $match: baseFilter,
            },
            { $limit: 20 },
          ]),

      // Deduplicate by _id
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          maxTextScore: { $max: { $ifNull: ["$textScore", 0] } },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { textScore: "$maxTextScore" }],
          },
        },
      },

      // Calculate composite recommendation score
      {
        $addFields: {
          categoryScore: {
            $cond: [{ $eq: ["$category", listing.category] }, 40, 0],
          },
          scaledTextScore: {
            $multiply: [{ $ifNull: ["$textScore", 0] }, 10],
          },
          priceScore:
            targetPrice !== null
              ? {
                  $let: {
                    vars: {
                      diff: {
                        $abs: {
                          $subtract: [{ $ifNull: ["$price", targetPrice] }, targetPrice],
                        },
                      },
                    },
                    in: {
                      $multiply: [
                        30,
                        {
                          $divide: [
                            1,
                            {
                              $add: [
                                1,
                                { $divide: ["$$diff", Math.max(1, targetPrice)] },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                }
              : 15,
        },
      },
      {
        $addFields: {
          recommendationScore: {
            $add: ["$categoryScore", "$scaledTextScore", "$priceScore"],
          },
        },
      },
      {
        $sort: {
          recommendationScore: -1,
          createdAt: -1,
        },
      },
      {
        $limit: targetLimit,
      },
      ...sellerLookupStage,
    ];

    const results = await Listing.aggregate(pipeline);
    return serializeDocuments(results) as unknown as ListingCardData[];
  } catch (error) {
    console.error("getSimilarListings error:", error);
    return [];
  }
}


