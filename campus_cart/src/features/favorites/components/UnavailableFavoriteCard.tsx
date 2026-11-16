"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Trash2, Search, AlertCircle, CheckCircle2, Clock, Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { removeFavorite } from "@/server/favorites/actions";
import type { SerializedFavoriteItem } from "@/server/favorites/types";

interface UnavailableFavoriteCardProps {
  item: SerializedFavoriteItem;
  onRemoved?: () => void;
}

export function UnavailableFavoriteCard({
  item,
  onRemoved,
}: UnavailableFavoriteCardProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  const listing = item.listing;
  const reason = item.unavailableReason || "DELETED";

  const reasonConfig = {
    SOLD: {
      label: "Item Sold",
      badgeVariant: "destructive" as const,
      icon: CheckCircle2,
      description: "This item has been purchased and is no longer available.",
    },
    RESERVED: {
      label: "Reserved",
      badgeVariant: "warning" as const,
      icon: Clock,
      description: "The seller has reserved this item for another buyer.",
    },
    DEACTIVATED: {
      label: "Inactive",
      badgeVariant: "secondary" as const,
      icon: Ban,
      description: "The seller temporarily deactivated this listing.",
    },
    DELETED: {
      label: "Listing Removed",
      badgeVariant: "secondary" as const,
      icon: AlertCircle,
      description: "This listing was removed by the seller or administrator.",
    },
  }[reason];

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRemoving) return;
    setIsRemoving(true);

    try {
      const res = await removeFavorite(listing?.id || item.id);
      if (res.success) {
        toast.success("Removed from saved items");
        mutate("/api/favorites/count");
        onRemoved?.();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove item.");
      }
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      setIsRemoving(false);
    }
  };

  const primaryImage = listing?.images?.[0]?.url;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-border/80 bg-muted/20 opacity-80 transition-all hover:opacity-100 hover:border-border">
      {/* Top Banner Ribbon */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3.5 py-2">
        <Badge
          variant={reasonConfig.badgeVariant}
          className="gap-1 text-[10px] font-bold px-2 py-0.5"
        >
          <reasonConfig.icon className="h-3 w-3" />
          <span>{reasonConfig.label}</span>
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg gap-1"
          title="Remove from favorites"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Remove</span>
        </Button>
      </div>

      <div className="flex flex-col flex-1 p-4 justify-between gap-4">
        <div className="flex gap-3.5 items-start">
          {/* Thumbnail */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted grayscale">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={listing?.title || "Listing image"}
                fill
                sizes="80px"
                className="object-cover opacity-70"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/60 text-muted-foreground text-[10px]">
                No Image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground/90 line-clamp-1">
              {listing?.title || "Listing No Longer Available"}
            </h3>

            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {reasonConfig.description}
            </p>

            {listing?.price !== null && listing?.price !== undefined && (
              <p className="text-xs font-semibold text-foreground/75 mt-1.5 line-through">
                ₹{listing.price.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>

        {/* Find Similar Action Footer */}
        <div className="pt-2 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full rounded-xl gap-1.5 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5"
          >
            <Link href={item.similarUrl}>
              <Search className="h-3.5 w-3.5" />
              <span>Find Similar Items</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
