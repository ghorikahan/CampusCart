"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Bell, CheckCheck, ExternalLink, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationIcon } from "@/features/notifications/components/NotificationIcon";
import { markAsRead, markAllAsRead } from "@/server/notifications/actions";
import type { SerializedNotification } from "@/server/notifications/types";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NavbarNotifications() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Poll unread count every 45s (between 30-60s per requirements)
  const { data: countData, mutate: mutateCount } = useSWR<{ count: number }>(
    "/api/notifications/unread-count",
    fetcher,
    {
      refreshInterval: 45000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  // Load recent notifications
  const {
    data: recentData,
    mutate: mutateRecent,
    isLoading: isLoadingRecent,
  } = useSWR<{ notifications: SerializedNotification[] }>(
    "/api/notifications/recent",
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  const unreadCount = countData?.count ?? 0;
  const notifications = recentData?.notifications ?? [];

  const handleNotificationClick = async (notif: SerializedNotification) => {
    // If unread, mark as read immediately
    if (!notif.readAt) {
      // Optimistically update
      mutateCount(
        (prev) => ({ count: Math.max(0, (prev?.count ?? 1) - 1) }),
        false
      );
      mutateRecent(
        (prev) => ({
          notifications: (prev?.notifications ?? []).map((n) =>
            n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n
          ),
        }),
        false
      );

      // Perform server action in background
      markAsRead(notif.id).catch((err) => {
        console.error("Failed to mark as read:", err);
      });
    }

    setOpen(false);

    // Navigate to link or default notifications page
    if (notif.link) {
      router.push(notif.link);
    } else {
      router.push("/notifications");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    // Optimistic update
    mutateCount({ count: 0 }, false);
    mutateRecent(
      (prev) => ({
        notifications: (prev?.notifications ?? []).map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        })),
      }),
      false
    );

    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setIsMarkingAll(false);
      mutateCount();
      mutateRecent();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl transition-colors"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm",
                "animate-in zoom-in-75 duration-200"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-2xl rounded-2xl overflow-hidden border-border/80 bg-background"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* List Body */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {isLoadingRecent && notifications.length === 0 ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start animate-pulse">
                  <div className="h-9 w-9 rounded-xl bg-muted shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                <CheckCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                All caught up!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No notifications to display right now.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.readAt;
              let timeAgo = "";
              try {
                timeAgo = formatDistanceToNow(new Date(notif.createdAt), {
                  addSuffix: true,
                });
              } catch {
                timeAgo = "";
              }

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "flex items-start gap-3 p-3.5 text-left transition hover:bg-muted/50 cursor-pointer select-none",
                    isUnread && "bg-primary/[0.03]"
                  )}
                >
                  <NotificationIcon type={notif.type} className="mt-0.5" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs font-semibold truncate",
                          isUnread
                            ? "text-foreground font-bold"
                            : "text-foreground/80"
                        )}
                      >
                        {notif.title}
                      </p>
                      {isUnread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.body}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-muted-foreground/75">
                        {timeAgo}
                      </span>
                      {notif.link && (
                        <>
                          <span className="text-[10px] text-muted-foreground/40">•</span>
                          <span className="text-[10px] font-medium text-primary inline-flex items-center gap-0.5 hover:underline">
                            View <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 bg-muted/20 p-2 text-center">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <span>View all notifications</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

