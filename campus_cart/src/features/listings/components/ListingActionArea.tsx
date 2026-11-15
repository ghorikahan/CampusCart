"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Heart,
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
import { toggleFavorite } from "@/server/favorites/actions";
import {
  updateListingStatus,
  toggleListingActive,
  deleteListing,
} from "@/features/listings/actions";
import { type ListingStatus, type ListingType } from "@/models/Listing";
import { cn } from "@/lib/utils";

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
    };
  };
  isOwner: boolean;
  initialIsFavorite?: boolean;
  className?: string;
}

export function ListingActionArea({
  listing,
  isOwner,
  initialIsFavorite = false,
  className,
}: ListingActionAreaProps) {
  const router = useRouter();

  // Favorite State
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

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
    `Hi ${listing.seller.name}, I'm interested in "${listing.title}". Is it still available for campus pickup?`
  );
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Report Modal State
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("MISLEADING");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // 1. Toggle Favorite
  const handleToggleFavorite = async () => {
    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);

    try {
      const res = await toggleFavorite(listing.id);
      if (res.success) {
        setIsFavorite(res.isFavorited);
        toast.success(
          res.isFavorited ? "Saved to your favorites!" : "Removed from favorites."
        );
      } else {
        toast.error(res.error || "Failed to update favorites.");
      }
    } catch {
      toast.error("Failed to update favorites.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // 2. Share
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out ${listing.title} on CampusCart!`,
          url,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  // 3. Enquiry / Offer Submit
  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEnquiry(true);

    // Simulate enquiry submission (to be fully integrated with in-app chat in Task 9)
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmittingEnquiry(false);
    setEnquiryOpen(false);
    toast.success(
      `Enquiry sent to ${listing.seller.name}! You will receive notifications when they reply.`
    );
  };

  // 4. Report Submit (Stores nothing yet, as specified)
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsSubmittingReport(false);
    setReportOpen(false);
    toast.success("Report submitted. Our campus moderation team has been notified.");
  };

  // 5. Owner Status Switch
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

  // 6. Owner Toggle Active
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

  // 7. Owner Delete Listing
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

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Primary Action Button (or Owner Controls) */}
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
      ) : (
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

      {/* Secondary Quick Action Row: Favorite, Share, Report */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="default"
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className={cn(
            "flex-1 rounded-xl border-border/70 font-medium transition-all",
            isFavorite
              ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-900"
              : "hover:bg-muted"
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 mr-2 transition-transform",
              isFavorite ? "fill-rose-500 text-rose-500 scale-110" : "text-muted-foreground"
            )}
          />
          {isFavorite ? "Saved" : "Save Item"}
        </Button>

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

      {/* 1. Enquiry & Offer Dialog */}
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
                  Your Offer (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="offerPrice"
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="pl-7 rounded-xl"
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOfferPrice(String(listing.price))}
                    className="text-[11px] font-medium px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition"
                  >
                    Asking: ₹{listing.price}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOfferPrice(String(Math.round((listing.price ?? 0) * 0.9)))
                    }
                    className="text-[11px] font-medium px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition"
                  >
                    10% Off: ₹{Math.round((listing.price ?? 0) * 0.9)}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="enquiryMessage" className="text-xs font-semibold">
                Message to Seller
              </Label>
              <Textarea
                id="enquiryMessage"
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                rows={4}
                className="rounded-xl resize-none text-sm"
                placeholder="Ask about condition, campus pickup location, or negotiation..."
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-[11px] text-muted-foreground">
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
                className="rounded-xl"
              >
                {isSubmittingEnquiry ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1.5" />
                )}
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Report Dialog */}
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

      {/* 3. Owner Delete Confirmation Dialog */}
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
    </div>
  );
}
