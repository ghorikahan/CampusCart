"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { respondToEnquiry } from "@/server/enquiries/actions";

interface AcceptEnquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiryId: string;
  listingTitle: string;
  buyerName: string;
  offerPrice?: number | null;
  askingPrice?: number | null;
  onSuccess?: () => void;
}

export function AcceptEnquiryDialog({
  open,
  onOpenChange,
  enquiryId,
  listingTitle,
  buyerName,
  offerPrice,
  askingPrice,
  onSuccess,
}: AcceptEnquiryDialogProps) {
  const [setReserved, setSetReserved] = useState(true);
  const [rejectOtherPending, setRejectOtherPending] = useState(true);
  const [responseMessage, setResponseMessage] = useState(
    `Hi ${buyerName}, I accept your offer! Let's arrange a time to meet on campus for inspection and handover.`
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await respondToEnquiry({
        enquiryId,
        action: "ACCEPT",
        responseMessage,
        setReserved,
        rejectOtherPending,
      });

      if (res.success) {
        toast.success(`Offer accepted! ${buyerName} has been notified.`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to accept enquiry.");
      }
    } catch {
      toast.error("Failed to accept enquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>Confirm Acceptance</span>
          </div>
          <DialogTitle className="font-heading text-lg font-bold text-foreground">
            Accept Offer from {buyerName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            For &ldquo;{listingTitle}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAccept} className="flex flex-col gap-4 py-2">
          {/* Offer Summary pill */}
          {offerPrice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  Accepted Offer Price
                </span>
                <p className="font-heading text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  ₹{offerPrice.toLocaleString("en-IN")}
                </p>
              </div>
              {askingPrice && (
                <div className="text-right text-xs text-muted-foreground">
                  <span>Asking: ₹{askingPrice.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          )}

          {/* Response Message Note */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acceptNote" className="text-xs font-semibold">
              Message to Buyer
            </Label>
            <Textarea
              id="acceptNote"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={3}
              className="rounded-xl text-xs resize-none"
              placeholder="Add pickup instructions or suggestions..."
            />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs">
              <Checkbox
                checked={setReserved}
                onCheckedChange={(checked) => setSetReserved(Boolean(checked))}
                className="mt-0.5"
              />
              <span className="text-foreground leading-snug">
                <strong>Mark listing as RESERVED:</strong> Hold this item so other students know it is pending handover.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs">
              <Checkbox
                checked={rejectOtherPending}
                onCheckedChange={(checked) => setRejectOtherPending(Boolean(checked))}
                className="mt-0.5"
              />
              <span className="text-foreground leading-snug">
                <strong>Decline other pending offers:</strong> Automatically close other open offers on this listing.
              </span>
            </label>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>Upon acceptance, your contact details will be shared with {buyerName} for campus pickup.</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
              )}
              Confirm & Accept
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
