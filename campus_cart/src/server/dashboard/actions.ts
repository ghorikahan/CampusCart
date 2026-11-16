"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Listing, type ListingStatus } from "@/models/Listing";
import { Favorite } from "@/models/Favorite";
import { Enquiry } from "@/models/Enquiry";
import { createManyNotifications } from "@/server/notifications";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { isValidObjectId } from "@/lib/serialize";

export interface BulkActionResponse {
  success: boolean;
  modifiedCount?: number;
  error?: string;
}

/**
 * Bulk updates the status of multiple listings owned by the authenticated user.
 */
export async function bulkUpdateListingsStatus(
  listingIds: string[],
  status: ListingStatus
): Promise<BulkActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to perform this action." };
    }

    const validIds = listingIds.filter(isValidObjectId);
    if (!validIds.length) {
      return { success: false, error: "No valid listing IDs provided." };
    }

    if (!["AVAILABLE", "RESERVED", "SOLD"].includes(status)) {
      return { success: false, error: "Invalid status value provided." };
    }

    await connectDB();

    const updateFields: Record<string, unknown> = { status };
    if (status === "SOLD") {
      updateFields.soldAt = new Date();
    } else {
      updateFields.soldAt = null;
    }

    const result = await Listing.updateMany(
      {
        _id: { $in: validIds },
        seller: user.id,
      },
      {
        $set: updateFields,
      }
    );

    // If marked SOLD, notify users who saved these listings
    if (status === "SOLD") {
      try {
        const favorites = await Favorite.find({
          listing: { $in: validIds },
          user: { $ne: user.id },
        })
          .populate<{ listing: { _id: string; title: string } }>("listing", "title")
          .lean();

        if (favorites.length > 0) {
          const notifications = favorites.map((fav) => ({
            user: fav.user.toString(),
            type: "FAVORITE_SOLD" as const,
            title: "An item you saved has been sold",
            body: `"${fav.listing?.title || "An item you saved"}" was marked as sold.`,
            link: fav.listing?._id ? `/listings/${fav.listing._id}` : "/browse",
          }));
          await createManyNotifications(notifications);
        }
      } catch (notifErr) {
        console.warn("Failed to dispatch bulk favorite sold notifications:", notifErr);
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/listings");
    revalidatePath("/browse");

    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error("bulkUpdateListingsStatus error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update listings.",
    };
  }
}

/**
 * Bulk activates or deactivates multiple listings owned by the authenticated user.
 */
export async function bulkToggleListingsActive(
  listingIds: string[],
  isActive: boolean
): Promise<BulkActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to perform this action." };
    }

    const validIds = listingIds.filter(isValidObjectId);
    if (!validIds.length) {
      return { success: false, error: "No valid listing IDs provided." };
    }

    await connectDB();

    const result = await Listing.updateMany(
      {
        _id: { $in: validIds },
        seller: user.id,
      },
      {
        $set: { isActive },
      }
    );

    revalidatePath("/dashboard");
    revalidatePath("/listings");
    revalidatePath("/browse");

    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error("bulkToggleListingsActive error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update listing visibility.",
    };
  }
}

/**
 * Bulk deletes multiple listings owned by the authenticated user.
 * Deletes photos from Cloudinary, cascades favorites, and expires pending enquiries.
 */
export async function bulkDeleteListings(
  listingIds: string[]
): Promise<BulkActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to delete listings." };
    }

    const validIds = listingIds.filter(isValidObjectId);
    if (!validIds.length) {
      return { success: false, error: "No valid listing IDs provided." };
    }

    await connectDB();

    // Find listings first to clean up Cloudinary images
    const listingsToDelete = await Listing.find({
      _id: { $in: validIds },
      seller: user.id,
    })
      .select("images")
      .lean();

    for (const item of listingsToDelete) {
      for (const img of item.images || []) {
        if (img.publicId) {
          deleteFromCloudinary(img.publicId).catch((err) =>
            console.error(`Failed to delete Cloudinary asset (${img.publicId}):`, err)
          );
        }
      }
    }

    // 1. Cascade delete favorites
    await Favorite.deleteMany({ listing: { $in: validIds } });

    // 2. Mark pending enquiries as EXPIRED
    await Enquiry.updateMany(
      { listing: { $in: validIds }, status: "PENDING" },
      {
        $set: { status: "EXPIRED" },
        $push: {
          statusHistory: {
            status: "EXPIRED",
            at: new Date(),
            note: "Listing was deleted by the seller.",
          },
        },
      }
    );

    // 3. Delete the listings
    const deleteResult = await Listing.deleteMany({
      _id: { $in: validIds },
      seller: user.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/listings");
    revalidatePath("/browse");
    revalidatePath("/");

    return { success: true, modifiedCount: deleteResult.deletedCount };
  } catch (error) {
    console.error("bulkDeleteListings error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete listings.",
    };
  }
}
