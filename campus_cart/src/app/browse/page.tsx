import { Suspense } from "react";
import { Metadata } from "next";
import { BrowseFilters } from "@/features/browse/components/BrowseFilters";
import { BrowseResults } from "@/features/browse/components/BrowseResults";
import { BrowseResultsSkeleton } from "@/features/browse/components/BrowseResultsSkeleton";
import { SearchBar } from "@/components/layout/SearchBar";
import { type ListingSortOption } from "@/server/listings/search";

export const metadata: Metadata = {
  title: "Browse Marketplace | CampusCart",
  description:
    "Explore textbooks, electronics, furniture, and essentials for sale, exchange, or free on your campus.",
};

export const dynamic = "force-dynamic";

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string | string[];
    condition?: string | string[];
    type?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    sort?: ListingSortOption;
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;

  const parsedParams = {
    q: params.q,
    category: params.category,
    conditions: params.condition,
    types: params.type,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: params.sort,
    page: params.page ? Math.max(1, Number(params.page)) : 1,
    pageSize: 12,
  };

  // Unique key for Suspense remounting when search params change
  const suspenseKey = JSON.stringify(params);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Campus Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse verified second-hand items and free giveaways from students on your campus.
          </p>
        </div>
        <div className="w-full md:max-w-md">
          <SearchBar initialQuery={params.q || ""} initialCategory={Array.isArray(params.category) ? params.category[0] : params.category} />
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Filters + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Left Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-border/80 bg-card p-5 sticky top-20 shadow-xs">
          <BrowseFilters />
        </aside>

        {/* Right Main Results Grid with Suspense Streaming */}
        <main className="lg:col-span-9">
          <Suspense key={suspenseKey} fallback={<BrowseResultsSkeleton />}>
            <BrowseResults searchParams={parsedParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

