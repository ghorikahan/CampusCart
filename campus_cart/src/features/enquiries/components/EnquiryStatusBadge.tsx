"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, ArrowLeftCircle, AlertTriangle } from "lucide-react";
import { type EnquiryStatus } from "@/models/Enquiry";
import { cn } from "@/lib/utils";

interface EnquiryStatusBadgeProps {
  status: EnquiryStatus;
  className?: string;
}

const statusConfig: Record<
  EnquiryStatus,
  {
    label: string;
    variant: "warning" | "success" | "destructive" | "secondary" | "outline";
    icon: typeof Clock;
    classes: string;
  }
> = {
  PENDING: {
    label: "Pending Response",
    variant: "warning",
    icon: Clock,
    classes: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  ACCEPTED: {
    label: "Offer Accepted",
    variant: "success",
    icon: CheckCircle2,
    classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  REJECTED: {
    label: "Declined",
    variant: "destructive",
    icon: XCircle,
    classes: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    variant: "secondary",
    icon: ArrowLeftCircle,
    classes: "bg-muted text-muted-foreground border-border/60",
  },
  EXPIRED: {
    label: "Expired",
    variant: "outline",
    icon: AlertTriangle,
    classes: "bg-muted/40 text-muted-foreground/80 border-border/40",
  },
};

export function EnquiryStatusBadge({ status, className }: EnquiryStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("text-xs font-semibold py-0.5 px-2.5 gap-1.5 rounded-lg border", config.classes, className)}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
