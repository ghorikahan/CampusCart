import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Favorite } from "@/models/Favorite";
import { type IListing } from "@/models/Listing";
import { type IUser } from "@/models/User";
import { serializeData } from "@/lib/serialize";
import type {
  SerializedFavoriteItem,
  FavoriteFilterType,
  FavoriteSortType,
  FavoriteListingsResult,
} from "./types";
import type { ListingCardData } from "@/components/shared/ListingCard";

/**
 * Returns a set of listing IDs that the currently authenticated user has favorited.
 * When listingIds is passed, scopes the query to only those IDs for high performance.
 */
export async function getUserFavoriteListingIds(
  listingIds?: string[]
): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user?.id) return [];

  await connectDB();

  const query: Record<string, unknown> = { user: user.id };
  if (listingIds && listingIds.length > 0) {
    query.listing = { $in: listingIds };
  }

  const favorites = await Favorite.find(query).select("listing").lean();
  return favorites.map((f) => f.listing.toString());
}

/**
 * Returns the total count of favorites for the authenticated user.
 */
export async function getFavoriteCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user?.id) return 0;

  await connectDB();
  return Favorite.countDocuments({ user: user.id });
}

interface GetFavoriteListingsOptions {
  filter?: FavoriteFilterType;
  sort?: FavoriteSortType;
}

/**
 * Fetches saved listings for the current user, populates the listing data,
 * and categorizes available vs unavailable (sold, deactivated, deleted) items.
 */
export async function getFavoriteListings({
  filter = "all",
  sort = "newest",
}: GetFavoriteListingsOptions = {}): Promise<FavoriteListingsResult> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return {
      items: [],
      total: 0,
      availableCount: 0,
      unavailableCount: 0,
    };
  }

  await connectDB();

  // Populate listing and nested seller details
  const docs = await Favorite.find({ user: user.id })
    .sort({ createdAt: -1 })
    .populate<{
      listing: (IListing & { seller: IUser }) | null;
    }>({
      path: "listing",
      populate: {
        path: "seller",
        select: "name image university city",
      },
    })
    .lean();

  let availableCount = 0;
  let unavailableCount = 0;

  const allItems: SerializedFavoriteItem[] = docs.map((doc) => {
    const listingDoc = doc.listing;

    // Handle case where listing was deleted (populate returns null)
    if (!listingDoc) {
      unavailableCount++;
      return {
        id: doc._id.toString(),
        createdAt: doc.createdAt.toISOString(),
        isAvailable: false,
        unavailableReason: "DELETED",
        listing: null,
        similarUrl: "/browse",
      };
    }

    const isAvailable =
      listingDoc.isActive === true && listingDoc.status === "AVAILABLE";

    let unavailableReason:
      | "SOLD"
      | "RESERVED"
      | "DEACTIVATED"
      | "DELETED"
      | undefined;

    if (!isAvailable) {
      if (listingDoc.status === "SOLD") {
        unavailableReason = "SOLD";
      } else if (listingDoc.status === "RESERVED") {
        unavailableReason = "RESERVED";
      } else if (!listingDoc.isActive) {
        unavailableReason = "DEACTIVATED";
      }
      unavailableCount++;
    } else {
      availableCount++;
    }

    const sellerObj = listingDoc.seller || {};

    const listingCardData: ListingCardData = {
      id: listingDoc._id.toString(),
      title: listingDoc.title,
      price: listingDoc.price ?? null,
      category: listingDoc.category,
      condition: listingDoc.condition,
      listingType: listingDoc.listingType,
      status: listingDoc.status,
      isActive: listingDoc.isActive,
      images: serializeData(listingDoc.images || []),
      seller: {
        name: sellerObj.name || "Student Seller",
        image: sellerObj.image || null,
        university: sellerObj.university || null,
        city: sellerObj.city || null,
      },
      createdAt: listingDoc.createdAt
        ? new Date(listingDoc.createdAt).toISOString()
        : new Date().toISOString(),
      locationText: listingDoc.locationText,
    };

    return {
      id: doc._id.toString(),
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      isAvailable,
      unavailableReason,
      listing: listingCardData,
      similarUrl: `/browse?category=${listingDoc.category}`,
    };
  });

  // Apply Filter
  let filteredItems = allItems;
  if (filter === "available") {
    filteredItems = allItems.filter((item) => item.isAvailable);
  } else if (filter === "unavailable") {
    filteredItems = allItems.filter((item) => !item.isAvailable);
  }

  // Apply Sort
  filteredItems.sort((a, b) => {
    if (sort === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sort === "price_asc") {
      const priceA = a.listing?.price ?? 0;
      const priceB = b.listing?.price ?? 0;
      return priceA - priceB;
    }
    if (sort === "price_desc") {
      const priceA = a.listing?.price ?? 0;
      const priceB = b.listing?.price ?? 0;
      return priceB - priceA;
    }
    // Default: "newest"
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return {
    items: filteredItems,
    total: allItems.length,
    availableCount,
    unavailableCount,
  };
}

