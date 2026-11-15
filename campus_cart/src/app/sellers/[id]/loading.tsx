import { Skeleton } from "@/components/ui/skeleton";
import { ListingCardSkeleton } from "@/components/shared/ListingCardSkeleton";

export default function SellerProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Header Skeleton */}
        <div className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-sm shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Skeleton className="h-24 w-24 rounded-3xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-md" />
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <Skeleton className="h-4 w-3/4 rounded-md mb-2" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

