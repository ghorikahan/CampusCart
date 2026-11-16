"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/server/favorites/actions";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  initialIsFavorite?: boolean;
  variant?: "floating" | "button" | "icon";
  size?: "sm" | "default" | "lg";
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export function FavoriteButton({
  listingId,
  initialIsFavorite = false,
  variant = "floating",
  size = "default",
  className,
  onToggle,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorite);

  // React 19 optimistic state
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
    isFavorited,
    (_current, update: boolean) => update
  );
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    startTransition(async () => {
      const nextState = !optimisticFavorited;
      setOptimisticFavorited(nextState);

      try {
        const res = await toggleFavorite(listingId);
        if (res.success) {
          setIsFavorited(res.isFavorited);
          mutate("/api/favorites/count");
          onToggle?.(res.isFavorited);
          toast.success(
            res.isFavorited ? "Saved to your favorites!" : "Removed from favorites."
          );
        } else {
          setOptimisticFavorited(isFavorited);
          if (res.requiresAuth) {
            toast.error("Please sign in to save items.");
            const currentPath =
              typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "/";
            router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
          } else {
            toast.error(res.error || "Failed to update favorites.");
          }
        }
      } catch (err) {
        setOptimisticFavorited(isFavorited);
        toast.error("Failed to update favorites.");
        console.error(err);
      }
    });
  };

  // 1. Floating round button overlay for ListingCard
  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={optimisticFavorited ? "Remove from favorites" : "Save to favorites"}
        className={cn(
          "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm transition hover:scale-110 hover:bg-background",
          optimisticFavorited
            ? "text-rose-500 hover:text-rose-600"
            : "text-muted-foreground hover:text-foreground",
          className
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-transform active:scale-125",
            optimisticFavorited
              ? "fill-rose-500 stroke-rose-500"
              : "stroke-current fill-none"
          )}
        />
      </button>
    );
  }

  // 2. Full action button (used on listing detail page)
  if (variant === "button") {
    return (
      <Button
        type="button"
        variant={optimisticFavorited ? "secondary" : "outline"}
        size={size}
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "gap-2 rounded-xl transition-all font-medium",
          optimisticFavorited &&
            "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 border-rose-500/30",
          className
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-transform active:scale-125",
            optimisticFavorited
              ? "fill-rose-500 stroke-rose-500"
              : "text-muted-foreground"
          )}
        />
        <span>{optimisticFavorited ? "Saved" : "Save Item"}</span>
      </Button>
    );
  }

  // 3. Compact Icon button
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={optimisticFavorited ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "rounded-xl transition hover:text-rose-500",
        optimisticFavorited && "text-rose-500 hover:text-rose-600",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          optimisticFavorited && "fill-rose-500 stroke-rose-500"
        )}
      />
    </Button>
  );
}

