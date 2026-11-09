"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Listing } from "@/models/Listing";
import { Favorite } from "@/models/Favorite";
import { Enquiry } from "@/models/Enquiry";
import { Notification } from "@/models/Notification";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { isValidObjectId, serializeDocument } from "@/lib/serialize";
import {
  createListingSchema,
  updateListingSchema,
  type CreateListingInput,
  type UpdateListingInput,
} from "./schemas";

export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

/**
 * Creates a new marketplace listing for the authenticated user.
 */
export async function createListing(input: CreateListingInput): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to create a listing." };
    }

    const validation = createListingSchema.safeParse(input);
    if (!validation.success) {
      const flattened = validation.error.flatten();
      return {
        success: false,
        error: "Validation failed. Please correct the highlighted errors.",
        errors: flattened.fieldErrors,
      };
    }

    await connectDB();

    const data = validation.data;
    const listing = await Listing.create({
      ...data,
      seller: user.id,
      status: "AVAILABLE",
      isActive: true,
      viewCount: 0,
      soldAt: null,
    });

    revalidatePath("/listings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");

    return {
      success: true,
      data: serializeDocument(listing.toObject()),
    };
  } catch (error) {
    console.error("createListing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create listing.",
    };
  }
}

/**
 * Updates an existing listing owned by the authenticated user.
 * Sends FAVORITE_PRICE_DROP notifications if price is reduced.
 * Cleans up removed images from Cloudinary.
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to update a listing." };
    }

    if (!isValidObjectId(id)) {
      return { success: false, error: "Invalid listing ID format." };
    }

    const validation = updateListingSchema.safeParse(input);
    if (!validation.success) {
      const flattened = validation.error.flatten();
      return {
        success: false,
        error: "Validation failed. Please correct the highlighted errors.",
        errors: flattened.fieldErrors,
      };
    }

    await connectDB();

    // Enforce ownership in the query
    const listing = await Listing.findOne({ _id: id, seller: user.id });
    if (!listing) {
      return {
        success: false,
        error: "Listing not found or you are not authorized to edit it.",
      };
    }

    const data = validation.data;
    const oldPrice = listing.price;
    const newPrice = data.price;

    // Detect price drop & notify users who favorited this listing
    if (
      oldPrice !== null &&
      oldPrice !== undefined &&
      newPrice !== null &&
      newPrice !== undefined &&
      newPrice < oldPrice
    ) {
      try {
        const favorites = await Favorite.find({
          listing: id,
          user: { $ne: user.id },
        })
          .select("user")
          .lean();

        if (favorites.length > 0) {
          const notifications = favorites.map((fav) => ({
            user: fav.user,
            type: "FAVORITE_PRICE_DROP" as const,
            title: "Price Drop Alert!",
            body: `The price for "${listing.title}" dropped from ₹${oldPrice.toLocaleString("en-IN")} to ₹${newPrice.toLocaleString("en-IN")}.`,
            link: `/listings/${id}`,
          }));
          await Notification.insertMany(notifications, { ordered: false });
        }
      } catch (notifyErr) {
        console.error("Failed to send price drop notifications:", notifyErr);
      }
    }

    // Clean up any removed images from Cloudinary
    const existingPublicIds = listing.images
      .map((img) => img.publicId)
      .filter((pid): pid is string => Boolean(pid));

    const updatedPublicIds = new Set(
      data.images.map((img) => img.publicId).filter(Boolean)
    );

    const removedPublicIds = existingPublicIds.filter(
      (pid) => !updatedPublicIds.has(pid)
    );

    for (const pid of removedPublicIds) {
      deleteFromCloudinary(pid).catch((err) =>
        console.error(`Failed to delete removed image (${pid}):`, err)
      );
    }

    // Apply updates
    listing.title = data.title;
    listing.description = data.description;
    listing.category = data.category;
    listing.condition = data.condition;
    listing.listingType = data.listingType;
    listing.price = data.price;
    listing.exchangeFor = data.exchangeFor ?? undefined;
    listing.locationText = data.locationText ?? undefined;
    listing.location = data.location;
    listing.images = data.images;

    await listing.save();

    revalidatePath("/listings");
    revalidatePath(`/listings/${id}`);
    revalidatePath("/dashboard/listings");

    return {
      success: true,
      data: serializeDocument(listing.toObject()),
    };
  } catch (error) {
    console.error("updateListing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update listing.",
    };
  }
}

/**
 * Deletes a listing owned by the authenticated user.
 * Deletes images from Cloudinary, cascades favorites removal,
 * and sets pending enquiries to EXPIRED with audit trail.
 */
