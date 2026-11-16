"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  Phone,
  ExternalLink,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EnquiryStatusBadge } from "@/features/enquiries/components/EnquiryStatusBadge";
import { withdrawEnquiry } from "@/server/enquiries/actions";
import type { DashboardEnquiryItem } from "@/server/dashboard/types";
import { cn } from "@/lib/utils";

interface SentOffersTabProps {
  offers: DashboardEnquiryItem[];
}

export function SentOffersTab({ offers }: SentOffersTabProps) {
  const router = useRouter();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    if (!withdrawingId || isWithdrawing) return;
    setIsWithdrawing(true);

    try {
      const res = await withdrawEnquiry({ enquiryId: withdrawingId });
      if (res.success) {
        toast.success("Enquiry withdrawn");
        setWithdrawingId(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to withdraw enquiry");
      }
    } catch {
      toast.error("Failed to withdraw enquiry");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-3xl border-dashed border-border/80 bg-card/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <Send className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground font-heading">
          No sent offers yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
          When you make offers or contact sellers about campus listings, you can track their status and response here.
        </p>
        <Link href="/browse">
          <Button size="sm" className="rounded-xl">
            Browse Campus Listings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <p className="text-xs font-semibold text-muted-foreground">
          Showing {offers.length} sent {offers.length === 1 ? "enquiry" : "enquiries"}
        </p>
        <Link
          href="/enquiries?tab=sent"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          <span>View on enquiries page</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {offers.map((enq) => {
          const isPending = enq.status === "PENDING";
          const isAccepted = enq.status === "ACCEPTED";
          const timeAgo = formatDistanceToNow(new Date(enq.createdAt), {
            addSuffix: true,
          });

          return (
            <div
              key={enq.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all",
                isAccepted
                  ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                  : "border-border/60 bg-card"
              )}
            >
              <div className="flex items-start gap-3.5 min-w-0">
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
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>Seller: <strong>{enq.counterpartName}</strong></span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                    {enq.offerPrice !== null && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-primary">
                          Your Offer: ₹{enq.offerPrice.toLocaleString("en-IN")}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message Quote */}
                  <p className="text-xs text-muted-foreground/90 mt-1 line-clamp-1 italic bg-muted/30 px-2 py-1 rounded-lg">
                    &ldquo;{enq.message}&rdquo;
                  </p>

                  {/* Contact details revealed if Accepted */}
                  {isAccepted && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Seller Contact:
                      </span>
                      {enq.showPhone && enq.counterpartPhone ? (
                        <a
                          href={`tel:${enq.counterpartPhone}`}
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-md"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{enq.counterpartPhone}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">
                          Prefers in-app chat
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {isPending && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWithdrawingId(enq.id)}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive rounded-lg gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Withdraw</span>
                  </Button>
                )}

                <Link href={`/listings/${enq.listingId}`}>
                  <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs rounded-xl gap-1">
                    <span>View Item</span>
                    <ExternalLink className="h-3 w-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Withdraw Dialog */}
      <ConfirmDialog
        open={Boolean(withdrawingId)}
        onOpenChange={(open) => !open && setWithdrawingId(null)}
        title="Withdraw Enquiry"
        description="Are you sure you want to withdraw this offer? The seller will be notified that you cancelled the request."
        confirmLabel="Withdraw Offer"
        confirmVariant="destructive"
        isLoading={isWithdrawing}
        onConfirm={handleWithdraw}
      />
    </div>
  );
}
