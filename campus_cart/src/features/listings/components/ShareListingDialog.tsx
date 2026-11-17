"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Copy, Download, Share2, MessageCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateQRCodeDataURL } from "@/lib/qrcode";

interface ShareListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: string;
    title: string;
    price?: number | null;
  };
}

export function ShareListingDialog({
  open,
  onOpenChange,
  listing,
}: ShareListingDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const listingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/listings/${listing.id}`
      : `/listings/${listing.id}`;

  useEffect(() => {
    if (!open) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/listings/${listing.id}` : "";
    if (url) {
      generateQRCodeDataURL(url, { width: 320 })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error("Failed to generate QR Code:", err));
    }
  }, [open, listing.id]);

  const handleCopyLink = async () => {
    if (!listingUrl) return;
    try {
      await navigator.clipboard.writeText(listingUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const cleanTitle = listing.title.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase().slice(0, 30);
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `campuscart_${cleanTitle}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  const handleWhatsAppShare = () => {
    const text = `Check out "${listing.title}" on CampusCart! ${listing.price ? `₹${listing.price.toLocaleString("en-IN")}` : ""}\n${listingUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out "${listing.title}" on CampusCart!`,
          url: listingUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await handleCopyLink();
        }
      }
    } else {
      await handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-heading">
            <Share2 className="h-5 w-5 text-primary" />
            Share Listing
          </DialogTitle>
          <DialogDescription className="text-xs">
            Share this item with fellow campus students or download a printable QR code for dorm bulletin boards.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          {/* QR Code Container */}
          <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-border shadow-xs dark:bg-card">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt={`QR code for ${listing.title}`}
                width={200}
                height={200}
                className="rounded-lg object-contain"
                unoptimized
              />
            ) : (
              <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted/30 rounded-lg animate-pulse">
                <QrCode className="h-10 w-10 text-muted-foreground/40 animate-spin" />
              </div>
            )}
            <p className="mt-2 text-[11px] font-medium text-muted-foreground text-center">
              Scan with phone camera to view listing
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadQR}
              disabled={!qrDataUrl}
              className="rounded-xl border-border/80 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download QR
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleWhatsAppShare}
              className="rounded-xl border-border/80 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1.5 fill-current" />
              WhatsApp
            </Button>
          </div>

          {/* Direct Link Copy Input */}
          <div className="w-full space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Listing Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={listingUrl}
                className="h-9 rounded-xl text-xs bg-muted/40 font-mono text-muted-foreground select-all"
              />
              <Button
                type="button"
                size="sm"
                variant={copied ? "secondary" : "default"}
                onClick={handleCopyLink}
                className="h-9 px-3.5 rounded-xl shrink-0 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Native Web Share button (if supported on mobile/tablet) */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNativeShare}
              className="w-full rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              More sharing options...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
