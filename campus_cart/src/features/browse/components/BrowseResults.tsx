import { searchListings, type SearchListingsParams } from "@/server/listings/search";
import { getUserFavoriteListingIds } from "@/server/favorites/queries";
import { ListingCard } from "@/components/shared/ListingCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FadeInStagger, FadeInStaggerItem } from "@/components/shared/Motion";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { BrowseSortSelect } from "./BrowseSortSelect";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { BrowsePagination } from "./BrowsePagination";

interface BrowseResultsProps {
  searchParams: SearchListingsParams;
}

export async function BrowseResults({ searchParams }: BrowseResultsProps) {
  const result = await searchListings(searchParams);
  const { listings, total, page, totalPages } = result;

  const favoriteIds = await getUserFavoriteListingIds(listings.map((l) => l.id));
  const favoriteSet = new Set(favoriteIds);

  const hasSearch = Boolean(searchParams.q?.trim());

  return (
    <div className="space-y-6">
      {/* Results Header: Count, Mobile Filter Trigger, Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {total === 1 ? "1 listing found" : `${total} listings found`}
            {hasSearch && (
              <span className="text-muted-foreground font-normal">
                {" "}for &ldquo;{searchParams.q}&rdquo;
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <MobileFilterDrawer />
          <BrowseSortSelect />
        </div>
      </div>

      {/* Active Filter Chips */}
      <ActiveFilterChips />

      {/* Grid or Empty State */}
      {listings.length > 0 ? (
        <div className="space-y-8">
          <FadeInStagger className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {listings.map((item) => (
              <FadeInStaggerItem key={item.id}>
                <ListingCard
                  listing={item}
                  isFavorite={favoriteSet.has(item.id)}
                />
              </FadeInStaggerItem>
            ))}
          </FadeInStagger>

          <BrowsePagination currentPage={page} totalPages={totalPages} />
        </div>
      ) : (
        <EmptyState
          title="No listings matched your criteria"
          description={
            hasSearch
              ? `We couldn't find anything matching "${searchParams.q}". Try clearing filters or using different keywords.`
              : "Try adjusting your price range, category, or condition filters."
          }
          action={{
            label: "Reset all filters",
            href: "/browse",
          }}
          className="my-8"
        />
      )}
    </div>
  );
}

