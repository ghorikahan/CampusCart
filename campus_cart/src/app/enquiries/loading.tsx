export default function EnquiriesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-72 bg-muted/60 rounded" />
      </div>

      <div className="flex gap-2">
        <div className="h-10 w-28 bg-muted rounded-xl" />
        <div className="h-10 w-28 bg-muted rounded-xl" />
      </div>

      <div className="space-y-4 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-border/60 bg-muted/30"
          >
            <div className="h-20 w-20 rounded-xl bg-muted/70 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="flex justify-between items-start">
                <div className="h-5 w-48 bg-muted rounded" />
                <div className="h-6 w-20 bg-muted rounded-lg" />
              </div>
              <div className="h-4 w-32 bg-muted/60 rounded" />
              <div className="h-4 w-full bg-muted/70 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
