export default function BrowseLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-28 rounded-2xl bg-muted/40 border border-border/50" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden lg:block lg:col-span-3 h-96 rounded-2xl border border-border/60 bg-muted/30 p-5 space-y-4">
          <div className="h-5 w-24 bg-muted rounded" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-muted/60 rounded" />
            <div className="h-4 w-5/6 bg-muted/60 rounded" />
            <div className="h-4 w-4/6 bg-muted/60 rounded" />
          </div>
        </div>

        {/* Right Main Grid Skeleton */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-border/60">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-9 w-28 bg-muted rounded-xl" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-border/60 bg-muted/30 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-muted/60" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
