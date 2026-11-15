"use client";

import { useState } from "react";
import { toast } from "sonner";
import { XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { respondToEnquiry } from "@/server/enquiries/actions";

interface RejectEnquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiryId: string;
  listingTitle: string;
  buyerName: string;
  onSuccess?: () => void;
}

export function RejectEnquiryDialog({
  open,
  onOpenChange,
  enquiryId,
  listingTitle,
  buyerName,
  onSuccess,
}: RejectEnquiryDialogProps) {
  const [responseMessage, setResponseMessage] = useState(
    "Thank you for your interest, but I cannot accept this offer at this time."
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await respondToEnquiry({
        enquiryId,
        action: "REJECT",
        responseMessage,
      });

      if (res.success) {
        toast.info(`Offer declined. ${buyerName} has been notified.`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to decline enquiry.");
      }
    } catch {
      toast.error("Failed to decline enquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <XCircle className="h-4 w-4" />
            <span>Decline Offer</span>
          </div>
          <DialogTitle className="font-heading text-lg font-bold text-foreground">
            Decline Offer from {buyerName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            For &ldquo;{listingTitle}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleReject} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rejectNote" className="text-xs font-semibold">
              Optional Note to Buyer
            </Label>
            <Textarea
              id="rejectNote"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={3}
              className="rounded-xl text-xs resize-none"
              placeholder="e.g. Price is firm, already sold elsewhere, etc."
            />
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
              variant="destructive"
              disabled={isLoading}
              className="rounded-xl text-xs font-semibold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-1.5" />
              )}
              Confirm Decline
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
