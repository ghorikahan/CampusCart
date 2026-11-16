"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Package, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OverviewCards } from "./OverviewCards";
import { ActivityChart } from "./ActivityChart";
import { NeedsAttentionPanel } from "./NeedsAttentionPanel";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { MyListingsTab } from "./MyListingsTab";
import { EnquiriesTab } from "./EnquiriesTab";
import { SentOffersTab } from "./SentOffersTab";
import { SoldHistoryTab } from "./SoldHistoryTab";
import type { DashboardData } from "@/server/dashboard/queries";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  data: DashboardData;
  activeTab: "listings" | "enquiries" | "sent" | "sold";
  initialStatusFilter?: string;
}

export function DashboardView({
  data,
  activeTab,
  initialStatusFilter,
}: DashboardViewProps) {
  const router = useRouter();

  const handleTabChange = (newTab: string) => {
    router.push(`/dashboard?tab=${newTab}`);
  };

  const soldListings = data.myListings.filter((l) => l.status === "SOLD");

  return (
    <div className="space-y-8 pb-16">
      {/* Dashboard Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
            Seller Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitor your campus listings, manage incoming student offers, and track your sales.
          </p>
        </div>

        <Link href="/listings/new" className="self-start sm:self-auto shrink-0">
          <Button className="rounded-xl gap-2 font-bold shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Create New Listing</span>
          </Button>
        </Link>
      </div>

      {/* 1. Overview Metric Cards (Active, Reserved, Sold, Views, Pending Offers, Unread Notifications) */}
      <OverviewCards stats={data.stats} />

      {/* 2. Middle Row: 30-Day Activity Chart + Needs Attention Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart data={data.chartData} />
        </div>
        <div className="lg:col-span-1">
          <NeedsAttentionPanel items={data.needsAttention} />
        </div>
      </div>

      {/* 3. Onboarding Checklist (for new/growing sellers) */}
      {!data.checklist.isCompleted && (
        <OnboardingChecklist checklist={data.checklist} />
      )}

      {/* 4. Tab Navigation Bar */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2 border-b border-border/70 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => handleTabChange("listings")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm transition-all border-b-2 -mb-px shrink-0",
              activeTab === "listings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Package className="h-4 w-4" />
            <span>My Listings</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[11px]",
                activeTab === "listings"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {data.myListings.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("enquiries")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm transition-all border-b-2 -mb-px shrink-0",
              activeTab === "enquiries"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Received Enquiries</span>
            {data.stats.pendingOffersCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {data.stats.pendingOffersCount} pending
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground">
                {data.receivedEnquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("sent")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm transition-all border-b-2 -mb-px shrink-0",
              activeTab === "sent"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Send className="h-4 w-4" />
            <span>Sent Offers</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[11px]",
                activeTab === "sent"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {data.sentOffers.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("sold")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm transition-all border-b-2 -mb-px shrink-0",
              activeTab === "sold"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Sold History</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[11px]",
                activeTab === "sold"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {soldListings.length}
            </span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div>
          {activeTab === "listings" && (
            <MyListingsTab
              initialListings={data.myListings}
              initialStatusFilter={initialStatusFilter}
            />
          )}

          {activeTab === "enquiries" && (
            <EnquiriesTab enquiries={data.receivedEnquiries} />
          )}

          {activeTab === "sent" && (
            <SentOffersTab offers={data.sentOffers} />
          )}

          {activeTab === "sold" && (
            <SoldHistoryTab
              soldListings={soldListings}
              totalRevenue={data.stats.totalRevenue}
            />
          )}
        </div>
      </div>
    </div>
  );
}