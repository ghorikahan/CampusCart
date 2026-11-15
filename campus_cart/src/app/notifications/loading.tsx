import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
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
        <div className="flex items-center justify-between border-b border-border/60 pb-5 mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-20 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>

        {/* Notification Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-5 rounded-2xl border border-border/60 bg-card"
            >
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

