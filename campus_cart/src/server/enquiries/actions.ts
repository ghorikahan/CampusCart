"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Listing } from "@/models/Listing";
import { Enquiry } from "@/models/Enquiry";
import { Notification } from "@/models/Notification";
import { serializeDocument } from "@/lib/serialize";
import {
  createEnquirySchema,
  respondEnquirySchema,
  withdrawEnquirySchema,
  type CreateEnquiryInput,
  type RespondEnquiryInput,
  type WithdrawEnquiryInput,
} from "./schemas";

export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

/**
 * Creates a new buyer enquiry and optional offer on a listing.
 * Strict rules:
 * - Cannot enquire on own listing
 * - Cannot enquire on SOLD or inactive listings
 * - One PENDING enquiry per buyer per listing (handled via partial unique index with graceful E11000 handling)
 * - Offer price must be > 0 and only for FOR_SALE listings
 * - Store seller ID, append to statusHistory, and notify seller via ENQUIRY_RECEIVED
 */
export async function createEnquiry(
  input: CreateEnquiryInput
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Please sign in to send an enquiry or make an offer." };
    }

    const validation = createEnquirySchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: "Validation failed. Please check your message and offer amount.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    await connectDB();
    const { listingId, message, offerPrice } = validation.data;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return { success: false, error: "Listing not found." };
    }

    // Rule: Cannot enquire on own listing
    if (String(listing.seller) === user.id) {
      return { success: false, error: "You cannot send an enquiry on your own listing." };
    }

    // Rule: Cannot enquire on SOLD or inactive listings
    if (listing.status === "SOLD") {
      return { success: false, error: "This item has already been marked as sold." };
    }
    if (!listing.isActive) {
      return { success: false, error: "This listing is currently hidden or inactive." };
    }

    // Offer price only applies to FOR_SALE listings
    let normalizedOfferPrice: number | null = null;
    if (listing.listingType === "FOR_SALE" && typeof offerPrice === "number" && offerPrice > 0) {
      normalizedOfferPrice = offerPrice;
    }

    // Create enquiry
    const enquiry = new Enquiry({
      listing: listing._id,
      buyer: user.id,
      seller: listing.seller,
      message,
      offerPrice: normalizedOfferPrice,
      status: "PENDING",
      statusHistory: [
        {
          status: "PENDING",
          at: new Date(),
          note: normalizedOfferPrice
            ? `Offer of ₹${normalizedOfferPrice.toLocaleString("en-IN")} submitted.`
            : "Enquiry submitted.",
        },
      ],
    });

    await enquiry.save();

    // Create notification for seller
    try {
      await Notification.create({
        user: listing.seller,
        type: "ENQUIRY_RECEIVED",
        title: "New Enquiry Received",
        body: `${user.name || "A student"} inquired about "${listing.title}"${
          normalizedOfferPrice ? ` with an offer of ₹${normalizedOfferPrice.toLocaleString("en-IN")}` : ""
        }.`,
        link: "/enquiries",
      });
    } catch (notifErr) {
      console.warn("Could not dispatch ENQUIRY_RECEIVED notification:", notifErr);
    }

    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/enquiries");

    return {
      success: true,
      data: serializeDocument(enquiry.toObject()),
    };
  } catch (error: unknown) {
    // Graceful handling of MongoDB duplicate-key error (code 11000)
    if (error && typeof error === "object" && (error as { code?: number }).code === 11000) {
      return {
        success: false,
        error: "You already have a pending enquiry on this listing. Please await the seller's response.",
      };
    }

    console.error("createEnquiry error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit enquiry.",
    };
  }
}

/**
 * Responds to an enquiry (accepts or rejects).
 * Seller only. Uses atomic findOneAndUpdate with status: "PENDING".
 * On accept: optionally sets listing to RESERVED and optionally rejects other pending enquiries.
 * Uses a Mongoose transaction session for multi-document consistency.
 */
