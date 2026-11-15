import { ListingCardSkeleton } from "@/components/shared/ListingCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function BrowseResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

