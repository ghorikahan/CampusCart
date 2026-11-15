import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Enquiry, type EnquiryStatus } from "@/models/Enquiry";
import { isValidObjectId, serializeDocument, serializeDocuments } from "@/lib/serialize";

const PUBLIC_USER_FIELDS =
  "name image university course city contactPreference phone showPhone createdAt";
const LISTING_SUMMARY_FIELDS =
  "title images price status listingType condition locationText";

/**
 * Lazily expires pending enquiries older than 30 days.
 * Appends an EXPIRED status to the audit trail.
 */
export async function autoExpireOldEnquiries(): Promise<void> {
  try {
    await connectDB();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await Enquiry.updateMany(
      {
        status: "PENDING",
        createdAt: { $lt: thirtyDaysAgo },
      },
      {
        $set: { status: "EXPIRED" },
        $push: {
          statusHistory: {
            status: "EXPIRED",
            at: new Date(),
            note: "Enquiry automatically expired after 30 days without response.",
          },
        },
      }
    );
  } catch (err) {
    console.warn("autoExpireOldEnquiries warning:", err);
  }
}

export interface GetEnquiriesOptions {
  status?: "ALL" | EnquiryStatus;
  page?: number;
  pageSize?: number;
}

export interface EnquiriesListResult {
  enquiries: Array<Record<string, unknown>>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Retrieves enquiries received by the authenticated user as the seller.
 */
export async function getReceivedEnquiries(
  options: GetEnquiriesOptions = {}
): Promise<EnquiriesListResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { enquiries: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
    }

    await connectDB();
    await autoExpireOldEnquiries();

    const { status = "ALL", page = 1, pageSize = 12 } = options;
    const currentPage = Math.max(1, page);
    const limit = Math.max(1, Math.min(50, pageSize));
    const skip = (currentPage - 1) * limit;

    const filter: Record<string, unknown> = { seller: user.id };
    if (status && status !== "ALL") {
      filter.status = status;
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("listing", LISTING_SUMMARY_FIELDS)
        .populate("buyer", PUBLIC_USER_FIELDS)
        .lean(),
      Enquiry.countDocuments(filter),
    ]);

    // Redact buyer phone if buyer.showPhone is false
    const sanitized = enquiries.map((enq) => {
      const buyer = enq.buyer as unknown as Record<string, unknown> | undefined;
      if (buyer && !buyer.showPhone) {
        buyer.phone = null;
      }
      return enq;
    });

    return {
      enquiries: serializeDocuments(sanitized),
      total,
      page: currentPage,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (error) {
    console.error("getReceivedEnquiries error:", error);
    return { enquiries: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
  }
}

/**
 * Retrieves enquiries sent by the authenticated user as the buyer.
 */
export async function getSentEnquiries(
  options: GetEnquiriesOptions = {}
): Promise<EnquiriesListResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { enquiries: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
    }

    await connectDB();
    await autoExpireOldEnquiries();

    const { status = "ALL", page = 1, pageSize = 12 } = options;
    const currentPage = Math.max(1, page);
    const limit = Math.max(1, Math.min(50, pageSize));
    const skip = (currentPage - 1) * limit;

    const filter: Record<string, unknown> = { buyer: user.id };
    if (status && status !== "ALL") {
      filter.status = status;
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("listing", LISTING_SUMMARY_FIELDS)
        .populate("seller", PUBLIC_USER_FIELDS)
        .lean(),
      Enquiry.countDocuments(filter),
    ]);

    // Privacy rule: Only disclose seller's phone if accepted OR seller has showPhone: true
    const sanitized = enquiries.map((enq) => {
      const seller = enq.seller as unknown as Record<string, unknown> | undefined;
      if (seller) {
        const canSeePhone = enq.status === "ACCEPTED" || Boolean(seller.showPhone);
        if (!canSeePhone) {
          seller.phone = null;
        }
      }
      return enq;
    });

    return {
      enquiries: serializeDocuments(sanitized),
      total,
      page: currentPage,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (error) {
    console.error("getSentEnquiries error:", error);
    return { enquiries: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
  }
}

/**
 * Retrieves a single enquiry by its ID.
 * Enforces ownership: only the buyer or the seller may view it.
 */
export async function getEnquiryById(enquiryId: string) {
  try {
    if (!isValidObjectId(enquiryId)) {
      return null;
    }

    const user = await getCurrentUser();
    if (!user?.id) {
      return null;
    }

    await connectDB();
    await autoExpireOldEnquiries();

    const enquiry = await Enquiry.findById(enquiryId)
      .populate("listing", LISTING_SUMMARY_FIELDS)
      .populate("buyer", PUBLIC_USER_FIELDS)
      .populate("seller", PUBLIC_USER_FIELDS)
      .lean();

    if (!enquiry) {
      return null;
    }

    const buyerId = String((enquiry.buyer as { _id?: unknown; id?: unknown })?._id || enquiry.buyer);
    const sellerId = String((enquiry.seller as { _id?: unknown; id?: unknown })?._id || enquiry.seller);

    if (user.id !== buyerId && user.id !== sellerId) {
      return null;
    }

    return serializeDocument(enquiry);
  } catch (error) {
    console.error("getEnquiryById error:", error);
    return null;
  }
}

/**
 * Checks if the current authenticated user has an enquiry for a specific listing.
 * Returns the most recent enquiry document (serialized) or null.
 */
export async function getMyEnquiryForListing(listingId: string) {
  try {
    if (!isValidObjectId(listingId)) {
      return null;
    }

    const user = await getCurrentUser();
    if (!user?.id) {
      return null;
    }

    await connectDB();

    const enquiry = await Enquiry.findOne({
      listing: listingId,
      buyer: user.id,
    })
      .sort({ createdAt: -1 })
      .populate("seller", PUBLIC_USER_FIELDS)
      .lean();

    if (!enquiry) {
      return null;
    }

    return serializeDocument(enquiry);
  } catch (error) {
    console.error("getMyEnquiryForListing error:", error);
    return null;
  }
}
