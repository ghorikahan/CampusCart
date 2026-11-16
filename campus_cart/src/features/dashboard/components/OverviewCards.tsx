import Link from "next/link";
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  Eye,
  MessageSquare,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardOverviewStats } from "@/server/dashboard/types";
import { cn } from "@/lib/utils";

interface OverviewCardsProps {
  stats: DashboardOverviewStats;
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      label: "Active Listings",
      value: stats.activeListings,
      subtext: `${stats.totalListings} total posted`,
      icon: PackageCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      borderColor: "border-emerald-500/20",
      link: "/dashboard?tab=listings&status=AVAILABLE",
    },
    {
      label: "Reserved Items",
      value: stats.reservedListings,
      subtext: stats.reservedListings === 1 ? "1 item on hold" : `${stats.reservedListings} items on hold`,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      borderColor: "border-amber-500/20",
      link: "/dashboard?tab=listings&status=RESERVED",
    },
    {
      label: "Items Sold",
      value: stats.soldListings,
      subtext: stats.totalRevenue > 0 ? `₹${stats.totalRevenue.toLocaleString("en-IN")} earned` : "0 revenue yet",
      icon: CheckCircle2,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      borderColor: "border-purple-500/20",
      link: "/dashboard?tab=sold",
    },
    {
      label: "Total Listing Views",
      value: stats.totalViews.toLocaleString(),
      subtext: "Across all student views",
      icon: Eye,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      borderColor: "border-blue-500/20",
      link: "/dashboard?tab=listings",
    },
    {
      label: "Pending Offers",
      value: stats.pendingOffersCount,
      subtext: stats.pendingOffersCount > 0 ? "Awaiting your reply" : "All caught up",
      icon: MessageSquare,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
      borderColor: "border-indigo-500/20",
      link: "/dashboard?tab=enquiries",
      highlight: stats.pendingOffersCount > 0,
    },
    {
      label: "Unread Notifications",
      value: stats.unreadNotificationsCount,
      subtext: stats.unreadNotificationsCount > 0 ? "New alerts" : "No new alerts",
      icon: Bell,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/10 dark:bg-rose-500/20",
      borderColor: "border-rose-500/20",
      link: "/notifications",
      highlight: stats.unreadNotificationsCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.label} href={card.link} className="group block">
            <Card
              className={cn(
                "h-full border transition-all duration-200 hover:shadow-md hover:border-primary/40 rounded-2xl",
                card.highlight && "ring-1 ring-primary/30 bg-primary/[0.02]"
              )}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground truncate">
                    {card.label}
                  </span>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                      card.bgColor,
                      card.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
                    {card.value}
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">
                    {card.subtext}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
