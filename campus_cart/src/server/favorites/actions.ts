"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Favorite } from "@/models/Favorite";
import { isValidObjectId } from "@/lib/serialize";

export type ToggleFavoriteResponse =
  | { success: true; isFavorited: boolean }
  | { success: false; error: string; requiresAuth?: boolean };

/**
 * Toggles a favorite status for a given listing and the authenticated user
 * using an atomic delete / upsert on the unique { user, listing } compound index.
 */
export async function toggleFavorite(
  listingId: string
): Promise<ToggleFavoriteResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Please sign in to save items to your favorites.",
        requiresAuth: true,
      };
    }

    if (!isValidObjectId(listingId)) {
      return { success: false, error: "Invalid listing ID format." };
    }

    await connectDB();

    // 1. Attempt atomic delete first
    const deleted = await Favorite.findOneAndDelete({
      user: user.id,
      listing: listingId,
    });

    if (deleted) {
      revalidatePath(`/listings/${listingId}`);
      revalidatePath("/favorites");
      revalidatePath("/browse");
      revalidatePath("/");
      return { success: true, isFavorited: false };
    }

    // 2. If not previously favorited, perform atomic upsert leveraging unique index
    try {
      await Favorite.findOneAndUpdate(
        { user: user.id, listing: listingId },
        { $setOnInsert: { user: user.id, listing: listingId } },
        { upsert: true, returnDocument: "after" }
      );
    } catch (upsertErr: unknown) {
      // If code 11000 duplicate key occurs due to concurrent click, it is already favorited
      if (
        upsertErr &&
        typeof upsertErr === "object" &&
        "code" in upsertErr &&
        (upsertErr as { code: number }).code === 11000
      ) {
        // Idempotent success
      } else {
        throw upsertErr;
      }
    }

    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/favorites");
    revalidatePath("/browse");
    revalidatePath("/");

    return { success: true, isFavorited: true };
  } catch (error) {
    console.error("toggleFavorite error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update favorites.",
    };
  }
}

/**
 * Removes a favorite directly, used in the /favorites page.
 */
export async function removeFavorite(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isValidObjectId(listingId)) {
      return { success: false, error: "Invalid listing ID format." };
    }

    await connectDB();

    await Favorite.findOneAndDelete({
      user: user.id,
      listing: listingId,
    });

    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/favorites");
    revalidatePath("/browse");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("removeFavorite error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove favorite.",
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
