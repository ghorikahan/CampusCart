export default function ProfileSettingsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="space-y-2 pb-4 border-b border-border/60">
        <div className="h-8 w-44 bg-muted rounded-lg" />
        <div className="h-4 w-72 bg-muted/60 rounded" />
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted/60 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-10 bg-muted/70 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 bg-muted/70 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-10 bg-muted/70 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-10 bg-muted/70 rounded-xl" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <div className="h-10 w-32 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
