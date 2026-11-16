import type { ListingCategory, ListingCondition, ListingStatus, ListingType } from "@/models/Listing";
import type { EnquiryStatus } from "@/models/Enquiry";

export interface DashboardOverviewStats {
  activeListings: number;
  reservedListings: number;
  soldListings: number;
  inactiveListings: number;
  totalListings: number;
  totalViews: number;
  pendingOffersCount: number;
  unreadNotificationsCount: number;
  totalRevenue: number;
}

export interface DailyActivityPoint {
  date: string; // YYYY-MM-DD
  label: string; // e.g., "Nov 12"
  views: number;
  listingsCreated: number;
}

export interface NeedsAttentionItem {
  id: string;
  type: "PENDING_ENQUIRY" | "STALE_RESERVED" | "ZERO_VIEWS";
  title: string;
  description: string;
  link: string;
  ageDays: number;
  extra?: string;
}

export interface OnboardingChecklistState {
  hasProfileComplete: boolean;
  hasFirstListing: boolean;
  hasSoldItem: boolean;
  hasSavedFavorite: boolean;
  completedCount: number;
  totalSteps: number;
  isCompleted: boolean;
}

export interface DashboardListingRow {
  id: string;
  title: string;
  price: number | null;
  category: ListingCategory;
  condition: ListingCondition;
  listingType: ListingType;
  status: ListingStatus;
  isActive: boolean;
  viewCount: number;
  images: Array<{ url: string; publicId?: string }>;
  createdAt: string;
  updatedAt: string;
  soldAt?: string | null;
}

export interface DashboardEnquiryItem {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number | null;
  listingImage?: string;
  counterpartName: string;
  counterpartImage?: string | null;
  counterpartPhone?: string | null;
  showPhone: boolean;
  contactPreference: "CHAT" | "WHATSAPP" | "CALL";
  message: string;
  offerPrice: number | null;
  status: EnquiryStatus;
  createdAt: string;
  responseMessage?: string;
}

