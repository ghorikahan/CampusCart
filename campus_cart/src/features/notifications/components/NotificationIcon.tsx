import React from "react";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  TrendingDown,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/server/notifications/types";
import { cn } from "@/lib/utils";

interface NotificationTypeConfig {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  label: string;
}

const TYPE_CONFIGS: Record<NotificationType, NotificationTypeConfig> = {
  ENQUIRY_RECEIVED: {
    icon: MessageSquare,
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    textColor: "text-blue-600 dark:text-blue-400",
    label: "Enquiry Received",
  },
  ENQUIRY_ACCEPTED: {
    icon: CheckCircle2,
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    label: "Offer Accepted",
  },
  ENQUIRY_REJECTED: {
    icon: XCircle,
    bgColor: "bg-rose-500/10 dark:bg-rose-500/20",
    textColor: "text-rose-600 dark:text-rose-400",
    label: "Offer Declined",
  },
  FAVORITE_SOLD: {
    icon: ShoppingBag,
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    textColor: "text-amber-600 dark:text-amber-400",
    label: "Saved Item Sold",
  },
  FAVORITE_PRICE_DROP: {
    icon: TrendingDown,
    bgColor: "bg-teal-500/10 dark:bg-teal-500/20",
    textColor: "text-teal-600 dark:text-teal-400",
    label: "Price Drop",
  },
  SYSTEM: {
    icon: Bell,
    bgColor: "bg-slate-500/10 dark:bg-slate-500/20",
    textColor: "text-slate-600 dark:text-slate-400",
    label: "System Alert",
  },
};

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
  iconClassName?: string;
}

export function NotificationIcon({
  type,
  className,
  iconClassName,
}: NotificationIconProps) {
  const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.SYSTEM;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        config.bgColor,
        config.textColor,
        className
      )}
      aria-label={config.label}
    >
      <Icon className={cn("h-4 w-4", iconClassName)} />
    </div>
  );
}

