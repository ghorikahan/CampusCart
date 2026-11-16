"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Sparkles, ArrowRight, UserCheck, PlusCircle, Heart, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OnboardingChecklistState } from "@/server/dashboard/types";
import { cn } from "@/lib/utils";

interface OnboardingChecklistProps {
  checklist: OnboardingChecklistState;
}

export function OnboardingChecklist({ checklist }: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(checklist.isCompleted);

  const steps = [
    {
      title: "Complete your campus profile",
      description: "Add your university, major, and contact preferences to build trust with buyers.",
      completed: checklist.hasProfileComplete,
      link: "/settings/profile",
      actionText: "Edit profile",
      icon: UserCheck,
    },
    {
      title: "Post your first campus listing",
      description: "Sell an old textbook, calculator, or dorm gear to fellow students.",
      completed: checklist.hasFirstListing,
      link: "/listings/new",
      actionText: "Post listing",
      icon: PlusCircle,
    },
    {
      title: "Save an item to your favorites",
      description: "Keep track of items you might want to buy and receive price drop alerts.",
      completed: checklist.hasSavedFavorite,
      link: "/browse",
      actionText: "Browse items",
      icon: Heart,
    },
    {
      title: "Make your first sale",
      description: "Accept an offer and complete an on-campus pickup handoff.",
      completed: checklist.hasSoldItem,
      link: "/dashboard?tab=enquiries",
      actionText: "View offers",
      icon: DollarSign,
    },
  ];

  const percentage = Math.round((checklist.completedCount / checklist.totalSteps) * 100);

  return (
    <Card className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] via-background to-primary/[0.02] shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold font-heading">
                Seller Setup Checklist
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {checklist.completedCount} of {checklist.totalSteps} steps completed ({percentage}%)
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs h-7 self-end sm:self-auto rounded-lg text-muted-foreground hover:text-foreground"
          >
            {collapsed ? "Show steps" : "Hide"}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="pt-0 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {steps.map((step) => {
              return (
                <div
                  key={step.title}
                  className={cn(
                    "flex items-start justify-between p-3 rounded-xl border transition-all text-xs",
                    step.completed
                      ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                      : "border-border/60 bg-card hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={cn(
                          "font-semibold leading-tight",
                          step.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {!step.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-7 px-2.5 text-[11px] rounded-lg shrink-0 gap-1 font-semibold text-primary hover:text-primary hover:bg-primary/5 border-primary/30"
                    >
                      <Link href={step.link}>
                        <span>{step.actionText}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