export async function deleteListing(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to delete a listing." };
    }

    if (!isValidObjectId(id)) {
      return { success: false, error: "Invalid listing ID format." };
    }

    await connectDB();

    // Ownership check directly in the query
    const listing = await Listing.findOne({ _id: id, seller: user.id });
    if (!listing) {
      return {
        success: false,
        error: "Listing not found or you are not authorized to delete it.",
      };
    }

    // 1. Delete images from Cloudinary
    for (const img of listing.images) {
      if (img.publicId) {
        deleteFromCloudinary(img.publicId).catch((err) =>
          console.error(`Failed to delete Cloudinary asset (${img.publicId}):`, err)
        );
      }
    }

    // 2. Cascade delete related favorites
    await Favorite.deleteMany({ listing: id });

    // 3. Mark pending enquiries as EXPIRED with audit history
    await Enquiry.updateMany(
      { listing: id, status: "PENDING" },
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

    // 4. Delete the listing itself
    await Listing.deleteOne({ _id: id, seller: user.id });

    revalidatePath("/listings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath("/favorites");

    return { success: true, data: { id } };
  } catch (error) {
    console.error("deleteListing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete listing.",
    };
  }
}

/**
 * Toggles the isActive state (published / hidden) of a user's listing.
 */
export async function toggleListingActive(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to modify a listing." };
    }

    if (!isValidObjectId(id)) {
      return { success: false, error: "Invalid listing ID format." };
    }

    await connectDB();

    const listing = await Listing.findOne({ _id: id, seller: user.id });
    if (!listing) {
      return {
        success: false,
        error: "Listing not found or you are not authorized to modify it.",
      };
    }

    listing.isActive = !listing.isActive;
    await listing.save();

    revalidatePath("/listings");
    revalidatePath(`/listings/${id}`);
    revalidatePath("/dashboard/listings");

    return {
      success: true,
      data: serializeDocument(listing.toObject()),
    };
  } catch (error) {
    console.error("toggleListingActive error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle listing state.",
    };
  }
}

/**
 * Updates the status of a listing (AVAILABLE, RESERVED, SOLD).
 * Sets soldAt when marked SOLD and creates FAVORITE_SOLD notifications.
 */
export async function updateListingStatus(
  id: string,
  status: "AVAILABLE" | "RESERVED" | "SOLD"
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "You must be signed in to update listing status." };
    }

    if (!isValidObjectId(id)) {
      return { success: false, error: "Invalid listing ID format." };
    }

    if (!["AVAILABLE", "RESERVED", "SOLD"].includes(status)) {
      return { success: false, error: "Invalid status value provided." };
    }

    await connectDB();

    const listing = await Listing.findOne({ _id: id, seller: user.id });
    if (!listing) {
      return {
        success: false,
        error: "Listing not found or you are not authorized to update its status.",
      };
    }

    const previousStatus = listing.status;
    listing.status = status;

    if (status === "SOLD") {
      listing.soldAt = new Date();

      // Send FAVORITE_SOLD notifications if transitioning to SOLD
      if (previousStatus !== "SOLD") {
        try {
          const favorites = await Favorite.find({
            listing: id,
            user: { $ne: user.id },
          })
            .select("user")
            .lean();

          if (favorites.length > 0) {
            const notifications = favorites.map((fav) => ({
              user: fav.user,
              type: "FAVORITE_SOLD" as const,
              title: "An item you saved has been sold",
              body: `"${listing.title}" was marked as sold by the seller.`,
              link: `/listings/${id}`,
            }));
            await Notification.insertMany(notifications, { ordered: false });
          }
        } catch (notifyErr) {
          console.error("Failed to send favorite sold notifications:", notifyErr);
        }
      }
    } else {
      listing.soldAt = null;
    }

    await listing.save();

    revalidatePath("/listings");
    revalidatePath(`/listings/${id}`);
    revalidatePath("/dashboard/listings");

    return {
      success: true,
      data: serializeDocument(listing.toObject()),
    };
  } catch (error) {
    console.error("updateListingStatus error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update listing status.",
    };
  }
}

