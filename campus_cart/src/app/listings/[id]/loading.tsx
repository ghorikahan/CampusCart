export default function ListingDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-muted rounded-md" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Gallery & Description Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl bg-muted/60" />
          <div className="h-48 rounded-2xl border border-border/60 bg-muted/30 p-6 space-y-3">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-4 w-full bg-muted/70 rounded" />
            <div className="h-4 w-5/6 bg-muted/70 rounded" />
            <div className="h-4 w-3/4 bg-muted/70 rounded" />
          </div>
        </div>

        {/* Right Column: Title, Price & Action Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-5">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-muted rounded-lg" />
              <div className="h-6 w-20 bg-muted rounded-lg" />
            </div>
            <div className="h-8 w-3/4 bg-muted rounded-lg" />
            <div className="h-10 w-32 bg-muted rounded-lg" />
            <div className="h-12 w-full bg-muted/80 rounded-xl" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
            </div>
          </div>

          {/* Seller Card Skeleton */}
          <div className="h-32 rounded-2xl border border-border/70 bg-muted/30 p-5" />
        </div>
      </div>
    </div>
  );
}
