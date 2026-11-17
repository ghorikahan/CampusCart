export default function FavoritesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-72 bg-muted/60 rounded" />
      </div>

      {/* Tabs / Filter skeleton */}
      <div className="flex gap-2">
        <div className="h-9 w-24 bg-muted rounded-xl" />
        <div className="h-9 w-28 bg-muted rounded-xl" />
        <div className="h-9 w-32 bg-muted rounded-xl" />
      </div>

      {/* Cards Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-border/60 bg-muted/30 overflow-hidden"
          >
            <div className="aspect-[4/3] bg-muted/60" />
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
              <div className="h-5 w-4/5 bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
