"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeftCircle,
  MessageSquare,
  History,
  Phone,
  ExternalLink,
  Tag,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EnquiryStatusBadge } from "./EnquiryStatusBadge";
import { EnquiryHistoryDrawer } from "./EnquiryHistoryDrawer";
import { AcceptEnquiryDialog } from "./AcceptEnquiryDialog";
import { RejectEnquiryDialog } from "./RejectEnquiryDialog";
import { withdrawEnquiry } from "@/server/enquiries/actions";
import { type EnquiryStatus, type IEnquiryStatusHistory } from "@/models/Enquiry";
import { cn } from "@/lib/utils";

export interface CounterpartData {
  id?: string;
  _id?: string;
  name: string;
  image?: string | null;
  university?: string | null;
  course?: string | null;
  city?: string | null;
  contactPreference?: "IN_APP" | "EMAIL" | "PHONE" | "WHATSAPP";
  phone?: string | null;
  showPhone?: boolean;
}

export interface EnquiryListingData {
  id?: string;
  _id?: string;
  title: string;
  images?: Array<{ url: string }>;
  price?: number | null;
  status?: string;
  listingType?: string;
  condition?: string;
  locationText?: string;
}

export interface EnquiryCardData {
  id: string;
  _id: string;
  message: string;
  offerPrice?: number | null;
  status: EnquiryStatus;
  responseMessage?: string;
  respondedAt?: string | Date | null;
  statusHistory: IEnquiryStatusHistory[];
  createdAt: string | Date;
  listing?: EnquiryListingData | null;
  buyer?: CounterpartData | null;
  seller?: CounterpartData | null;
}

interface EnquiryCardProps {
  enquiry: EnquiryCardData;
  viewMode: "RECEIVED" | "SENT";
  onActionComplete?: () => void;
  className?: string;
}

