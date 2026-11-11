"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, CheckCircle2, Clock, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  updateListingStatus,
  toggleListingActive,
  deleteListing,
} from "@/features/listings/actions";
import { type ListingStatus } from "@/models/Listing";
import { cn } from "@/lib/utils";

interface ListingEditActionsProps {
  listingId: string;
  initialStatus: ListingStatus;
  initialIsActive: boolean;
  className?: string;
}

export function ListingEditActions({
  listingId,
  initialStatus,
  initialIsActive,
  className,
}: ListingEditActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ListingStatus>(initialStatus);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Status Switcher
  const handleStatusChange = async (newStatus: ListingStatus) => {
    if (newStatus === status || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const res = await updateListingStatus(listingId, newStatus);
      if (res.success) {
        setStatus(newStatus);
        toast.success(`Listing status updated to ${newStatus.toLowerCase()}.`);
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

  // Toggle Published / Active
  const handleToggleActive = async () => {
    setIsTogglingActive(true);
    try {
      const res = await toggleListingActive(listingId);
      if (res.success) {
        setIsActive(!isActive);
        toast.success(
          !isActive
            ? "Listing is now published and active."
            : "Listing has been deactivated (hidden from browse)."
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to toggle listing state.");
      }
    } catch {
      toast.error("Failed to toggle listing state.");
    } finally {
      setIsTogglingActive(false);
    }
  };

  // Delete Listing
  const handleDelete = async () => {
    try {
      const res = await deleteListing(listingId);
      if (res.success) {
        toast.success("Listing deleted successfully.");
        setDeleteDialogOpen(false);
        router.push("/dashboard/listings");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete listing.");
      }
    } catch {
      toast.error("Failed to delete listing.");
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-5",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Listing Controls
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage listing status, visibility, or permanently remove it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active status indicator badge */}
          <Badge variant={isActive ? "success" : "secondary"} className="text-xs">
            {isActive ? "Published" : "Hidden / Inactive"}
          </Badge>
          <Badge
            variant={
              status === "AVAILABLE"
                ? "success"
                : status === "RESERVED"
                ? "warning"
                : "secondary"
            }
            className="text-xs"
          >
            {status}
          </Badge>
        </div>
      </div>

      {/* Status Switcher Buttons */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          Inventory Status
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => handleStatusChange("AVAILABLE")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all",
              status === "AVAILABLE"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20"
                : "border-border bg-background hover:bg-muted text-muted-foreground"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Available</span>
          </button>

          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => handleStatusChange("RESERVED")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all",
              status === "RESERVED"
                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20"
                : "border-border bg-background hover:bg-muted text-muted-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Reserved</span>
          </button>

          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => handleStatusChange("SOLD")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all",
              status === "SOLD"
                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                : "border-border bg-background hover:bg-muted text-muted-foreground"
            )}
          >
            <Check className="h-3.5 w-3.5" />
            <span>Sold</span>
          </button>
        </div>
      </div>

      {/* Visibility & Delete Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleActive}
          disabled={isTogglingActive}
          className="rounded-xl gap-1.5"
        >
          {isTogglingActive ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isActive ? (
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Eye className="h-3.5 w-3.5 text-primary" />
          )}
          <span>{isActive ? "Deactivate Listing" : "Reactivate Listing"}</span>
        </Button>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="rounded-xl gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Listing</span>
        </Button>
      </div>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete this listing permanently?"
        description="This will remove the listing, purge all associated photos from Cloudinary, and clear user bookmarks. Pending enquiries will be marked expired."
        confirmLabel="Yes, Delete Listing"
        confirmVariant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

