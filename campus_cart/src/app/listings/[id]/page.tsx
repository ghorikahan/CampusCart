import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import {
  ChevronRight,
  MapPin,
  Clock,
  Eye,
  AlertCircle,
  Info,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Sparkles,
  Repeat,
  CheckCircle2,
} from "lucide-react";

import { isValidObjectId } from "@/lib/serialize";
import { getCurrentUser } from "@/server/auth";
import {
  getListingById,
  getSimilarListings,
  incrementViewCount,
} from "@/server/listings/queries";
import { isListingFavorited } from "@/server/favorites/actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/shared/ImageGallery";
import { ListingCard } from "@/components/shared/ListingCard";
import { ListingActionArea } from "@/features/listings/components/ListingActionArea";
import { SellerCard } from "@/features/listings/components/SellerCard";

import {
  type ListingCategory,
  type ListingCondition,
  type ListingType,
  type ListingStatus,
  type IListingImage,
} from "@/models/Listing";

export const dynamic = "force-dynamic";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_MAP: Record<ListingCategory, { label: string; icon: string }> = {
  BOOKS: { label: "Books & Textbooks", icon: "📚" },
  ELECTRONICS: { label: "Electronics & Tech", icon: "💻" },
  FURNITURE: { label: "Dorm Furniture", icon: "🪑" },
  STATIONERY: { label: "Stationery & Supplies", icon: "📐" },
  OTHER: { label: "Other Student Gear", icon: "📦" },
};

const CONDITION_MAP: Record<
  ListingCondition,
  { label: string; variant: "success" | "indigo" | "secondary" | "warning" | "destructive"; desc: string }
