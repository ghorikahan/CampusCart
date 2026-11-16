"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, HeartOff, Sparkles, ShoppingBag, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListingCard } from "@/components/shared/ListingCard";
import { UnavailableFavoriteCard } from "./UnavailableFavoriteCard";
import type {
  FavoriteListingsResult,
  FavoriteFilterType,
  FavoriteSortType,
} from "@/server/favorites/types";
import { cn } from "@/lib/utils";

interface FavoritesViewProps {
  data: FavoriteListingsResult;
  currentFilter: FavoriteFilterType;
  currentSort: FavoriteSortType;
}

export function FavoritesView({
  data,
  currentFilter,
  currentSort,
}: FavoritesViewProps) {
  const router = useRouter();
  const { items, total, availableCount, unavailableCount } = data;

  const handleSortChange = (newSort: string) => {
    router.push(`/favorites?filter=${currentFilter}&sort=${newSort}`);
  };

  return (
    <div className="space-y-6">
      {/* Filters & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Link
            href={`/favorites?filter=all&sort=${currentSort}`}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0",
              currentFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <span>All</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                currentFilter === "all"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
            >
              {total}
            </span>
          </Link>

          <Link
            href={`/favorites?filter=available&sort=${currentSort}`}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0",
              currentFilter === "available"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <span>Available</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-xs font-semibold",
                currentFilter === "available"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
            >
              {availableCount}
            </span>
          </Link>

          <Link
            href={`/favorites?filter=unavailable&sort=${currentSort}`}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0",
              currentFilter === "unavailable"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <span>No longer available</span>
            {unavailableCount > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs font-semibold",
                  currentFilter === "unavailable"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                )}
              >
                {unavailableCount}
              </span>
            )}
          </Link>
        </div>

        {/* Sort Dropdown */}
        {total > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-44 h-9 rounded-xl text-xs font-medium">
                <ArrowUpDown className="h-3 w-3 mr-1 opacity-50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                <SelectItem value="newest" className="text-xs">Recently saved</SelectItem>
                <SelectItem value="oldest" className="text-xs">Oldest saved</SelectItem>
                <SelectItem value="price_asc" className="text-xs">Price: Low to High</SelectItem>
                <SelectItem value="price_desc" className="text-xs">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Grid of Listings or Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-3xl border-dashed border-border/80 bg-card/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
            {currentFilter === "unavailable" ? (
              <Sparkles className="h-8 w-8 text-emerald-500" />
            ) : currentFilter === "available" ? (
              <HeartOff className="h-8 w-8" />
            ) : (
              <Heart className="h-8 w-8 text-rose-500" />
            )}
          </div>

          <h2 className="text-lg font-bold text-foreground font-heading">
            {currentFilter === "unavailable"
              ? "All your saved items are available! ✨"
              : currentFilter === "available"
              ? "No available saved items"
              : "Your saved list is empty"}
          </h2>

          <p className="text-sm text-muted-foreground max-w-sm mt-1.5 mb-6 leading-relaxed">
            {currentFilter === "unavailable"
              ? "None of your saved listings have been sold or deactivated yet."
              : currentFilter === "available"
              ? "All items you've saved in the past have been marked as sold or inactive."
              : "Explore textbooks, tech, and dorm essentials, then tap the heart icon on any card to save it here."}
          </p>

          {currentFilter !== "all" ? (
            <Link href="/favorites?filter=all">
              <Button variant="outline" className="rounded-xl">
                View all saved items
              </Button>
            </Link>
          ) : (
            <Link href="/browse">
              <Button className="rounded-xl gap-2 font-medium">
                <ShoppingBag className="h-4 w-4" />
                Browse Marketplace
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            if (item.isAvailable && item.listing) {
              return (
                <ListingCard
                  key={item.id}
                  listing={item.listing}
                  isFavorite={true}
                  onFavoriteToggle={() => router.refresh()}
                />
              );
            }

            return (
              <UnavailableFavoriteCard
                key={item.id}
                item={item}
                onRemoved={() => router.refresh()}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

