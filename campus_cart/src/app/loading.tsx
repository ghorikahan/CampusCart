import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse">
        Loading CampusCart...
      </p>
    </div>
  );
}
