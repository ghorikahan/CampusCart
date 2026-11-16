import { Types } from "mongoose";
import { format, subDays, differenceInDays } from "date-fns";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";
import { Listing, type IListing } from "@/models/Listing";
import { Enquiry } from "@/models/Enquiry";
import { Notification } from "@/models/Notification";
import { Favorite } from "@/models/Favorite";
import { serializeDocuments } from "@/lib/serialize";
import type {
  DashboardOverviewStats,
  DailyActivityPoint,
  NeedsAttentionItem,
  OnboardingChecklistState,
  DashboardListingRow,
  DashboardEnquiryItem,
} from "./types";

export interface DashboardData {
  stats: DashboardOverviewStats;
  chartData: DailyActivityPoint[];
  needsAttention: NeedsAttentionItem[];
  checklist: OnboardingChecklistState;
  myListings: DashboardListingRow[];
  receivedEnquiries: DashboardEnquiryItem[];
  sentOffers: DashboardEnquiryItem[];
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const user = await getCurrentUser();
  if (!user?.id) return null;

  await connectDB();
  const userObjectId = new Types.ObjectId(user.id);

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const twoDaysAgo = subDays(now, 2);
  const sevenDaysAgo = subDays(now, 7);

  // 1. Single aggregation on Listing for overview metrics and 30-day activity
  const [listingAggResult, pendingOffersCount, unreadNotificationsCount, favoriteCount] =
    await Promise.all([
      Listing.aggregate([
        { $match: { seller: userObjectId } },
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  totalViews: { $sum: "$viewCount" },
                  activeCount: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$status", "AVAILABLE"] },
                            { $eq: ["$isActive", true] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  reservedCount: {
                    $sum: { $cond: [{ $eq: ["$status", "RESERVED"] }, 1, 0] },
                  },
                  soldCount: {
                    $sum: { $cond: [{ $eq: ["$status", "SOLD"] }, 1, 0] },
                  },
                  inactiveCount: {
                    $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
                  },
                  totalRevenue: {
                    $sum: {
                      $cond: [
                        { $eq: ["$status", "SOLD"] },
                        { $ifNull: ["$price", 0] },
                        0,
                      ],
                    },
                  },
                  totalListings: { $sum: 1 },
                },
              },
            ],
            last30Days: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                  listingsCreated: { $sum: 1 },
                  views: { $sum: "$viewCount" },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      // Fast index-backed counts
      Enquiry.countDocuments({ seller: userObjectId, status: "PENDING" }),
      Notification.countDocuments({ user: userObjectId, readAt: null }),
      Favorite.countDocuments({ user: userObjectId }),
    ]);

  const overviewData = listingAggResult[0]?.overview[0] || {
    totalViews: 0,
    activeCount: 0,
    reservedCount: 0,
    soldCount: 0,
    inactiveCount: 0,
    totalRevenue: 0,
    totalListings: 0,
  };

  const raw30Days = (listingAggResult[0]?.last30Days || []) as Array<{
    _id: string;
    listingsCreated: number;
    views: number;
  }>;

  const dateMap = new Map<string, { listingsCreated: number; views: number }>();
  for (const entry of raw30Days) {
    dateMap.set(entry._id, {
      listingsCreated: entry.listingsCreated,
      views: entry.views,
    });
  }

