"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Share2,
  Flag,
  MessageSquare,
  Edit,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Check,
  Loader2,
  AlertTriangle,
  Send,
  Trash2,
  Phone,
  ExternalLink,
  ArrowLeftCircle,
  Inbox,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ShareListingDialog } from "./ShareListingDialog";
import {
  updateListingStatus,
  toggleListingActive,
  deleteListing,
} from "@/features/listings/actions";
import { createEnquiry, withdrawEnquiry } from "@/server/enquiries/actions";
import { EnquiryStatusBadge } from "@/features/enquiries/components/EnquiryStatusBadge";
import { type ListingStatus, type ListingType } from "@/models/Listing";
import { type EnquiryStatus } from "@/models/Enquiry";
import { cn } from "@/lib/utils";

export interface ExistingEnquiryData {
  id: string;
  _id?: string;
  message: string;
  offerPrice?: number | null;
  status: EnquiryStatus;
  responseMessage?: string | null;
  createdAt: string | Date;
  seller?: {
    name?: string;
    phone?: string | null;
    showPhone?: boolean;
    contactPreference?: "IN_APP" | "EMAIL" | "PHONE" | "WHATSAPP";
  };
}

interface ListingActionAreaProps {
  listing: {
    id: string;
    title: string;
    price: number | null;
    listingType: ListingType;
    status: ListingStatus;
    isActive: boolean;
    seller: {
      id?: string;
      _id?: string;
      name: string;
      phone?: string | null;
      showPhone?: boolean;
      contactPreference?: "IN_APP" | "EMAIL" | "PHONE" | "WHATSAPP";
    };
  };
  isOwner: boolean;
  initialIsFavorite?: boolean;
  existingEnquiry?: ExistingEnquiryData | null;
  className?: string;
}

const QUICK_MESSAGE_TEMPLATES = [
  "👋 Hi! Is this still available for campus pickup?",
  "📍 Can we meet today near the campus library or canteen?",
  "🎓 I'm interested in buying this! Would you consider a slight student discount?",
];

