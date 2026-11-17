import { type PipelineStage } from "mongoose";
import { connectDB } from "@/lib/db";
import { Listing, type ListingCategory, type ListingCondition, type ListingType } from "@/models/Listing";
import { serializeDocuments } from "@/lib/serialize";
import { type ListingCardData } from "@/components/shared/ListingCard";

export type ListingSortOption =
  | "newest"
  | "relevance"
  | "price_asc"
  | "price_desc";

export interface SearchListingsParams {
  q?: string;
  category?: ListingCategory | ListingCategory[] | string | string[];
  minPrice?: number;
  maxPrice?: number;
  conditions?: ListingCondition | ListingCondition[] | string | string[];
  types?: ListingType | ListingType[] | string | string[];
  sort?: ListingSortOption;
  page?: number;
  pageSize?: number;
  includeReserved?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface SearchListingsResult {
  listings: ListingCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  price: number | null;
  listingType: string;
  image?: string;
}

const PUBLIC_SELLER_FIELDS =
  "name image university course city phone showPhone";

/**
 * Escapes characters with special meaning in regex to prevent regex injection.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Executes a full-featured marketplace search using MongoDB text search,
 * compound indexes, and regex fallback for partial/short queries.
 */
export async function searchListings(
  params: SearchListingsParams
): Promise<SearchListingsResult> {
  await connectDB();

  const {
    q,
    category,
    minPrice,
    maxPrice,
    conditions,
    types,
    sort = q?.trim() ? "relevance" : "newest",
    page = 1,
    pageSize = 12,
    includeReserved = true,
    lat,
    lng,
    radiusKm = 5,
  } = params;

  const currentPage = Math.max(1, page);
  const limit = Math.max(1, Math.min(100, pageSize));
  const skip = (currentPage - 1) * limit;

  // 1. Build Base Match Query
  const matchQuery: Record<string, unknown> = {
    isActive: true,
  };

  // Status Filter: default to AVAILABLE and RESERVED (exclude SOLD)
  if (includeReserved) {
    matchQuery.status = { $in: ["AVAILABLE", "RESERVED"] };
  } else {
    matchQuery.status = "AVAILABLE";
  }

  // Category filter
  if (category) {
    const categoriesArray = (Array.isArray(category) ? category : [category])
      .map((c) => String(c).toUpperCase())
      .filter((c) => c && c !== "ALL");

    if (categoriesArray.length > 0) {
      matchQuery.category = { $in: categoriesArray };
    }
  }

  // Condition filter
  if (conditions) {
    const conditionsArray = (Array.isArray(conditions) ? conditions : [conditions])
      .map((c) => String(c).toUpperCase())
      .filter((c) => c && c !== "ALL");

    if (conditionsArray.length > 0) {
      matchQuery.condition = { $in: conditionsArray };
    }
  }

  // Listing Type filter
  if (types) {
    const typesArray = (Array.isArray(types) ? types : [types])
      .map((t) => String(t).toUpperCase())
      .filter((t) => t && t !== "ALL");

    if (typesArray.length > 0) {
      matchQuery.listingType = { $in: typesArray };
    }
  }

  // Price Range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      priceFilter.$lte = Number(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      matchQuery.price = priceFilter;
    }
  }

  const hasGeo =
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng);

  // 2. Geospatial Discovery ($geoNear must be the FIRST pipeline stage)
  if (hasGeo) {
    const cleanQ = q?.trim();
    if (cleanQ) {
      const escaped = escapeRegex(cleanQ);
      matchQuery.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const radius =
      radiusKm && [2, 5, 10, 25].includes(Number(radiusKm))
        ? Number(radiusKm)
        : Number(radiusKm) > 0
        ? Number(radiusKm)
        : 5;
    const maxDistanceMeters = radius * 1000;

    const geoPipeline: PipelineStage[] = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distance",
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: matchQuery,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          results: [
            ...(sort === "price_asc"
              ? [{ $sort: { price: 1 as const, distance: 1 as const } }]
              : sort === "price_desc"
              ? [{ $sort: { price: -1 as const, distance: 1 as const } }]
              : sort === "newest"
              ? [{ $sort: { createdAt: -1 as const, distance: 1 as const } }]
              : [{ $sort: { distance: 1 as const } }]),
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "seller",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      image: 1,
                      university: 1,
                      course: 1,
                      city: 1,
                      phone: 1,
                      showPhone: 1,
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
          ],
        },
      },
    ];

    const aggResult = await Listing.aggregate(geoPipeline);
    const total = aggResult[0]?.metadata[0]?.total ?? 0;
    const rawListings = aggResult[0]?.results ?? [];
    const listings = serializeDocuments<ListingCardData>(rawListings);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      listings,
      total,
      page: currentPage,
      pageSize: limit,
      totalPages,
    };
  }

  // 2. Text Search with Regex Fallback
  const cleanQ = q?.trim();
  let isTextScoreSort = false;

  if (cleanQ) {
    if (cleanQ.length >= 3) {
      // Primary: Weighted MongoDB $text index
      const textQuery = { ...matchQuery, $text: { $search: cleanQ } };
      const textCount = await Listing.countDocuments(textQuery);

      if (textCount > 0) {
        matchQuery.$text = { $search: cleanQ };
        if (sort === "relevance") {
          isTextScoreSort = true;
        }
      } else {
        // Fallback: Safe case-insensitive regex on title & description
        const escaped = escapeRegex(cleanQ);
        matchQuery.$or = [
          { title: { $regex: escaped, $options: "i" } },
          { description: { $regex: escaped, $options: "i" } },
        ];
      }
    } else {
      // Short queries (< 3 chars): regex fallback on title
      const escaped = escapeRegex(cleanQ);
      matchQuery.title = { $regex: escaped, $options: "i" };
    }
  }

  // 3. Define Sorting Strategy
  const sortStrategy: Record<string, 1 | -1 | { $meta: "textScore" }> = {};

  if (isTextScoreSort) {
    sortStrategy.score = { $meta: "textScore" };
    sortStrategy.createdAt = -1;
  } else if (sort === "price_asc") {
    sortStrategy.price = 1;
    sortStrategy.createdAt = -1;
  } else if (sort === "price_desc") {
    sortStrategy.price = -1;
    sortStrategy.createdAt = -1;
  } else {
    // "newest" or default
    sortStrategy.createdAt = -1;
  }

  // 4. Parallel Query & Count for High Performance
  const projection = isTextScoreSort ? { score: { $meta: "textScore" } } : {};

  const [rawListings, total] = await Promise.all([
    Listing.find(matchQuery, projection)
      .sort(sortStrategy)
      .skip(skip)
      .limit(limit)
      .populate("seller", PUBLIC_SELLER_FIELDS)
      .lean(),
    Listing.countDocuments(matchQuery),
  ]);

  const listings = serializeDocuments<ListingCardData>(rawListings);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    listings,
    total,
    page: currentPage,
    pageSize: limit,
    totalPages,
  };
}

/**
 * Fast search suggestions for debounced dropdown (top 5 matching items).
 */
export async function getSearchSuggestions(
  query: string,
  limit = 5
): Promise<SearchSuggestion[]> {
  const clean = query?.trim();
  if (!clean || clean.length < 2) {
    return [];
  }

  await connectDB();

  const escaped = escapeRegex(clean);
  const matches = await Listing.find(
    {
      isActive: true,
      status: { $ne: "SOLD" },
      title: { $regex: escaped, $options: "i" },
    },
    "title category price listingType images"
  )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return matches.map((item) => ({
    id: String(item._id),
    title: item.title,
    category: item.category,
    price: item.price ?? null,
    listingType: item.listingType,
    image: item.images?.[0]?.url,
  }));
}

