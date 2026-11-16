import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { CheckCircle2, TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardListingRow } from "@/server/dashboard/types";

interface SoldHistoryTabProps {
  soldListings: DashboardListingRow[];
  totalRevenue: number;
}

export function SoldHistoryTab({
  soldListings,
  totalRevenue,
}: SoldHistoryTabProps) {
  if (soldListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-3xl border-dashed border-border/80 bg-card/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground font-heading">
          No sold items yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
          When an offer is completed or you mark an item as sold, it will be catalogued here along with your earnings summary.
        </p>
        <Link href="/dashboard?tab=listings">
          <Button variant="outline" size="sm" className="rounded-xl">
            View My Active Listings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/5 to-purple-500/10 border border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-foreground">
              Total Campus Earnings
            </h3>
            <p className="text-xs text-muted-foreground">
              Across {soldListings.length} completed student sales
            </p>
          </div>
        </div>

        <div className="text-right self-start sm:self-auto">
          <div className="text-2xl font-extrabold text-foreground font-heading">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            100% direct student keep
          </span>
        </div>
      </div>

      {/* Sold Items List */}
      <div className="space-y-3">
        {soldListings.map((item) => {
          const firstImg = item.images[0]?.url;
          const soldDate = item.soldAt
            ? format(new Date(item.soldAt), "MMM d, yyyy")
            : format(new Date(item.updatedAt), "MMM d, yyyy");

          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 opacity-90 hover:opacity-100 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0 grayscale-[20%]">
                  {firstImg ? (
                    <Image
                      src={firstImg}
                      alt={item.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/listings/${item.id}`}
                      className="font-bold text-xs text-foreground hover:text-primary transition-colors truncate max-w-sm"
                    >
                      {item.title}
                    </Link>
                    <Badge variant="destructive" className="text-[10px] px-2 py-0">
                      SOLD
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {item.price !== null
                        ? `₹${item.price.toLocaleString("en-IN")}`
                        : item.listingType}
                    </span>
                    <span>•</span>
                    <span>Sold on {soldDate}</span>
                    <span>•</span>
                    <span>{item.viewCount} views</span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-auto shrink-0">
                <Link href={`/listings/${item.id}`}>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs rounded-xl gap-1">
                    <span>View Listing</span>
                    <ExternalLink className="h-3 w-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
