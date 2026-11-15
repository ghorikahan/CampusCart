"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, BellOff, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";
import { markAllAsRead } from "@/server/notifications/actions";
import type { PaginatedNotificationsResult } from "@/server/notifications/types";
import { cn } from "@/lib/utils";

interface NotificationsViewProps {
  initialData: PaginatedNotificationsResult;
  currentFilter: "all" | "unread";
}

export function NotificationsView({
  initialData,
  currentFilter,
}: NotificationsViewProps) {
  const router = useRouter();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const { notifications, total, unreadCount, page, pageSize, totalPages } =
    initialData;

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      const res = await markAllAsRead();
      if (res.success) {
        toast.success("All notifications marked as read");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to mark all as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <Link
            href="/notifications?filter=all"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              currentFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <span>All</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                currentFilter === "all"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
            >
              {currentFilter === "all" ? total : total + (currentFilter === "unread" ? unreadCount : 0)}
            </span>
          </Link>

          <Link
            href="/notifications?filter=unread"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              currentFilter === "unread"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs font-bold",
                  currentFilter === "unread"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mark All As Read Button */}
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="rounded-xl gap-2 font-medium self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-3xl border-dashed border-border/80 bg-card/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
            {currentFilter === "unread" ? (
              <CheckCheck className="h-8 w-8 text-emerald-500" />
            ) : (
              <BellOff className="h-8 w-8" />
            )}
          </div>
          <h2 className="text-lg font-bold text-foreground font-heading">
            {currentFilter === "unread"
              ? "You're all caught up!"
              : "No notifications yet"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6 leading-relaxed">
            {currentFilter === "unread"
              ? "There are no unread notifications waiting for your attention."
              : "When buyers contact you, offers arrive, or saved items change in price, you'll see them here."}
          </p>
          {currentFilter === "unread" ? (
            <Link href="/notifications?filter=all">
              <Button variant="outline" className="rounded-xl">
                View all notifications
              </Button>
            </Link>
          ) : (
            <Link href="/browse">
              <Button className="rounded-xl gap-2">
                <Inbox className="h-4 w-4" />
                Browse Marketplace
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onStateChange={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
            <span className="font-medium text-foreground">{endItem}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> notifications
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
              className="rounded-xl gap-1 text-xs"
            >
              {page > 1 ? (
                <Link
                  href={`/notifications?filter=${currentFilter}&page=${page - 1}`}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="h-3.5 w-3.5 mr-1 inline" />
                  Previous
                </span>
              )}
            </Button>

            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-muted text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              asChild={page < totalPages}
              className="rounded-xl gap-1 text-xs"
            >
              {page < totalPages ? (
                <Link
                  href={`/notifications?filter=${currentFilter}&page=${page + 1}`}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span>
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1 inline" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

