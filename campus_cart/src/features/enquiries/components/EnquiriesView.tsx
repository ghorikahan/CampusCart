"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Inbox,
  Send,
  Filter,
  PackageOpen,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EnquiryCard, type EnquiryCardData } from "./EnquiryCard";
import { type EnquiryStatus } from "@/models/Enquiry";
import { cn } from "@/lib/utils";

interface EnquiriesViewProps {
  initialReceived: EnquiryCardData[];
  initialSent: EnquiryCardData[];
  defaultTab?: "received" | "sent";
}

const STATUS_FILTERS: Array<{ label: string; value: "ALL" | EnquiryStatus }> = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Declined", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
  { label: "Expired", value: "EXPIRED" },
];

export function EnquiriesView({
  initialReceived,
  initialSent,
  defaultTab = "received",
}: EnquiriesViewProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"received" | "sent">(defaultTab);
  const [statusFilter, setStatusFilter] = useState<"ALL" | EnquiryStatus>("ALL");

  const pendingReceivedCount = initialReceived.filter(
    (e) => e.status === "PENDING"
  ).length;
  const pendingSentCount = initialSent.filter(
    (e) => e.status === "PENDING"
  ).length;

  const currentList = tab === "received" ? initialReceived : initialSent;
  const filteredList =
    statusFilter === "ALL"
      ? currentList
      : currentList.filter((e) => e.status === statusFilter);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={tab}
        onValueChange={(val) => {
          setTab(val as "received" | "sent");
          setStatusFilter("ALL");
        }}
        className="w-full"
      >
        {/* Top Header & Tabs Selection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
          <TabsList className="h-11 rounded-2xl bg-muted/60 p-1 border border-border/60">
            <TabsTrigger
              value="received"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-xs flex items-center gap-2"
            >
              <Inbox className="h-4 w-4" />
              <span>Received Offers</span>
              {pendingReceivedCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-bold px-1.5">
                  {pendingReceivedCount}
                </span>
              ) : (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted-foreground/15 text-muted-foreground text-[11px] font-bold px-1.5">
                  {initialReceived.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="sent"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-xs flex items-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Sent Enquiries</span>
              {pendingSentCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold px-1.5">
                  {pendingSentCount}
                </span>
              ) : (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted-foreground/15 text-muted-foreground text-[11px] font-bold px-1.5">
                  {initialSent.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <p className="text-xs text-muted-foreground">
            {tab === "received"
              ? "Offers and enquiries from campus buyers on your listings"
              : "Offers and messages you sent to other student sellers"}
          </p>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1 shrink-0">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {STATUS_FILTERS.map((f) => {
            const isSelected = statusFilter === f.value;
            const count =
              f.value === "ALL"
                ? currentList.length
                : currentList.filter((e) => e.status === f.value).length;

            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "flex items-center gap-1.5 py-1 px-3 rounded-xl text-xs font-medium transition-all shrink-0 select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1 rounded-full",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Tabs */}
        <TabsContent value="received" className="mt-4 focus-visible:outline-none">
          {filteredList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredList.map((enquiry) => (
                <EnquiryCard
                  key={enquiry.id}
                  enquiry={enquiry}
                  viewMode="RECEIVED"
                  onActionComplete={handleRefresh}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-border/80 bg-muted/20 py-16 px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
                <PackageOpen className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {statusFilter === "ALL"
                  ? "No received enquiries yet"
                  : `No ${statusFilter.toLowerCase()} enquiries`}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
                {statusFilter === "ALL"
                  ? "When campus students make offers or inquire about your listings, they will appear here for you to accept or decline."
                  : "Try switching to another filter or clearing filters to view other enquiries."}
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/listings/new">List an Item for Sale</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4 focus-visible:outline-none">
          {filteredList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredList.map((enquiry) => (
                <EnquiryCard
                  key={enquiry.id}
                  enquiry={enquiry}
                  viewMode="SENT"
                  onActionComplete={handleRefresh}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-border/80 bg-muted/20 py-16 px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
                <Send className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {statusFilter === "ALL"
                  ? "No sent enquiries yet"
                  : `No ${statusFilter.toLowerCase()} sent enquiries`}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
                Found a textbook or laptop you want? Send an enquiry or make an offer on any listing to negotiate and pick it up on campus.
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/browse">Browse Marketplace</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
