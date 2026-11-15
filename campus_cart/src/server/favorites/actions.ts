"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Favorite } from "@/models/Favorite";
import { isValidObjectId } from "@/lib/serialize";

export type ToggleFavoriteResponse =
  | { success: true; isFavorited: boolean }
  | { success: false; error: string };

/**
 * Toggles a favorite status for a given listing and the authenticated user.
 */
export async function toggleFavorite(listingId: string): Promise<ToggleFavoriteResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Please sign in to save items to your favorites." };
    }

    if (!isValidObjectId(listingId)) {
      return { success: false, error: "Invalid listing ID format." };
    }

    await connectDB();

    const existing = await Favorite.findOne({
      user: user.id,
      listing: listingId,
    });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      revalidatePath(`/listings/${listingId}`);
      revalidatePath("/favorites");
      return { success: true, isFavorited: false };
    } else {
      await Favorite.create({
        user: user.id,
        listing: listingId,
      });
      revalidatePath(`/listings/${listingId}`);
      revalidatePath("/favorites");
      return { success: true, isFavorited: true };
    }
  } catch (error) {
    console.error("toggleFavorite error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update favorites.",
    };
  }
}

/**
 * Checks if the current authenticated user has favorited a specific listing.
 */
export async function isListingFavorited(listingId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user?.id || !isValidObjectId(listingId)) {
      return false;
    }

    await connectDB();
    const count = await Favorite.countDocuments({
      user: user.id,
      listing: listingId,
    });

    return count > 0;
  } catch {
    return false;
  }
}

