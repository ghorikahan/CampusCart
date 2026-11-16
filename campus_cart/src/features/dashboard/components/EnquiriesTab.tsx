"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AcceptEnquiryDialog } from "@/features/enquiries/components/AcceptEnquiryDialog";
import { RejectEnquiryDialog } from "@/features/enquiries/components/RejectEnquiryDialog";
import { EnquiryStatusBadge } from "@/features/enquiries/components/EnquiryStatusBadge";
import type { DashboardEnquiryItem } from "@/server/dashboard/types";
import { cn } from "@/lib/utils";

interface EnquiriesTabProps {
  enquiries: DashboardEnquiryItem[];
}

export function EnquiriesTab({ enquiries }: EnquiriesTabProps) {
  const router = useRouter();

  // Accept/Reject Modal State
  const [activeAcceptEnquiry, setActiveAcceptEnquiry] =
    useState<DashboardEnquiryItem | null>(null);
  const [activeRejectEnquiry, setActiveRejectEnquiry] =
    useState<DashboardEnquiryItem | null>(null);

  if (enquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-3xl border-dashed border-border/80 bg-card/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <Inbox className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground font-heading">
          No enquiries received yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
          When buyers send messages or make offers on your items, they will appear here with instant accept/reject controls.
        </p>
        <Link href="/browse">
          <Button variant="outline" size="sm" className="rounded-xl">
            Explore Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <p className="text-xs font-semibold text-muted-foreground">
          Showing {enquiries.length} received {enquiries.length === 1 ? "offer" : "offers"}
        </p>
        <Link
          href="/enquiries"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          <span>Full enquiries page</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {enquiries.map((enq) => {
          const isPending = enq.status === "PENDING";
          const timeAgo = formatDistanceToNow(new Date(enq.createdAt), {
            addSuffix: true,
          });

          return (
            <div
              key={enq.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all",
                isPending
                  ? "border-amber-500/30 bg-amber-500/[0.02] shadow-xs"
                  : "border-border/60 bg-card"
              )}
            >
              {/* Left Column: Listing Thumbnail + Buyer Info + Message */}
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Thumbnail */}
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0">
                  {enq.listingImage ? (
                    <Image
                      src={enq.listingImage}
                      alt={enq.listingTitle}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/listings/${enq.listingId}`}
                      className="font-bold text-xs text-foreground hover:text-primary transition-colors truncate max-w-xs"
                    >
                      {enq.listingTitle}
                    </Link>

                    <EnquiryStatusBadge status={enq.status} />

                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Clock className="h-2.5 w-2.5" />
                        Awaiting Reply
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {enq.counterpartName}
                    </span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                    {enq.offerPrice !== null && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-primary">
                          Offer: ₹{enq.offerPrice.toLocaleString("en-IN")}
                        </span>
                        {enq.listingPrice !== null && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            (Asking: ₹{enq.listingPrice.toLocaleString("en-IN")})
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground/90 mt-1 line-clamp-1 italic bg-muted/30 px-2 py-1 rounded-lg">
                    &ldquo;{enq.message}&rdquo;
                  </p>
                </div>
              </div>

              {/* Right Column: Inline Action Buttons for Sellers */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {isPending ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setActiveAcceptEnquiry(enq)}
                      className="rounded-xl h-8 px-3 text-xs gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Accept</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveRejectEnquiry(enq)}
                      className="rounded-xl h-8 px-3 text-xs gap-1 font-semibold hover:bg-destructive/10 hover:text-destructive"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Decline</span>
                    </Button>
                  </>
                ) : (
                  <Link href="/enquiries">
                    <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-muted-foreground">
                      <span>Details</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accept Dialog */}
      {activeAcceptEnquiry && (
        <AcceptEnquiryDialog
          open={Boolean(activeAcceptEnquiry)}
          onOpenChange={(open) => !open && setActiveAcceptEnquiry(null)}
          enquiryId={activeAcceptEnquiry.id}
          listingTitle={activeAcceptEnquiry.listingTitle}
          buyerName={activeAcceptEnquiry.counterpartName}
          offerPrice={activeAcceptEnquiry.offerPrice}
          askingPrice={activeAcceptEnquiry.listingPrice}
          onSuccess={() => {
            setActiveAcceptEnquiry(null);
            router.refresh();
          }}
        />
      )}

      {/* Reject Dialog */}
      {activeRejectEnquiry && (
        <RejectEnquiryDialog
          open={Boolean(activeRejectEnquiry)}
          onOpenChange={(open) => !open && setActiveRejectEnquiry(null)}
          enquiryId={activeRejectEnquiry.id}
          listingTitle={activeRejectEnquiry.listingTitle}
          buyerName={activeRejectEnquiry.counterpartName}
          onSuccess={() => {
            setActiveRejectEnquiry(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
