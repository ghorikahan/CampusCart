"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/shared/PriceTag";
import { SellerChip } from "@/components/shared/SellerChip";
import { cn } from "@/lib/utils";

export type ListingCardData = {
  id: string;
  title: string;
  price: number | null;
  category: "BOOKS" | "ELECTRONICS" | "FURNITURE" | "STATIONERY" | "OTHER";
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  listingType: "FOR_SALE" | "FREE" | "EXCHANGE";
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  isActive?: boolean;
  images: Array<{ url: string; publicId?: string; width?: number; height?: number }>;
  seller: {
    name: string;
    image?: string | null;
    university?: string | null;
    city?: string | null;
  };
  createdAt: string | Date;
  locationText?: string;
};

interface ListingCardProps {
  listing: ListingCardData;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void | Promise<void>;
  className?: string;
}

const conditionMap: Record<
  ListingCardData["condition"],
  { label: string; variant: "success" | "indigo" | "secondary" | "warning" | "destructive" }
> = {
  NEW: { label: "Brand New", variant: "success" },
  LIKE_NEW: { label: "Like New", variant: "indigo" },
  GOOD: { label: "Good", variant: "secondary" },
  FAIR: { label: "Fair", variant: "warning" },
  POOR: { label: "Poor", variant: "destructive" },
};

export function ListingCard({
  listing,
  isFavorite: initialFavorite = false,
  onFavoriteToggle,
  className,
}: ListingCardProps) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [imageError, setImageError] = useState(false);

  const primaryImage = listing.images?.[0]?.url;
  const isAvailable = listing.status === "AVAILABLE";
  const conditionInfo = conditionMap[listing.condition] || {
    label: listing.condition,
    variant: "secondary" as const,
  };

  const timeAgo = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
  });

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite((prev) => !prev);
    if (onFavoriteToggle) {
      await onFavoriteToggle(listing.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card card-hover transition-all duration-200",
        className
      )}
    >
      <Link href={`/listings/${listing.id}`} className="flex flex-col flex-1">
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/50">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                !isAvailable && "grayscale-[40%] opacity-90"
              )}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground text-xs font-medium">
              No Image
            </div>
          )}

          {/* Status Ribbon if Sold or Reserved */}
          {listing.status === "SOLD" && (
            <div className="status-ribbon bg-destructive text-destructive-foreground shadow-sm">
              SOLD
            </div>
          )}
          {listing.status === "RESERVED" && (
            <div className="status-ribbon bg-amber-500 text-white shadow-sm">
              RESERVED
            </div>
          )}

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
            className={cn(
              "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground shadow-sm transition hover:scale-110 hover:bg-background",
              favorite && "text-rose-500 hover:text-rose-600 fill-rose-500"
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-transform active:scale-125",
                favorite && "fill-rose-500 stroke-rose-500"
              )}
            />
          </button>

          {/* Category & Condition Badges overlay bottom */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
            <Badge
              variant={conditionInfo.variant}
              className="text-[10px] px-2 py-0.5 bg-background/90 backdrop-blur-sm shadow-xs"
            >
              {conditionInfo.label}
            </Badge>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-4 justify-between gap-3">
          <div>
            {/* Price & Listing Type */}
            <div className="flex items-center justify-between mb-1.5">
              <PriceTag price={listing.price} listingType={listing.listingType} />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {listing.category}
              </span>
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              {listing.title}
            </h3>
          </div>

          {/* Location & Time Ago metadata */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            {listing.locationText && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{listing.locationText}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <SellerChip
                name={listing.seller.name}
                image={listing.seller.image}
                university={listing.seller.university}
              />
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

