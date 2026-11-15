"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { GraduationCap, Calendar, MessageSquare, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SellerProfileData {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  image?: string | null;
  bio?: string | null;
  university?: string | null;
  course?: string | null;
  city?: string | null;
  phone?: string | null;
  showPhone?: boolean;
  contactPreference?: "IN_APP" | "EMAIL" | "PHONE" | "WHATSAPP";
  createdAt?: string | Date;
}

interface SellerCardProps {
  seller: SellerProfileData;
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

export function SellerCard({ seller, className }: SellerCardProps) {
  const sellerId = seller.id || seller._id;
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

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-5 shadow-xs transition-all hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-muted/60 shadow-xs">
          {seller.image ? (
            <Image
              src={seller.image}
              alt={seller.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-heading text-lg font-bold text-primary bg-primary/10">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-base text-foreground truncate">
              {seller.name}
            </h3>
            <span
              title="Verified Student"
              className="inline-flex items-center text-primary"
            >
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>

          {seller.university ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
              <span className="truncate">{seller.university}</span>
            </p>
          ) : null}

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 mt-1">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {seller.bio && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/40 line-clamp-2">
          {seller.bio}
        </p>
      )}

      {/* Meta tags & Action */}
      <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
        <Badge
          variant={preference.variant}
          className="text-[11px] font-normal py-0.5 px-2 gap-1 rounded-lg"
        >
          <PreferenceIcon className="h-3 w-3" />
          {preference.label}
        </Badge>

        {sellerId ? (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-7 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5 px-2 rounded-lg"
          >
            <Link href={`/sellers/${sellerId}`}>
              <span>View seller profile</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

