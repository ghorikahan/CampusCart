"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  PackageOpen,
  ShoppingBag,
  ShieldCheck,
  GraduationCap,
  MapPin,
  Calendar,
  MessageSquare,
  PlusCircle,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingCard, type ListingCardData } from "@/components/shared/ListingCard";
import { type PublicSellerProfile, type SoldListingCardData } from "@/server/sellers/queries";
import { cn } from "@/lib/utils";

interface SellerTabsProps {
  activeListings: ListingCardData[];
  soldListings: SoldListingCardData[];
  seller: PublicSellerProfile;
  isOwner: boolean;
  className?: string;
}

export function SellerTabs({
  activeListings,
  soldListings,
  seller,
  isOwner,
  className,
}: SellerTabsProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Tabs defaultValue="active" className="w-full">
        {/* Tabs Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border/70 pb-4 flex-wrap gap-3">
          <TabsList className="h-11 rounded-2xl bg-muted/60 p-1 border border-border/60">
            <TabsTrigger
              value="active"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-xs flex items-center gap-2"
            >
              <span>Active Listings</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold px-1.5">
                {activeListings.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="sold"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-xs flex items-center gap-2"
            >
              <span>Sold History</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted-foreground/15 text-muted-foreground text-[11px] font-bold px-1.5">
                {soldListings.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="about"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-xs"
            >
              <span>About</span>
            </TabsTrigger>
          </TabsList>

          {isOwner && (
            <Button size="sm" asChild className="rounded-xl text-xs font-semibold shadow-xs">
              <Link href="/listings/new">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Post New Item
              </Link>
            </Button>
          )}
        </div>

        {/* 1. Active Listings Tab Content */}
        <TabsContent value="active" className="mt-6 focus-visible:outline-none">
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {activeListings.map((listing) => (
                <div key={listing.id} className="relative group">
                  <ListingCard listing={listing} />
                  {isOwner && listing.isActive === false && (
                    <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur-md text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs"
                      >
                        <EyeOff className="h-3 w-3 mr-1" />
                        Inactive Draft
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-border/80 bg-muted/20 py-16 px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
                <PackageOpen className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                No active listings
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
                {isOwner
                  ? "You do not have any items listed right now. Have unused textbooks or tech lying around? Sell them to students on campus!"
                  : `${seller.name} has no items available for sale at this moment.`}
              </p>
              {isOwner ? (
                <Button asChild className="rounded-xl shadow-xs font-medium">
                  <Link href="/listings/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild className="rounded-xl">
                  <Link href="/browse">Explore Marketplace</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* 2. Sold History Tab Content */}
        <TabsContent value="sold" className="mt-6 focus-visible:outline-none">
          {soldListings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {soldListings.map((item) => {
                const soldDate = item.soldAt || item.createdAt;
                const formattedSoldDate = soldDate
                  ? format(new Date(soldDate), "MMM d, yyyy")
                  : null;

                return (
                  <div
                    key={item.id}
                    className="relative group opacity-85 hover:opacity-100 transition-opacity"
                  >
                    <ListingCard listing={item} />
                    <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                      <Badge className="bg-purple-600/90 text-white font-semibold text-[10px] px-2 py-0.5 shadow-sm">
                        Sold {formattedSoldDate ? `• ${formattedSoldDate}` : ""}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-border/80 bg-muted/20 py-16 px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                No sold items yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Completed sales and campus exchanges will be recorded here once listings are marked as sold.
              </p>
            </div>
          )}
        </TabsContent>

        {/* 3. About Tab Content */}
        <TabsContent value="about" className="mt-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic & Campus Details */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs flex flex-col gap-5">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>Student Profile & Campus</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> University / College
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {seller.university || "Not specified"}
                  </span>
                </div>

                <div className="flex items-start justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <span>📚</span> Degree / Course
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {seller.course || "Not specified"}
                  </span>
                </div>

                <div className="flex items-start justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Campus City
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {seller.city || "Not specified"}
                  </span>
                </div>

                <div className="flex items-start justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Member Since
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {format(new Date(seller.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Preferred Contact
                  </span>
                  <span className="font-semibold text-foreground capitalize">
                    {seller.contactPreference.toLowerCase().replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust & Campus Safety Information */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs flex flex-col gap-5">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>Verification & Trust</span>
              </h3>

              <div className="space-y-3.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Verified Student Account</p>
                    <p className="mt-0.5">
                      This user has authenticated with a registered university student account on CampusCart.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/50">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Community Guidelines</p>
                    <p className="mt-0.5">
                      All sellers agree to fair student pricing, honest item condition descriptions, and safe in-person campus pickups.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-foreground/90">
                  💡 <strong>Campus Tip:</strong> When purchasing, meet during daylight hours at popular spots like the campus library, cafeteria, or college quad.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

