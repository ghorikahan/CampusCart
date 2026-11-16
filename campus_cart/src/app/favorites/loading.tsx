import { Skeleton } from "@/components/ui/skeleton";
import { ListingCardSkeleton } from "@/components/shared/ListingCardSkeleton";

export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        {/* Page Header Skeleton */}
        <div className="space-y-2 mb-8">
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-20 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

