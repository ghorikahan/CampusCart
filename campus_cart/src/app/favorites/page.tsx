import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { requireUser } from "@/server/auth";
import { getFavoriteListings } from "@/server/favorites/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { FavoritesView } from "@/features/favorites/components/FavoritesView";
import type {
  FavoriteFilterType,
  FavoriteSortType,
} from "@/server/favorites/types";

export const metadata: Metadata = {
  title: "Saved Items | CampusCart",
  description: "Keep track of items you've saved and receive alerts if their price drops.",
};

export const dynamic = "force-dynamic";

interface FavoritesPageProps {
  searchParams: Promise<{
    filter?: string;
    sort?: string;
  }>;
}

export default async function FavoritesPage({
  searchParams,
}: FavoritesPageProps) {
  await requireUser();
  const { filter, sort } = await searchParams;

  const validFilter: FavoriteFilterType =
    filter === "available" || filter === "unavailable" ? filter : "all";

  const validSort: FavoriteSortType =
    sort === "oldest" || sort === "price_asc" || sort === "price_desc"
      ? sort
      : "newest";

  const data = await getFavoriteListings({
    filter: validFilter,
    sort: validSort,
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mb-6"
        >
          <Link
            href="/"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3 mr-0.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="font-medium text-foreground truncate">
            Saved Items
          </span>
        </nav>

        {/* Page Header */}
        <PageHeader
          title="Saved Items"
          description="Track items you want to buy, see status changes, and get automatic alerts on price drops."
        />

        {/* Favorites View */}
        <div className="mt-8">
          <FavoritesView
            data={data}
            currentFilter={validFilter}
            currentSort={validSort}
          />
        </div>
      </div>
    </div>
  );
}

