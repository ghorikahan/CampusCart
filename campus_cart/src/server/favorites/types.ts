import type { ListingCardData } from "@/components/shared/ListingCard";

export type FavoriteFilterType = "all" | "available" | "unavailable";
export type FavoriteSortType = "newest" | "oldest" | "price_asc" | "price_desc";

export interface SerializedFavoriteItem {
  id: string;
  createdAt: string;
  isAvailable: boolean;
  unavailableReason?: "SOLD" | "RESERVED" | "DEACTIVATED" | "DELETED";
  listing: ListingCardData | null;
  similarUrl: string;
}

export interface FavoriteListingsResult {
  items: SerializedFavoriteItem[];
  total: number;
  availableCount: number;
  unavailableCount: number;
}

