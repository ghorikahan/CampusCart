"use client";

import { format, formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EnquiryStatusBadge } from "./EnquiryStatusBadge";
import { type EnquiryStatus, type IEnquiryStatusHistory } from "@/models/Enquiry";

interface EnquiryHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingTitle: string;
  status: EnquiryStatus;
  history: IEnquiryStatusHistory[];
}

export function EnquiryHistoryDrawer({
  open,
  onOpenChange,
  listingTitle,
  status,
  history,
}: EnquiryHistoryDrawerProps) {
  const sortedHistory = [...(history || [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="h-4 w-4" />
            <span>Audit Trail</span>
          </div>
          <SheetTitle className="font-heading text-lg font-bold text-foreground">
            Enquiry Timeline
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground line-clamp-1">
            Status transitions for &ldquo;{listingTitle}&rdquo;
          </SheetDescription>
          <div className="pt-2">
            <EnquiryStatusBadge status={status} />
          </div>
        </SheetHeader>

        <div className="py-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Transition History
          </h4>

          {sortedHistory.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70">
              {sortedHistory.map((item, idx) => {
                const date = new Date(item.at);
                const isLatest = idx === 0;

                return (
                  <div key={idx} className="relative group">
                    {/* Bullet marker */}
                    <div
                      className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-background transition-transform ${
                        isLatest
                          ? "bg-primary ring-4 ring-primary/20 scale-110"
                          : "bg-muted-foreground/40"
                      }`}
                    />

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {item.status}
                        </span>
                        <span className="text-[11px] text-muted-foreground" title={format(date, "PPpp")}>
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground/80">
                        {format(date, "MMM d, yyyy • h:mm a")}
                      </p>

                      {item.note && (
                        <p className="text-xs text-foreground/90 mt-1 p-2.5 rounded-xl bg-muted/50 border border-border/50">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No history records found.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
