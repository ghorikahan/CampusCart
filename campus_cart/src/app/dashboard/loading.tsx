import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/60 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>

        {/* 6 Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-border/60 bg-card space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          ))}
        </div>

        {/* Chart + Needs Attention Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl border border-border/60 bg-card space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-8 w-36 rounded-xl" />
            </div>
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>

          <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-3">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>

        {/* Tab content Skeleton */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex gap-4 border-b border-border/60 pb-3">
            <Skeleton className="h-6 w-28 rounded-lg" />
            <Skeleton className="h-6 w-36 rounded-lg" />
            <Skeleton className="h-6 w-28 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