export function ListingActionArea({
  listing,
  isOwner,
  initialIsFavorite = false,
  existingEnquiry: initialEnquiry = null,
  className,
}: ListingActionAreaProps) {
  const router = useRouter();

  // Existing Enquiry state (can be updated locally after submission or withdrawal)
  const [currentEnquiry, setCurrentEnquiry] = useState<ExistingEnquiryData | null>(
    initialEnquiry
  );

  // Owner Action States
  const [currentStatus, setCurrentStatus] = useState<ListingStatus>(listing.status);
  const [currentIsActive, setCurrentIsActive] = useState(listing.isActive);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Enquiry / Make Offer Modal State
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState(
    listing.price ? String(listing.price) : ""
  );
  const [enquiryMessage, setEnquiryMessage] = useState(
    QUICK_MESSAGE_TEMPLATES[0]
  );
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Buyer Withdraw State
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Report Modal State
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("MISLEADING");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Share Dialog State
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // 2. Share
  const handleShare = () => {
    setShareDialogOpen(true);
  };

  // 3. Enquiry / Offer Submit
  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEnquiry(true);

    try {
      const parsedOffer =
        offerPrice && !isNaN(Number(offerPrice)) ? Number(offerPrice) : null;

      const res = await createEnquiry({
        listingId: listing.id,
        message: enquiryMessage,
        offerPrice: parsedOffer,
      });

      if (res.success) {
        toast.success(
          `Offer submitted! ${listing.seller.name} has been notified.`
        );
        setEnquiryOpen(false);

        // Update local state to show enquiry status immediately
        const created = res.data as ExistingEnquiryData;
        setCurrentEnquiry(created);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to submit enquiry.");
      }
    } catch {
      toast.error("An error occurred while submitting your offer.");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // 4. Buyer Withdraw Enquiry
  const handleWithdrawEnquiry = async () => {
    if (!currentEnquiry?.id) return;
    setIsWithdrawing(true);

    try {
      const res = await withdrawEnquiry({ enquiryId: currentEnquiry.id });
      if (res.success) {
        toast.success("Enquiry withdrawn successfully.");
        setCurrentEnquiry((prev) =>
          prev ? { ...prev, status: "WITHDRAWN" as EnquiryStatus } : null
        );
        setWithdrawDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to withdraw enquiry.");
      }
    } catch {
      toast.error("Failed to withdraw enquiry.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // 5. Report Submit
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsSubmittingReport(false);
    setReportOpen(false);
    toast.success("Report submitted. Our campus moderation team has been notified.");
  };

  // 6. Owner Status Switch
  const handleOwnerStatusChange = async (newStatus: ListingStatus) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updateListingStatus(listing.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        toast.success(`Status updated to ${newStatus.toLowerCase()}.`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 7. Owner Toggle Active
  const handleOwnerToggleActive = async () => {
    if (isTogglingActive) return;
    setIsTogglingActive(true);
    try {
      const res = await toggleListingActive(listing.id);
      if (res.success) {
        const nextState = !currentIsActive;
        setCurrentIsActive(nextState);
        toast.success(
          nextState
            ? "Listing is now active and visible to students."
            : "Listing has been hidden from marketplace searches."
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to toggle visibility.");
      }
    } catch {
      toast.error("Failed to toggle visibility.");
    } finally {
      setIsTogglingActive(false);
    }
  };

  // 8. Owner Delete Listing
  const handleOwnerDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteListing(listing.id);
      if (res.success) {
        toast.success("Listing deleted successfully.");
        router.push("/dashboard/listings");
      } else {
        toast.error(res.error || "Failed to delete listing.");
      }
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const isSold = currentStatus === "SOLD";

  // Check if buyer has an active pending or accepted enquiry
  const hasExistingEnquiry = Boolean(currentEnquiry);
  const isEnquiryPending = currentEnquiry?.status === "PENDING";
  const isEnquiryAccepted = currentEnquiry?.status === "ACCEPTED";
  const isEnquiryRejected = currentEnquiry?.status === "REJECTED";
  const isEnquiryWithdrawn = currentEnquiry?.status === "WITHDRAWN";
  const isEnquiryExpired = currentEnquiry?.status === "EXPIRED";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Primary Action Button (or Owner Controls or Existing Enquiry Card) */}
      {isOwner ? (
        <div className="flex flex-col gap-3 p-4 rounded-2xl border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span>👑</span> You are the seller
            </span>
            <Badge
              variant={currentIsActive ? "success" : "secondary"}
              className="text-[11px]"
            >
              {currentIsActive ? "Active & Public" : "Deactivated / Hidden"}
            </Badge>
          </div>

          {/* Quick status selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Change Listing Status:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60">
              {(["AVAILABLE", "RESERVED", "SOLD"] as const).map((s) => {
                const isSelected = currentStatus === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleOwnerStatusChange(s)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all select-none",
                      isSelected
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    )}
                  >
                    {isUpdatingStatus && isSelected ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        {s === "AVAILABLE" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        {s === "RESERVED" && <Clock className="h-3.5 w-3.5 text-amber-500" />}
                        {s === "SOLD" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                      </>
                    )}
                    <span className="capitalize">{s.toLowerCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Owner Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="default"
              size="default"
              asChild
              className="rounded-xl font-medium shadow-xs"
            >
              <Link href={`/listings/${listing.id}/edit`}>
                <Edit className="h-4 w-4 mr-1.5" />
                Edit Listing
              </Link>
            </Button>

            <Button
              variant="outline"
              size="default"
              disabled={isTogglingActive}
              onClick={handleOwnerToggleActive}
              className="rounded-xl font-medium border-border/80"
            >
              {isTogglingActive ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : currentIsActive ? (
                <EyeOff className="h-4 w-4 mr-1.5 text-amber-600" />
              ) : (
                <Eye className="h-4 w-4 mr-1.5 text-emerald-600" />
              )}
              {currentIsActive ? "Deactivate" : "Activate"}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive w-full rounded-xl"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete this listing permanently
          </Button>
        </div>
      ) : hasExistingEnquiry && currentEnquiry ? (
        /* If buyer already has an enquiry on this listing, display its status card */
        <div className="flex flex-col gap-3 p-4 rounded-2xl border-2 border-primary/20 bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Inbox className="h-4 w-4 text-primary" /> Your Offer Status
            </span>
            <EnquiryStatusBadge status={currentEnquiry.status} />
          </div>

          {/* Status Specific Message & Details */}
          {isEnquiryAccepted ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Offer Accepted! Coordinate Campus Handover</span>
              </p>
              <p className="text-xs text-foreground/80">
                The seller accepted your offer {currentEnquiry.offerPrice ? `of ₹${currentEnquiry.offerPrice.toLocaleString("en-IN")}` : ""}.
              </p>

              {/* Reveal Contact Details */}
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex flex-wrap gap-2">
                {listing.seller.phone && (
                  <a
                    href={`tel:${listing.seller.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-lg bg-background border border-emerald-300 text-foreground hover:bg-muted"
                  >
                    <Phone className="h-3 w-3 text-emerald-600" />
                    <span>Call {listing.seller.phone}</span>
                  </a>
                )}
                {listing.seller.contactPreference === "WHATSAPP" && listing.seller.phone && (
                  <a
                    href={`https://wa.me/${listing.seller.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ) : isEnquiryPending ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" /> Waiting for {listing.seller.name}&apos;s reply
              </p>
              <p className="text-[11px] text-muted-foreground">
                Submitted {formatDistanceToNow(new Date(currentEnquiry.createdAt), { addSuffix: true })}.
                {currentEnquiry.offerPrice ? ` Offer: ₹${currentEnquiry.offerPrice.toLocaleString("en-IN")}` : ""}
              </p>
            </div>
          ) : isEnquiryRejected ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-semibold">Offer Declined</p>
              <p className="text-[11px] text-muted-foreground">
                The seller did not accept this offer.
                {currentEnquiry.responseMessage ? ` "${currentEnquiry.responseMessage}"` : ""}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground">
              Enquiry was {currentEnquiry.status.toLowerCase()}.
            </div>
          )}

          {/* Quick Actions for Existing Enquiry */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 text-xs font-medium rounded-xl border-border/80"
            >
              <Link href="/enquiries?tab=sent">
                <span>View in Enquiries</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>

            {isEnquiryPending && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWithdrawDialogOpen(true)}
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <ArrowLeftCircle className="h-3.5 w-3.5 mr-1" />
                Withdraw
              </Button>
            )}

            {(isEnquiryWithdrawn || isEnquiryExpired || isEnquiryRejected) && !isSold && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setEnquiryOpen(true)}
                className="text-xs rounded-xl"
              >
                Make New Offer
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Standard Send Enquiry Button for Visitors without an existing enquiry */
        <div className="flex flex-col gap-2.5">
          <Button
            size="lg"
            disabled={isSold}
            onClick={() => setEnquiryOpen(true)}
            className={cn(
              "w-full rounded-2xl font-heading text-base font-semibold shadow-md transition-all",
              isSold
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-lg"
            )}
          >
            <MessageSquare className="h-5 w-5 mr-2 shrink-0" />
            {isSold
              ? "Item has been sold"
              : listing.listingType === "FREE"
                ? "Request Free Item"
                : listing.listingType === "EXCHANGE"
                  ? "Propose Exchange"
                  : "Send Enquiry / Make Offer"}
          </Button>
        </div>
      )}

      {/* Secondary Action Row: Favorite, Share, Report */}
      <div className="flex items-center gap-2">
        <FavoriteButton
          variant="button"
          listingId={listing.id}
          initialIsFavorite={initialIsFavorite}
          className="flex-1"
        />

        <Button
          variant="outline"
          size="default"
          onClick={handleShare}
          className="flex-1 rounded-xl border-border/70 font-medium hover:bg-muted"
        >
          <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
          Share
        </Button>

        {!isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setReportOpen(true)}
            title="Report this listing"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 1. Send Enquiry & Offer Dialog */}
      <Dialog open={enquiryOpen} onOpenChange={setEnquiryOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">
              {listing.listingType === "FREE"
                ? "Request This Free Item"
                : listing.listingType === "EXCHANGE"
                  ? "Propose An Exchange"
                  : "Send Enquiry / Make an Offer"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Direct message to <span className="font-medium text-foreground">{listing.seller.name}</span>{" "}
              regarding &ldquo;{listing.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendEnquiry} className="flex flex-col gap-4 py-2">
            {listing.listingType === "FOR_SALE" && listing.price && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="offerPrice" className="text-xs font-semibold">
                  Your Offer Amount (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                    ₹
                  </span>
                  <Input
                    id="offerPrice"
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="pl-7 rounded-xl font-medium"
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                {/* Price quick helper chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setOfferPrice(String(listing.price))}
                    className="text-[11px] font-medium px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition"
                  >
                    Asking: ₹{listing.price}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOfferPrice(String(Math.round((listing.price ?? 0) * 0.9)))
                    }
                    className="text-[11px] font-medium px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition"
                  >
                    10% Off: ₹{Math.round((listing.price ?? 0) * 0.9)}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOfferPrice(String(Math.round((listing.price ?? 0) * 0.8)))
                    }
                    className="text-[11px] font-medium px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition"
                  >
                    20% Off: ₹{Math.round((listing.price ?? 0) * 0.8)}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Templates */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Message Templates:
              </span>
              <div className="flex flex-col gap-1">
                {QUICK_MESSAGE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEnquiryMessage(tmpl)}
                    className="text-left text-xs p-2 rounded-xl border border-border/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition line-clamp-1"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="enquiryMessage" className="text-xs font-semibold">
                Message to Seller
              </Label>
              <Textarea
                id="enquiryMessage"
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                rows={3}
                className="rounded-xl resize-none text-xs"
                placeholder="Ask about condition, campus pickup location, or negotiation..."
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
              💡 <span className="font-medium text-foreground">Safe Campus Trading:</span> We recommend
              meeting in well-lit public campus spots like the student library, canteen, or campus gates.
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEnquiryOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingEnquiry}
                className="rounded-xl font-semibold"
              >
                {isSubmittingEnquiry ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1.5" />
                )}
                Submit Offer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Buyer Withdraw Confirmation Dialog */}
      <ConfirmDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        title="Withdraw this enquiry?"
        description="Are you sure you want to withdraw your enquiry? The seller will be notified that you are no longer interested."
        confirmLabel="Withdraw Offer"
        confirmVariant="destructive"
        isLoading={isWithdrawing}
        onConfirm={handleWithdrawEnquiry}
      />

      {/* 3. Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Report this Listing
            </DialogTitle>
            <DialogDescription className="text-xs">
              Help keep CampusCart trustworthy for all students. What is wrong with this listing?
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendReport} className="flex flex-col gap-4 py-2">
            <RadioGroup
              value={reportReason}
              onValueChange={setReportReason}
              className="flex flex-col gap-2.5 text-xs"
            >
              {[
                { value: "MISLEADING", label: "Misleading photos or inaccurate condition" },
                { value: "ALREADY_SOLD", label: "Item is already sold or unresponsive seller" },
                { value: "PROHIBITED", label: "Prohibited, illegal, or dangerous item" },
                { value: "SCAM", label: "Suspicious activity or fraudulent price" },
                { value: "OTHER", label: "Other campus marketplace violation" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer transition"
                >
                  <RadioGroupItem value={opt.value} id={`report-${opt.value}`} />
                  <span className="font-medium text-foreground">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reportNotes" className="text-xs font-semibold">
                Additional Details (Optional)
              </Label>
              <Textarea
                id="reportNotes"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={2}
                placeholder="Provide any details to assist student moderators..."
                className="rounded-xl text-xs resize-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setReportOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmittingReport}
                className="rounded-xl"
              >
                {isSubmittingReport ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Flag className="h-4 w-4 mr-1.5" />
                )}
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Owner Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete this listing?"
        description="Are you sure you want to permanently delete this listing? This action cannot be undone and will remove all photos and saved favorites."
        confirmLabel="Delete Listing"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleOwnerDelete}
      />

      {/* 5. Share Listing Dialog with QR Code */}
      <ShareListingDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        listing={{
          id: listing.id,
          title: listing.title,
          price: listing.price,
        }}
      />
    </div>
  );
}