export function EnquiryCard({
  enquiry,
  viewMode,
  onActionComplete,
  className,
}: EnquiryCardProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const counterpart = viewMode === "RECEIVED" ? enquiry.buyer : enquiry.seller;
  const counterpartRole = viewMode === "RECEIVED" ? "Buyer" : "Seller";

  const listingId = enquiry.listing?.id || enquiry.listing?._id;
  const listingTitle = enquiry.listing?.title || "Item Listing";
  const askingPrice = enquiry.listing?.price;
  const offerPrice = enquiry.offerPrice;
  const primaryImage = enquiry.listing?.images?.[0]?.url;

  const initials = counterpart?.name
    ? counterpart.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "CC";

  const timeAgo = formatDistanceToNow(new Date(enquiry.createdAt), {
    addSuffix: true,
  });

  // Calculate discount percentage if offerPrice & askingPrice exist
  let discountBadge: string | null = null;
  if (offerPrice && askingPrice && askingPrice > 0) {
    if (offerPrice < askingPrice) {
      const discount = Math.round(((askingPrice - offerPrice) / askingPrice) * 100);
      discountBadge = `${discount}% below asking`;
    } else if (offerPrice === askingPrice) {
      discountBadge = "Full asking price";
    } else {
      discountBadge = "Above asking price";
    }
  }

  const handleWithdrawConfirm = async () => {
    setIsWithdrawing(true);
    try {
      const res = await withdrawEnquiry({ enquiryId: enquiry.id });
      if (res.success) {
        toast.success("Enquiry withdrawn successfully.");
        setWithdrawOpen(false);
        if (onActionComplete) onActionComplete();
      } else {
        toast.error(res.error || "Failed to withdraw enquiry.");
      }
    } catch {
      toast.error("Failed to withdraw enquiry.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:shadow-sm flex flex-col gap-4",
        className
      )}
    >
      {/* Top Row: Listing & Counterpart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3 min-w-0">
          {/* Listing Thumbnail */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/40">
            {primaryImage && !imageError ? (
              <Image
                src={primaryImage}
                alt={listingTitle}
                fill
                sizes="48px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                <Tag className="h-5 w-5" />
              </div>
            )}
          </div>

          {/* Listing Title & Link */}
          <div className="min-w-0">
            {listingId ? (
              <Link
                href={`/listings/${listingId}`}
                className="font-heading font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 flex items-center gap-1 group"
              >
                <span className="truncate">{listingTitle}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ) : (
              <p className="font-heading font-semibold text-sm text-foreground line-clamp-1">
                {listingTitle}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>Asking: ₹{(askingPrice ?? 0).toLocaleString("en-IN")}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <EnquiryStatusBadge status={enquiry.status} />
        </div>
      </div>

      {/* Middle Row: Counterpart Card & Offer Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Counterpart info */}
        <div className="sm:col-span-6 flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/50">
            {counterpart?.image ? (
              <Image
                src={counterpart.image}
                alt={counterpart.name || counterpartRole}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-heading text-xs font-bold text-primary bg-primary/10">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {counterpartRole}:
              </span>
              <span className="text-xs font-bold text-foreground truncate">
                {counterpart?.name || "Student"}
              </span>
            </div>
            {counterpart?.university && (
              <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <GraduationCap className="h-3 w-3 shrink-0" />
                <span className="truncate">{counterpart.university}</span>
              </p>
            )}
          </div>
        </div>

        {/* Offer vs Asking Price Details */}
        <div className="sm:col-span-6 flex sm:justify-end">
          {offerPrice ? (
            <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-800 dark:text-emerald-300 block leading-tight">
                  Offer Amount
                </span>
                <span className="font-heading text-base font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{offerPrice.toLocaleString("en-IN")}
                </span>
              </div>
              {discountBadge && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium border-emerald-300 text-emerald-700 dark:text-emerald-300"
                >
                  {discountBadge}
                </Badge>
              )}
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs font-normal py-1 px-2.5 rounded-lg">
              General Enquiry
            </Badge>
          )}
        </div>
      </div>

      {/* Message Bubble */}
      <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs text-foreground/90 space-y-1">
        <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> Message:
        </p>
        <p className="leading-relaxed whitespace-pre-line pl-1">{enquiry.message}</p>
      </div>

      {/* Response Note Bubble (if responded) */}
      {enquiry.responseMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-foreground/90 space-y-1">
          <p className="font-semibold text-indigo-700 dark:text-indigo-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Seller Response:
          </p>
          <p className="leading-relaxed whitespace-pre-line pl-1">{enquiry.responseMessage}</p>
        </div>
      )}

      {/* Accepted Reveal Contact Details Banner (When ACCEPTED, for buyer or seller) */}
      {enquiry.status === "ACCEPTED" && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Offer Accepted — Coordinate Campus Pickup</span>
            </h4>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Connect to agree on handover time (library, canteen, or campus gates).
            </p>
          </div>

          {/* Contact options */}
          <div className="flex items-center gap-2 flex-wrap">
            {enquiry.seller?.phone && (
              <a
                href={`tel:${enquiry.seller.phone}`}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-background border border-emerald-300 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>Call {enquiry.seller.phone}</span>
              </a>
            )}

            {enquiry.seller?.contactPreference === "WHATSAPP" && enquiry.seller?.phone && (
              <a
                href={`https://wa.me/${enquiry.seller.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                <span>WhatsApp</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHistoryOpen(true)}
          className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-lg"
        >
          <History className="h-3.5 w-3.5 mr-1.5" />
          Timeline & Audit
        </Button>

        <div className="flex items-center gap-2">
          {/* Actions for Seller when PENDING */}
          {viewMode === "RECEIVED" && enquiry.status === "PENDING" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 h-8 rounded-lg"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Decline
              </Button>

              <Button
                size="sm"
                onClick={() => setAcceptOpen(true)}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-8 rounded-lg"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Accept Offer
              </Button>
            </>
          )}

          {/* Actions for Buyer when PENDING */}
          {viewMode === "SENT" && enquiry.status === "PENDING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawOpen(true)}
              className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border/70 h-8 rounded-lg"
            >
              <ArrowLeftCircle className="h-3.5 w-3.5 mr-1" />
              Withdraw
            </Button>
          )}
        </div>
      </div>

      {/* 1. History Drawer */}
      <EnquiryHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        listingTitle={listingTitle}
        status={enquiry.status}
        history={enquiry.statusHistory}
      />

      {/* 2. Accept Dialog */}
      <AcceptEnquiryDialog
        open={acceptOpen}
        onOpenChange={setAcceptOpen}
        enquiryId={enquiry.id}
        listingTitle={listingTitle}
        buyerName={counterpart?.name || "the buyer"}
        offerPrice={enquiry.offerPrice}
        askingPrice={askingPrice}
        onSuccess={onActionComplete}
      />

      {/* 3. Reject Dialog */}
      <RejectEnquiryDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        enquiryId={enquiry.id}
        listingTitle={listingTitle}
        buyerName={counterpart?.name || "the buyer"}
        onSuccess={onActionComplete}
      />

      {/* 4. Withdraw Confirmation Dialog */}
      <ConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title="Withdraw Enquiry?"
        description="Are you sure you want to withdraw this enquiry? The seller will be notified that you are no longer making this offer."
        confirmLabel="Withdraw Enquiry"
        confirmVariant="destructive"
        isLoading={isWithdrawing}
        onConfirm={handleWithdrawConfirm}
      />
    </div>
  );
}