  // Generate continuous 30-day timeline for Recharts
  const chartData: DailyActivityPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(now, i);
    const dateKey = format(d, "yyyy-MM-dd");
    const existing = dateMap.get(dateKey);
    chartData.push({
      date: dateKey,
      label: format(d, "MMM d"),
      listingsCreated: existing?.listingsCreated ?? 0,
      views: existing?.views ?? 0,
    });
  }

  const stats: DashboardOverviewStats = {
    activeListings: overviewData.activeCount,
    reservedListings: overviewData.reservedCount,
    soldListings: overviewData.soldCount,
    inactiveListings: overviewData.inactiveCount,
    totalListings: overviewData.totalListings,
    totalViews: overviewData.totalViews,
    pendingOffersCount,
    unreadNotificationsCount,
    totalRevenue: overviewData.totalRevenue,
  };

  // 2. "Needs Attention" Panel items
  const [stalePendingEnquiries, staleReservedListings, zeroViewListings] =
    await Promise.all([
      Enquiry.find({
        seller: userObjectId,
        status: "PENDING",
        createdAt: { $lt: twoDaysAgo },
      })
        .populate<{ listing: IListing }>("listing", "title price")
        .sort({ createdAt: 1 })
        .limit(5)
        .lean(),
      Listing.find({
        seller: userObjectId,
        status: "RESERVED",
        updatedAt: { $lt: sevenDaysAgo },
      })
        .select("title price updatedAt")
        .sort({ updatedAt: 1 })
        .limit(5)
        .lean(),
      Listing.find({
        seller: userObjectId,
        status: "AVAILABLE",
        isActive: true,
        viewCount: 0,
      })
        .select("title createdAt price")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const needsAttention: NeedsAttentionItem[] = [];

  for (const enq of stalePendingEnquiries) {
    const ageDays = differenceInDays(now, new Date(enq.createdAt));
    const listingTitle = enq.listing?.title || "Listing";
    needsAttention.push({
      id: enq._id.toString(),
      type: "PENDING_ENQUIRY",
      title: `Pending Offer on "${listingTitle}"`,
      description: `Waiting for your reply for ${ageDays} days. Accept or decline to finalize the deal.`,
      link: "/dashboard?tab=enquiries",
      ageDays,
      extra: enq.offerPrice ? `Offer: ₹${enq.offerPrice.toLocaleString("en-IN")}` : undefined,
    });
  }

  for (const res of staleReservedListings) {
    const ageDays = differenceInDays(now, new Date(res.updatedAt));
    needsAttention.push({
      id: res._id.toString(),
      type: "STALE_RESERVED",
      title: `"${res.title}" has been Reserved for ${ageDays} days`,
      description: "Check if the buyer completed the purchase, or mark it back to Available.",
      link: `/listings/${res._id.toString()}`,
      ageDays,
    });
  }

  for (const zv of zeroViewListings) {
    const ageDays = differenceInDays(now, new Date(zv.createdAt));
    needsAttention.push({
      id: zv._id.toString(),
      type: "ZERO_VIEWS",
      title: `"${zv.title}" has 0 views`,
      description: "Consider improving the title, lowering the price, or sharing with campus classmates.",
      link: `/listings/${zv._id.toString()}/edit`,
      ageDays,
    });
  }

  // 3. Onboarding Checklist
  const hasProfileComplete = Boolean(
    user.name && user.university && (user.bio || user.contactPreference)
  );
  const hasFirstListing = overviewData.totalListings > 0;
  const hasSoldItem = overviewData.soldCount > 0;
  const hasSavedFavorite = favoriteCount > 0;

  const completedCount = [
    hasProfileComplete,
    hasFirstListing,
    hasSavedFavorite,
    hasSoldItem,
  ].filter(Boolean).length;

  const checklist: OnboardingChecklistState = {
    hasProfileComplete,
    hasFirstListing,
    hasSoldItem,
    hasSavedFavorite,
    completedCount,
    totalSteps: 4,
    isCompleted: completedCount === 4,
  };

  // 4. Tab Data: My Listings, Received Enquiries, and Sent Offers
  const [listingDocs, receivedDocs, sentDocs] = await Promise.all([
    Listing.find({ seller: userObjectId })
      .sort({ createdAt: -1 })
      .lean(),
    Enquiry.find({ seller: userObjectId })
      .populate("listing", "title price images")
      .populate("buyer", "name image phone showPhone contactPreference")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Enquiry.find({ buyer: userObjectId })
      .populate("listing", "title price images status")
      .populate("seller", "name image phone showPhone contactPreference")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const myListings: DashboardListingRow[] = serializeDocuments(
    listingDocs.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      price: doc.price ?? null,
      category: doc.category,
      condition: doc.condition,
      listingType: doc.listingType,
      status: doc.status,
      isActive: doc.isActive,
      viewCount: doc.viewCount || 0,
      images: doc.images || [],
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
      soldAt: doc.soldAt ? doc.soldAt.toISOString() : null,
    }))
  );

  const receivedEnquiries: DashboardEnquiryItem[] = receivedDocs.map((doc) => {
    const listing = (doc.listing as unknown as Record<string, unknown>) || {};
    const buyer = (doc.buyer as unknown as Record<string, unknown>) || {};
    const images = (listing.images as Array<{ url: string }>) || [];

    return {
      id: doc._id.toString(),
      listingId: (listing._id || doc.listing)?.toString(),
      listingTitle: (listing.title as string) || "Listing",
      listingPrice: (listing.price as number) ?? null,
      listingImage: images[0]?.url,
      counterpartName: (buyer.name as string) || "Student Buyer",
      counterpartImage: (buyer.image as string) || null,
      counterpartPhone: (buyer.phone as string) || null,
      showPhone: Boolean(buyer.showPhone),
      contactPreference:
        (buyer.contactPreference as "CHAT" | "WHATSAPP" | "CALL") || "CHAT",
      message: doc.message,
      offerPrice: doc.offerPrice ?? null,
      status: doc.status,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      responseMessage: doc.responseMessage,
    };
  });

  const sentOffers: DashboardEnquiryItem[] = sentDocs.map((doc) => {
    const listing = (doc.listing as unknown as Record<string, unknown>) || {};
    const seller = (doc.seller as unknown as Record<string, unknown>) || {};
    const images = (listing.images as Array<{ url: string }>) || [];

    return {
      id: doc._id.toString(),
      listingId: (listing._id || doc.listing)?.toString(),
      listingTitle: (listing.title as string) || "Listing",
      listingPrice: (listing.price as number) ?? null,
      listingImage: images[0]?.url,
      counterpartName: (seller.name as string) || "Student Seller",
      counterpartImage: (seller.image as string) || null,
      counterpartPhone: (seller.phone as string) || null,
      showPhone: Boolean(seller.showPhone),
      contactPreference:
        (seller.contactPreference as "CHAT" | "WHATSAPP" | "CALL") || "CHAT",
      message: doc.message,
      offerPrice: doc.offerPrice ?? null,
      status: doc.status,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      responseMessage: doc.responseMessage,
    };
  });

  return {
    stats,
    chartData,
    needsAttention,
    checklist,
    myListings,
    receivedEnquiries,
    sentOffers,
  };
}

