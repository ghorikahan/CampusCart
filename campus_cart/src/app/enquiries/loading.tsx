import { Skeleton } from "@/components/ui/skeleton";

export default function EnquiriesLoading() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Header Skeleton */}
        <div className="space-y-3 mb-8">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Skeleton className="h-11 w-36 rounded-2xl" />
              <Skeleton className="h-11 w-36 rounded-2xl" />
            </div>
            <Skeleton className="h-4 w-60 rounded-md hidden sm:block" />
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-xl" />
            ))}
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card p-5 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-40 rounded-md" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24 rounded-md" />
                      <Skeleton className="h-2.5 w-16 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-28 rounded-xl" />
                </div>

                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