export async function respondToEnquiry(
  input: RespondEnquiryInput
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Please sign in to respond to enquiries." };
    }

    const validation = respondEnquirySchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: "Invalid input provided.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    await connectDB();
    const { enquiryId, action, responseMessage, setReserved, rejectOtherPending } =
      validation.data;

    // Check if session / replica set transaction is available
    let session: mongoose.ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      // Standalone mode / no replica set support in current environment
      session = null;
    }

    try {
      const targetStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
      const now = new Date();
      const auditNote =
        responseMessage ||
        (action === "ACCEPT" ? "Offer accepted by seller." : "Enquiry declined by seller.");

      // 1. Atomically update the enquiry status (guarantees no double-responses)
      const enquiry = await Enquiry.findOneAndUpdate(
        {
          _id: enquiryId,
          seller: user.id,
          status: "PENDING",
        },
        {
          $set: {
            status: targetStatus,
            responseMessage: responseMessage || undefined,
            respondedAt: now,
          },
          $push: {
            statusHistory: {
              status: targetStatus,
              at: now,
              note: auditNote,
            },
          },
        },
        { new: true, session: session || undefined }
      ).populate("listing", "title images status");

      if (!enquiry) {
        if (session) {
          await session.abortTransaction();
          await session.endSession();
        }
        return {
          success: false,
          error: "Enquiry not found, already responded to, or you are not authorized to respond.",
        };
      }

      const listing = await Listing.findById(enquiry.listing);

      // 2. Multi-document changes on ACCEPT
      if (action === "ACCEPT") {
        // Optionally mark listing as RESERVED
        if (setReserved && listing && listing.status !== "SOLD") {
          await Listing.findByIdAndUpdate(
            listing._id,
            { $set: { status: "RESERVED" } },
            { session: session || undefined }
          );
        }

        // Optionally decline all other pending enquiries on this listing
        if (rejectOtherPending && listing) {
          const otherPendingEnquiries = await Enquiry.find({
            listing: listing._id,
            _id: { $ne: enquiry._id },
            status: "PENDING",
          }).session(session || null);

          if (otherPendingEnquiries.length > 0) {
            await Enquiry.updateMany(
              {
                listing: listing._id,
                _id: { $ne: enquiry._id },
                status: "PENDING",
              },
              {
                $set: {
                  status: "REJECTED",
                  respondedAt: now,
                  responseMessage: "Another offer was accepted by the seller.",
                },
                $push: {
                  statusHistory: {
                    status: "REJECTED",
                    at: now,
                    note: "Another offer was accepted by the seller.",
                  },
                },
              },
              { session: session || undefined }
            );

            // Notify other buyers that their offer was not chosen
            const otherBuyerNotifications = otherPendingEnquiries.map((otherEnq) => ({
              user: otherEnq.buyer,
              type: "ENQUIRY_REJECTED" as const,
              title: "Listing Reserved / Offer Closed",
              body: `The seller accepted another offer for "${listing.title}".`,
              link: "/enquiries",
            }));

            await Notification.insertMany(otherBuyerNotifications, {
              ordered: false,
              session: session || undefined,
            });
          }
        }
      }

      // 3. Dispatch notification to the buyer
      const notifType = action === "ACCEPT" ? "ENQUIRY_ACCEPTED" : "ENQUIRY_REJECTED";
      const notifTitle = action === "ACCEPT" ? "Offer Accepted! 🎉" : "Offer Declined";
      const listingTitle = listing?.title || "your inquired item";
      const notifBody =
        action === "ACCEPT"
          ? `The seller accepted your offer for "${listingTitle}". Click to view pickup details.`
          : `The seller declined your enquiry for "${listingTitle}".`;

      await Notification.create(
        [
          {
            user: enquiry.buyer,
            type: notifType,
            title: notifTitle,
            body: notifBody,
            link: "/enquiries",
          },
        ],
        { session: session || undefined }
      );

      // Commit transaction if session is active
      if (session) {
        await session.commitTransaction();
        await session.endSession();
      }

      revalidatePath(`/listings/${enquiry.listing}`);
      revalidatePath("/enquiries");

      return {
        success: true,
        data: serializeDocument(enquiry.toObject()),
      };
    } catch (innerErr) {
      if (session) {
        await session.abortTransaction();
        await session.endSession();
      }
      throw innerErr;
    }
  } catch (error) {
    console.error("respondToEnquiry error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update enquiry.",
    };
  }
}

/**
 * Withdraws a pending enquiry by the buyer.
 */
export async function withdrawEnquiry(
  input: WithdrawEnquiryInput
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Please sign in to withdraw an enquiry." };
    }

    const validation = withdrawEnquirySchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: "Invalid enquiry ID." };
    }

    await connectDB();
    const { enquiryId } = validation.data;
    const now = new Date();

    const enquiry = await Enquiry.findOneAndUpdate(
      {
        _id: enquiryId,
        buyer: user.id,
        status: "PENDING",
      },
      {
        $set: {
          status: "WITHDRAWN",
          respondedAt: now,
        },
        $push: {
          statusHistory: {
            status: "WITHDRAWN",
            at: now,
            note: "Enquiry withdrawn by buyer.",
          },
        },
      },
      { new: true }
    );

    if (!enquiry) {
      return {
        success: false,
        error: "Enquiry not found, already finalized, or you are not authorized to withdraw it.",
      };
    }

    revalidatePath(`/listings/${enquiry.listing}`);
    revalidatePath("/enquiries");

    return {
      success: true,
      data: serializeDocument(enquiry.toObject()),
    };
  } catch (error) {
    console.error("withdrawEnquiry error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to withdraw enquiry.",
    };
  }
}
