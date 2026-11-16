import Link from "next/link";
import { AlertTriangle, Clock, EyeOff, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NeedsAttentionItem } from "@/server/dashboard/types";

interface NeedsAttentionPanelProps {
  items: NeedsAttentionItem[];
}

export function NeedsAttentionPanel({ items }: NeedsAttentionPanelProps) {
  if (items.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/70 shadow-xs bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold font-heading flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Needs Attention</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 py-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <p>All caught up! No pending offers &gt; 48h, stale reserved listings, or zero-view items.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const iconMap = {
    PENDING_ENQUIRY: MessageSquare,
    STALE_RESERVED: Clock,
    ZERO_VIEWS: EyeOff,
  };

  const badgeConfig = {
    PENDING_ENQUIRY: {
      label: "Pending > 48h",
      variant: "warning" as const,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    STALE_RESERVED: {
      label: "Reserved > 7d",
      variant: "secondary" as const,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    },
    ZERO_VIEWS: {
      label: "0 Views",
      variant: "secondary" as const,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
  };

  return (
    <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.02] shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold font-heading flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Needs Attention</span>
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {items.length} {items.length === 1 ? "action" : "actions"}
            </span>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2.5">
        {items.map((item) => {
          const Icon = iconMap[item.type];
          const badge = badgeConfig[item.type];

          return (
            <Link
              key={item.id}
              href={item.link}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-border/60 bg-card hover:border-amber-500/40 hover:bg-muted/40 transition-all text-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5 ${badge.color}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0 h-4">
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-primary shrink-0 self-end sm:self-auto group-hover:translate-x-0.5 transition-transform">
                <span>Resolve</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