> = {
  NEW: { label: "Brand New", variant: "success", desc: "Never used, in original packaging" },
  LIKE_NEW: { label: "Like New", variant: "indigo", desc: "Minimal use, no noticeable flaws" },
  GOOD: { label: "Good", variant: "secondary", desc: "Gently used, fully operational" },
  FAIR: { label: "Fair", variant: "warning", desc: "Shows visible wear but functional" },
  POOR: { label: "Poor", variant: "destructive", desc: "Heavily used or needs repair" },
};

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return {
      title: "Listing Not Found | CampusCart",
    };
  }

  const listing = (await getListingById(id)) as {
    title: string;
    description: string;
    images?: IListingImage[];
    category?: ListingCategory;
    price?: number | null;
    listingType?: ListingType;
  } | null;

  if (!listing) {
    return {
      title: "Listing Not Found | CampusCart",
    };
  }

  const title = `${listing.title} | CampusCart`;
  const description =
    listing.description && listing.description.length > 160
      ? `${listing.description.slice(0, 157)}...`
      : listing.description || "Student marketplace listing on CampusCart.";
  const primaryImage = listing.images?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: primaryImage ? [{ url: primaryImage, alt: listing.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;

  // 1. Validate ObjectId
  if (!isValidObjectId(id)) {
    notFound();
  }

  // 2. Increment view count (cookie-protected to prevent spam)
  await incrementViewCount(id);

  // 3. Fetch listing data and current user
  const [listingData, currentUser] = await Promise.all([
    getListingById(id),
    getCurrentUser(),
  ]);

  if (!listingData) {
    notFound();
  }

  interface FullListingDetail {
    id: string;
    _id: string;
    title: string;
    description: string;
    category: ListingCategory;
    condition: ListingCondition;
    listingType: ListingType;
    price: number | null;
    exchangeFor?: string;
    status: ListingStatus;
    isActive: boolean;
    locationText?: string;
    images: IListingImage[];
    viewCount: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    seller: {
      id?: string;
      _id?: string;
      name: string;
      email?: string;
      image?: string | null;
      bio?: string | null;
      university?: string | null;
      course?: string | null;
      city?: string | null;
      phone?: string | null;
      showPhone?: boolean;
      contactPreference?: "IN_APP" | "EMAIL" | "PHONE" | "WHATSAPP";
      createdAt?: string | Date;
    };
  }

  const listing = listingData as unknown as FullListingDetail;

  // 4. Check Ownership
  const sellerId = listing.seller?.id || listing.seller?._id;
  const isOwner = Boolean(currentUser?.id && sellerId && currentUser.id === sellerId);

  // 5. Visibility Check: 404 for missing or inactive listings unless owner is viewing
  if (!listing.isActive && !isOwner) {
    notFound();
  }

  // 6. Check Favorite Status & Similar Listings in parallel
  const [isFavorite, similarListings] = await Promise.all([
    currentUser?.id ? isListingFavorited(id) : Promise.resolve(false),
    getSimilarListings(listing, 4),
  ]);

  const categoryInfo = CATEGORY_MAP[listing.category] || {
    label: listing.category,
    icon: "📦",
  };

  const conditionInfo = CONDITION_MAP[listing.condition] || {
    label: listing.condition,
    variant: "secondary" as const,
    desc: "",
  };

  const postedAgo = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
  });

  const formattedDate = format(new Date(listing.createdAt), "MMM d, yyyy");

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Banner for Special States */}
      {!listing.isActive && isOwner && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs text-center font-medium flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Listing is Deactivated:</strong> Only you can view this page. Students cannot find this in searches.
          </span>
        </div>
      )}

      {listing.status === "SOLD" && (
        <div className="bg-purple-500/10 border-b border-purple-500/20 text-purple-900 dark:text-purple-200 px-4 py-3 text-sm text-center font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
          <span>
            <strong>Item Sold:</strong> This listing is no longer available. Check similar student items below.
          </span>
        </div>
      )}

      {listing.status === "RESERVED" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs text-center font-medium flex items-center justify-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Item Reserved:</strong> A buyer has reserved this item. It may become available if not completed.
          </span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mb-6"
        >
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3 mr-0.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <Link href="/browse" className="hover:text-foreground transition-colors">
            Browse
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <Link
            href={`/browse?category=${listing.category}`}
            className="hover:text-foreground transition-colors"
          >
            {categoryInfo.label}
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[320px]">
            {listing.title}
          </span>
        </nav>

        {/* Main Grid: Gallery & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Image Gallery, Specs, Description (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* 1. Image Gallery */}
            <div className="relative">
              <ImageGallery images={listing.images} title={listing.title} />

              {/* Sold Out Watermark / Overlay if Sold */}
              {listing.status === "SOLD" && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <Badge className="bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 shadow-md">
                    Sold Out
                  </Badge>
                </div>
              )}
            </div>

            {/* 2. Description Card */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span>Description</span>
              </h2>

              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>

              {/* Exchange specification box if applicable */}
              {listing.listingType === "EXCHANGE" && listing.exchangeFor && (
                <div className="mt-5 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
                  <Repeat className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">
                      Seller Wants in Exchange:
                    </h4>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {listing.exchangeFor}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Item Overview & Campus Details */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
              <h3 className="font-heading text-base font-semibold text-foreground mb-4">
                Listing Details & Location
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Category
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1 truncate">
                    {categoryInfo.icon} {categoryInfo.label}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Condition
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {conditionInfo.label}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Campus Location
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1 truncate" title={listing.locationText || "Campus Pickup"}>
                    {listing.locationText || "Main Campus"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Posted On
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {formattedDate}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Total Views
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {listing.viewCount.toLocaleString()} {listing.viewCount === 1 ? "view" : "views"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Safety
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    Student Verified
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Safe Campus Trade Guidelines */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3.5">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground text-sm">CampusCart Safe Trading Tip</p>
                <p>
                  Always arrange handovers during daylight hours in populated university areas like the student union, library foyer, or campus cafe. Inspect the item thoroughly before finalizing any UPI or cash payment.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Primary Actions, Seller Profile (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Sticky Container */}
            <div className="lg:sticky lg:top-20 flex flex-col gap-6">
              {/* Main Info Card */}
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex flex-col gap-5">
                {/* Status & Category Chips */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium py-0.5 px-2.5 rounded-lg border-border/80">
                      {categoryInfo.icon} {categoryInfo.label}
                    </Badge>
                    <Badge variant={conditionInfo.variant} className="text-xs font-medium py-0.5 px-2.5 rounded-lg">
                      {conditionInfo.label}
                    </Badge>
                  </div>

                  {/* Status Badge */}
                  {listing.status === "AVAILABLE" && (
                    <Badge variant="success" className="text-xs font-semibold py-0.5 px-2.5 rounded-lg">
                      Available
                    </Badge>
                  )}
                  {listing.status === "RESERVED" && (
                    <Badge variant="warning" className="text-xs font-semibold py-0.5 px-2.5 rounded-lg">
                      Reserved
                    </Badge>
                  )}
                  {listing.status === "SOLD" && (
                    <Badge variant="secondary" className="text-xs font-semibold py-0.5 px-2.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                      Sold
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-snug">
                  {listing.title}
                </h1>

                {/* Price Display */}
                <div className="pt-2 border-t border-border/50 flex items-baseline justify-between">
                  {listing.listingType === "FREE" ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</span>
                      <span className="font-heading text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        Free Giveaway
                      </span>
                    </div>
                  ) : listing.listingType === "EXCHANGE" ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Listing Type</span>
                      <span className="font-heading text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        Item Exchange
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asking Price</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
                          ₹{(listing.price ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-right text-xs text-muted-foreground">
                    <p className="flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      {postedAgo}
                    </p>
                    <p className="mt-0.5">{listing.viewCount} {listing.viewCount === 1 ? "view" : "views"}</p>
                  </div>
                </div>

                {/* Location text badge */}
                {listing.locationText && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-xl">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">Pickup on campus: <strong>{listing.locationText}</strong></span>
                  </div>
                )}

                {/* Action Area Component (Enquiry, Offer, Favorite, Share, Report, Owner controls) */}
                <ListingActionArea
                  listing={{
                    id: listing.id || listing._id,
                    title: listing.title,
                    price: listing.price,
                    listingType: listing.listingType,
                    status: listing.status,
                    isActive: listing.isActive,
                    seller: {
                      id: sellerId,
                      name: listing.seller.name,
                    },
                  }}
                  isOwner={isOwner}
                  initialIsFavorite={isFavorite}
                />
              </div>

              {/* Seller Profile Card */}
              <SellerCard seller={listing.seller} />
            </div>
          </div>
        </div>

        {/* Similar Listings Section */}
        <div className="mt-16 pt-12 border-t border-border/70">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                Similar Items on Campus
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Other student listings in {categoryInfo.label}
              </p>
            </div>

            <Button variant="ghost" size="sm" asChild className="text-xs font-medium text-primary">
              <Link href={`/browse?category=${listing.category}`}>
                <span>View all in {categoryInfo.label}</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {similarListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarListings.map((simListing) => (
                <ListingCard key={simListing.id} listing={simListing} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No similar listings in this price range right now.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-3 rounded-xl text-xs">
                <Link href={`/browse?category=${listing.category}`}>
                  Explore All {categoryInfo.label}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

