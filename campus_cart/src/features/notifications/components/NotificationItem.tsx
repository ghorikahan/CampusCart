"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { Check, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { NotificationIcon } from "./NotificationIcon";
import { markAsRead, deleteNotification } from "@/server/notifications/actions";
import type { SerializedNotification } from "@/server/notifications/types";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: SerializedNotification;
  onStateChange?: () => void;
}

export function NotificationItem({
  notification,
  onStateChange,
}: NotificationItemProps) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(Boolean(notification.readAt));
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const createdAtDate = new Date(notification.createdAt);
  let timeAgo = "";
  let fullDate = "";
  try {
    timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
    fullDate = format(createdAtDate, "PPpp");
  } catch {
    timeAgo = "";
    fullDate = "";
  }

  const handleRowClick = async (e: React.MouseEvent) => {
    // Prevent triggering if clicked directly on an action button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    if (!isRead) {
      setIsRead(true);
      markAsRead(notification.id).catch((err) => {
        console.error("Failed to mark as read:", err);
      });
      onStateChange?.();
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRead || isMarkingRead) return;

    setIsMarkingRead(true);
    setIsRead(true);
    try {
      const res = await markAsRead(notification.id);
      if (res.success) {
        toast.success("Notification marked as read");
        onStateChange?.();
        router.refresh();
      } else {
        setIsRead(false);
        toast.error(res.error || "Failed to mark as read");
      }
    } catch {
      setIsRead(false);
      toast.error("Failed to mark as read");
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteNotification(notification.id);
      if (res.success) {
        toast.success("Notification deleted");
        setShowDeleteConfirm(false);
        onStateChange?.();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete notification");
      }
    } catch {
      toast.error("Failed to delete notification");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={handleRowClick}
        role="button"
        tabIndex={0}
        className={cn(
          "group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all select-none cursor-pointer",
          !isRead
            ? "border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04] shadow-sm hover:border-primary/40 hover:bg-primary/[0.04]"
            : "border-border/60 bg-card hover:bg-muted/40 hover:border-border"
        )}
      >
        {/* Unread accent left bar indicator */}
        {!isRead && (
          <span
            className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        <NotificationIcon type={notification.type} className="mt-0.5" />

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className={cn(
                "text-sm tracking-tight",
                !isRead
                  ? "font-bold text-foreground"
                  : "font-medium text-foreground/85"
              )}
            >
              {notification.title}
            </h3>
            {!isRead && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Unread
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {notification.body}
          </p>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground/80 flex-wrap">
            <span title={fullDate}>{timeAgo}</span>
            {notification.link && (
              <>
                <span>•</span>
                <span className="font-medium text-primary inline-flex items-center gap-1 group-hover:underline">
                  View details <ExternalLink className="h-3 w-3" />
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 self-center sm:self-start">
          {!isRead && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkAsRead}
              disabled={isMarkingRead}
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Mark as read"
              aria-label="Mark as read"
            >
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

