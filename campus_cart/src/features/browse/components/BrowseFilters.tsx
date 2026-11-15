"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = [
  { id: "BOOKS", label: "Books & Textbooks" },
  { id: "ELECTRONICS", label: "Electronics & Gadgets" },
  { id: "FURNITURE", label: "Dorm Furniture" },
  { id: "STATIONERY", label: "Stationery & Supplies" },
  { id: "OTHER", label: "Other Goods" },
];

const CONDITIONS = [
  { id: "NEW", label: "Brand New" },
  { id: "LIKE_NEW", label: "Like New" },
  { id: "GOOD", label: "Good" },
  { id: "FAIR", label: "Fair" },
  { id: "POOR", label: "Poor" },
];

const LISTING_TYPES = [
  { id: "FOR_SALE", label: "For Sale (Cash)" },
  { id: "FREE", label: "Free / Donation" },
  { id: "EXCHANGE", label: "Exchange / Swap" },
];

interface BrowseFiltersProps {
  className?: string;
  onFilterChange?: () => void;
}

export function BrowseFilters({ className, onFilterChange }: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse active filters from URL
  const selectedCategories = searchParams.getAll("category");
  const selectedConditions = searchParams.getAll("condition");
  const selectedTypes = searchParams.getAll("type");
  const urlMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0;
  const urlMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 50000;

  // Local state for smooth slider dragging without cascading effects
  const [localRange, setLocalRange] = useState<[number, number] | null>(null);
  const sliderRange: [number, number] = localRange ?? [urlMinPrice, urlMaxPrice];

  // Update URL helper
  const updateParams = useCallback(
    (newParams: URLSearchParams) => {
      newParams.delete("page"); // Reset page when filters change
      const query = newParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      if (onFilterChange) onFilterChange();
    },
    [pathname, router, onFilterChange]
  );

  // Toggle multi-value array param (category, condition, type)
  const handleToggleParam = (paramName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(paramName);

    params.delete(paramName);
    if (current.includes(value)) {
      current.filter((item) => item !== value).forEach((v) => params.append(paramName, v));
    } else {
      [...current, value].forEach((v) => params.append(paramName, v));
    }

    updateParams(params);
  };

  // Commit price range to URL
  const handleApplyPrice = (min: number, max: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min > 0) {
      params.set("minPrice", String(min));
    } else {
      params.delete("minPrice");
    }

    if (max < 50000) {
      params.set("maxPrice", String(max));
    } else {
      params.delete("maxPrice");
    }

    updateParams(params);
  };

  // Reset all filters
  const handleResetAll = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    if (onFilterChange) onFilterChange();
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedConditions.length > 0 ||
    selectedTypes.length > 0 ||
    urlMinPrice > 0 ||
    urlMaxPrice < 50000;

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm tracking-wide uppercase font-heading">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="py-4 space-y-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Category
          </Label>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              return (
                <div key={cat.id} className="flex items-center space-x-2.5">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleParam("category", cat.id)}
                  />
                  <label
                    htmlFor={`cat-${cat.id}`}
                    className="text-xs font-medium text-foreground cursor-pointer select-none leading-none"
                  >
                    {cat.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Listing Type Filter */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Listing Type
          </Label>
          <div className="space-y-2">
            {LISTING_TYPES.map((type) => {
              const isChecked = selectedTypes.includes(type.id);
              return (
                <div key={type.id} className="flex items-center space-x-2.5">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleParam("type", type.id)}
                  />
                  <label
                    htmlFor={`type-${type.id}`}
                    className="text-xs font-medium text-foreground cursor-pointer select-none leading-none"
                  >
                    {type.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Price Range Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Price Range
            </Label>
            <span className="text-xs font-semibold text-primary">
              ₹{sliderRange[0].toLocaleString("en-IN")} – ₹
              {sliderRange[1] >= 50000 ? "50,000+" : sliderRange[1].toLocaleString("en-IN")}
            </span>
          </div>

          <Slider
            min={0}
            max={50000}
            step={250}
            value={sliderRange}
            onValueChange={(val) => setLocalRange([val[0], val[1] ?? 50000])}
            onValueCommit={(val) => {
              handleApplyPrice(val[0], val[1] ?? 50000);
              setLocalRange(null);
            }}
            className="py-2"
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-muted-foreground">Min (₹)</span>
              <Input
                type="number"
                min={0}
                max={sliderRange[1]}
                value={sliderRange[0]}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setLocalRange([val, sliderRange[1]]);
                }}
                onBlur={() => {
                  handleApplyPrice(sliderRange[0], sliderRange[1]);
                  setLocalRange(null);
                }}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Max (₹)</span>
              <Input
                type="number"
                min={sliderRange[0]}
                max={50000}
                value={sliderRange[1]}
                onChange={(e) => {
                  const val = Math.min(50000, Number(e.target.value));
                  setLocalRange([sliderRange[0], val]);
                }}
                onBlur={() => {
                  handleApplyPrice(sliderRange[0], sliderRange[1]);
                  setLocalRange(null);
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Condition Filter */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Condition
          </Label>
          <div className="space-y-2">
            {CONDITIONS.map((cond) => {
              const isChecked = selectedConditions.includes(cond.id);
              return (
                <div key={cond.id} className="flex items-center space-x-2.5">
                  <Checkbox
                    id={`cond-${cond.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleParam("condition", cond.id)}
                  />
                  <label
                    htmlFor={`cond-${cond.id}`}
                    className="text-xs font-medium text-foreground cursor-pointer select-none leading-none"
                  >
                    {cond.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

