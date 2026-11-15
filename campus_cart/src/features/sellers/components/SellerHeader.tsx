"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  GraduationCap,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Mail,
  Phone,
  Edit3,
  Share2,
  Package,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type PublicSellerProfile } from "@/server/sellers/queries";
import { cn } from "@/lib/utils";

interface SellerHeaderProps {
  seller: PublicSellerProfile;
  isOwner: boolean;
  className?: string;
}

const contactPreferenceMap: Record<
  string,
  { label: string; icon: typeof MessageSquare; variant: "default" | "secondary" | "outline" | "indigo" }
> = {
  IN_APP: { label: "CampusChat preferred", icon: MessageSquare, variant: "indigo" },
  EMAIL: { label: "Email preferred", icon: Mail, variant: "secondary" },
  PHONE: { label: "Call / SMS preferred", icon: Phone, variant: "outline" },
  WHATSAPP: { label: "WhatsApp preferred", icon: MessageSquare, variant: "default" },
};

export function SellerHeader({ seller, isOwner, className }: SellerHeaderProps) {
  const memberSince = seller.createdAt
    ? format(new Date(seller.createdAt), "MMMM yyyy")
    : "Recently joined";

  const preference =
    seller.contactPreference && contactPreferenceMap[seller.contactPreference]
      ? contactPreferenceMap[seller.contactPreference]
      : contactPreferenceMap.IN_APP;

  const PreferenceIcon = preference.icon;

  const initials = seller.name
    ? seller.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "CC";

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${seller.name}'s Profile on CampusCart`,
          text: `Check out items listed by ${seller.name} on CampusCart!`,
          url,
        });
        toast.success("Profile link shared!");
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
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div
      className={cn(
        "rounded-3xl border border-border/70 bg-card/70 backdrop-blur-md p-6 sm:p-8 shadow-xs",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left: Avatar & Identity Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
          {/* Avatar Container */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-3xl border-2 border-border/80 bg-muted/60 shadow-sm">
            {seller.image ? (
              <Image
                src={seller.image}
                alt={seller.name}
                fill
                priority
                sizes="(max-width: 640px) 96px, 112px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-heading text-3xl font-extrabold text-primary bg-primary/10">
                {initials}
              </div>
            )}
            <div
              title="Verified Campus Student"
              className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs"
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          {/* Text Details */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {seller.name}
              </h1>
              {isOwner && (
                <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/30">
                  Your Public Profile
                </Badge>
              )}
            </div>

            {/* Academic Info */}
            {(seller.university || seller.course) && (
              <p className="flex items-center gap-2 text-sm text-foreground/80 font-medium flex-wrap">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {seller.course ? `${seller.course}` : ""}
                  {seller.course && seller.university ? " • " : ""}
                  {seller.university ? `${seller.university}` : ""}
                </span>
              </p>
            )}

            {/* Location & Tenure */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground mt-0.5">
              {seller.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" />
                  {seller.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                Member since {memberSince}
              </span>
            </div>

            {/* Contact Preference Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant={preference.variant}
                className="text-xs font-medium py-1 px-2.5 gap-1.5 rounded-xl"
              >
                <PreferenceIcon className="h-3.5 w-3.5" />
                {preference.label}
              </Badge>

              {/* Disclosed Phone (Only rendered if showPhone is true or viewer is owner) */}
              {seller.phone && (
                <a
                  href={`tel:${seller.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium py-1 px-2.5 rounded-xl bg-muted/80 hover:bg-muted border border-border/60 text-foreground transition"
                  title="Click to call"
                >
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{seller.phone}</span>
                </a>
              )}

              {/* WhatsApp Quick Link if preferred and phone is available */}
              {seller.contactPreference === "WHATSAPP" && seller.phone && (
                <a
                  href={`https://wa.me/${seller.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium py-1 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: Stats Counters & Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
          {/* Stat Counter Pills */}
          <div className="flex items-center gap-3">
            <div className="flex-1 sm:flex-initial flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-muted/50 border border-border/60">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-heading text-lg font-bold text-foreground leading-none">
                  {seller.activeListingsCount}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  Active {seller.activeListingsCount === 1 ? "Item" : "Items"}
                </p>
              </div>
            </div>

            <div className="flex-1 sm:flex-initial flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-muted/50 border border-border/60">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-heading text-lg font-bold text-foreground leading-none">
                  {seller.soldCount}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  Items Sold
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isOwner ? (
              <Button
                variant="default"
                size="default"
                asChild
                className="flex-1 sm:flex-initial rounded-xl font-medium shadow-xs"
              >
                <Link href="/settings/profile">
                  <Edit3 className="h-4 w-4 mr-1.5" />
                  Edit Profile
                </Link>
              </Button>
            ) : null}

            <Button
              variant="outline"
              size="default"
              onClick={handleShare}
              className="flex-1 sm:flex-initial rounded-xl border-border/70 font-medium"
            >
              <Share2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
              Share Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Bio section if available */}
      {seller.bio && (
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line max-w-3xl">
            {seller.bio}
          </p>
        </div>
      )}
    </div>
  );
}

