import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";

import { isValidObjectId } from "@/lib/serialize";
import { getCurrentUser } from "@/server/auth";
import {
  getSellerProfile,
  getSellerActiveListings,
  getSellerSoldListings,
} from "@/server/sellers/queries";

import { SellerHeader } from "@/features/sellers/components/SellerHeader";
import { SellerTabs } from "@/features/sellers/components/SellerTabs";

export const dynamic = "force-dynamic";

interface SellerProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SellerProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return {
      title: "Seller Not Found | CampusCart",
    };
  }

  const seller = await getSellerProfile(id);
  if (!seller) {
    return {
      title: "Seller Not Found | CampusCart",
    };
  }

  const campusText = seller.university ? ` at ${seller.university}` : "";
  const title = `${seller.name}${campusText} | CampusCart`;
  const description =
    seller.bio && seller.bio.length > 160
      ? `${seller.bio.slice(0, 157)}...`
      : seller.bio ||
        `Browse student listings, second-hand books, electronics, and gear from ${seller.name} on CampusCart.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: seller.image ? [{ url: seller.image, alt: seller.name }] : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: seller.image ? [seller.image] : [],
    },
  };
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { id } = await params;

  // 1. Validate ObjectId
  if (!isValidObjectId(id)) {
    notFound();
  }

  // 2. Fetch current viewer
  const currentUser = await getCurrentUser();
  const isOwner = Boolean(currentUser?.id && currentUser.id === id);

  // 3. Fetch Seller Public Profile
  const seller = await getSellerProfile(id, currentUser?.id);
  if (!seller) {
    notFound();
  }

  // 4. Fetch Active and Sold Listings in parallel
  const [activeListings, soldListings] = await Promise.all([
    getSellerActiveListings(id, isOwner),
    getSellerSoldListings(id, isOwner),
  ]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mb-6"
        >
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3 mr-0.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <Link href="/browse" className="hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="font-medium text-foreground truncate max-w-[220px] sm:max-w-[360px]">
            {seller.name}
          </span>
        </nav>

        {/* Profile Header */}
        <SellerHeader seller={seller} isOwner={isOwner} className="mb-8" />

        {/* Profile Tabs: Active Listings, Sold History, About */}
        <SellerTabs
          activeListings={activeListings}
          soldListings={soldListings}
          seller={seller}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}

