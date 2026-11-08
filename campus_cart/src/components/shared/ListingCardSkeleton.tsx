import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListingCardSkeletonProps {
  className?: string;
}

export function ListingCardSkeleton({ className }: ListingCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card",
        className
      )}
    >
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] w-full bg-muted/40">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-4 justify-between gap-3">
        <div className="space-y-2">
          {/* Price & category */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
          </div>

          {/* Title lines */}
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-border/50 space-y-2">
          <Skeleton className="h-3 w-1/2 rounded-md" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-2 w-12 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

