import { connectDB } from "@/lib/db";
import { User, type ContactPreference } from "@/models/User";
import { Listing } from "@/models/Listing";
import { isValidObjectId, serializeDocument, serializeDocuments } from "@/lib/serialize";
import { type ListingCardData } from "@/components/shared/ListingCard";

export interface PublicSellerProfile {
  id: string;
  _id: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  university?: string | null;
  course?: string | null;
  city?: string | null;
  contactPreference: ContactPreference;
  phone?: string | null;
  showPhone: boolean;
  createdAt: string | Date;
  activeListingsCount: number;
  soldCount: number;
}

export interface SoldListingCardData extends ListingCardData {
  soldAt?: string | Date | null;
}

/**
 * Retrieves public profile information for a seller by their User ID.
 * Strict explicit field projection prevents leaking sensitive data like email or passwordHash.
 * Phone number is stripped unless showPhone is true or viewer is the owner.
 */
export async function getSellerProfile(
  sellerId: string,
  viewerId?: string | null
): Promise<PublicSellerProfile | null> {
  try {
    if (!isValidObjectId(sellerId)) {
      return null;
    }

    await connectDB();

    // Explicit field projection: strictly omit email, passwordHash, authProvider
    const userDoc = await User.findById(sellerId)
      .select("name image bio university course city contactPreference phone showPhone createdAt")
      .lean();

    if (!userDoc) {
      return null;
    }

    const isOwner = Boolean(viewerId && viewerId === String(userDoc._id));

    // Parallel count queries using MongoDB countDocuments
    const [activeListingsCount, soldCount] = await Promise.all([
      Listing.countDocuments({
        seller: sellerId,
        isActive: true,
        status: { $in: ["AVAILABLE", "RESERVED"] },
      }),
      Listing.countDocuments({
        seller: sellerId,
        status: "SOLD",
      }),
    ]);

    const serialized = serializeDocument(userDoc) as unknown as Record<string, unknown>;

    // Privacy safeguard: only disclose phone if showPhone is enabled or viewer is the owner
    const shouldShowPhone = Boolean(serialized.showPhone || isOwner);
    const phone = shouldShowPhone ? (serialized.phone as string | undefined) : null;

    return {
      id: String(serialized.id || serialized._id),
      _id: String(serialized._id || serialized.id),
      name: String(serialized.name || "Student Seller"),
      image: (serialized.image as string) || null,
      bio: (serialized.bio as string) || null,
      university: (serialized.university as string) || null,
      course: (serialized.course as string) || null,
      city: (serialized.city as string) || null,
      contactPreference: (serialized.contactPreference as ContactPreference) || "IN_APP",
      phone: phone || null,
      showPhone: Boolean(serialized.showPhone),
      createdAt: (serialized.createdAt as string | Date) || new Date(),
      activeListingsCount,
      soldCount,
    };
  } catch (error) {
    console.error("getSellerProfile query error:", error);
    return null;
  }
}

/**
 * Retrieves active/available listings for a seller.
 * Owners see all of their own active items (including unlisted/inactive drafts).
 * Public visitors only see public (isActive: true) items.
 */
export async function getSellerActiveListings(
  sellerId: string,
  isOwner: boolean
): Promise<ListingCardData[]> {
  try {
    if (!isValidObjectId(sellerId)) {
      return [];
    }

    await connectDB();

    const filter: Record<string, unknown> = {
      seller: sellerId,
      status: { $in: ["AVAILABLE", "RESERVED"] },
    };

    if (!isOwner) {
      filter.isActive = true;
    }

    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate("seller", "name image university city")
      .lean();

    return serializeDocuments(listings) as unknown as ListingCardData[];
  } catch (error) {
    console.error("getSellerActiveListings error:", error);
    return [];
  }
}

/**
 * Retrieves sold history listings for a seller.
 * Sorted by soldAt/updatedAt date.
 */
export async function getSellerSoldListings(
  sellerId: string,
  isOwner: boolean
): Promise<SoldListingCardData[]> {
  try {
    if (!isValidObjectId(sellerId)) {
      return [];
    }

    await connectDB();

    const filter: Record<string, unknown> = {
      seller: sellerId,
      status: "SOLD",
    };

    if (!isOwner) {
      filter.isActive = true;
    }

    const listings = await Listing.find(filter)
      .sort({ soldAt: -1, updatedAt: -1 })
      .populate("seller", "name image university city")
      .lean();

    return serializeDocuments(listings) as unknown as SoldListingCardData[];
  } catch (error) {
    console.error("getSellerSoldListings error:", error);
    return [];
  }
}

