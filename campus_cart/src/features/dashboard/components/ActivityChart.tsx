"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DailyActivityPoint } from "@/server/dashboard/types";
import { cn } from "@/lib/utils";

interface ActivityChartProps {
  data: DailyActivityPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const [metric, setMetric] = useState<"views" | "listings">("views");

  const totalViews = data.reduce((acc, curr) => acc + curr.views, 0);
  const totalCreated = data.reduce((acc, curr) => acc + curr.listingsCreated, 0);

  return (
    <Card className="rounded-2xl border border-border/70 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
        <div>
          <CardTitle className="text-base font-bold font-heading">
            30-Day Activity
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {metric === "views"
              ? `${totalViews.toLocaleString()} total listing views in the last 30 days`
              : `${totalCreated} new listings created in the last 30 days`}
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted p-1 rounded-xl">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMetric("views")}
            className={cn(
              "h-7 px-2.5 text-xs font-semibold rounded-lg transition-all",
              metric === "views"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Views ({totalViews})
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMetric("listings")}
            className={cn(
              "h-7 px-2.5 text-xs font-semibold rounded-lg transition-all",
              metric === "listings"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Listings ({totalCreated})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
            >
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="label"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DailyActivityPoint;
                    return (
                      <div className="rounded-xl border border-border/80 bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-semibold text-foreground mb-1">
                          {item.label}
                        </p>
                        <p className="text-muted-foreground">
                          {metric === "views" ? (
                            <>
                              <span className="font-bold text-indigo-500">
                                {item.views}
                              </span>{" "}
                              views
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-emerald-500">
                                {item.listingsCreated}
                              </span>{" "}
                              created
                            </>
                          )}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {metric === "views" ? (
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#primaryGradient)"
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="listingsCreated"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#emeraldGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

