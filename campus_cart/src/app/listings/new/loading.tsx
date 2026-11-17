export default function NewListingLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted/70 rounded" />
      </div>
      <div className="space-y-6 rounded-2xl border border-border/70 p-6 bg-card">
        <div className="h-40 w-full bg-muted/40 rounded-xl" />
        <div className="h-10 w-full bg-muted/50 rounded-xl" />
        <div className="h-24 w-full bg-muted/50 rounded-xl" />
      </div>
    </div>
  );
}
