"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  BOOKS: "Books",
  ELECTRONICS: "Electronics",
  FURNITURE: "Furniture",
  STATIONERY: "Stationery",
  OTHER: "Other",
  NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  FOR_SALE: "For Sale",
  FREE: "Free",
  EXCHANGE: "Exchange",
};

export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categories = searchParams.getAll("category");
  const conditions = searchParams.getAll("condition");
  const types = searchParams.getAll("type");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const q = searchParams.get("q");

  const removeParamValue = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    params.delete(key);
    current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  };

  const removePrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const hasFilters =
    categories.length > 0 ||
    conditions.length > 0 ||
    types.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice);

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-xs text-muted-foreground font-medium">Active:</span>

      {categories.map((cat) => (
        <Badge
          key={`cat-${cat}`}
          variant="secondary"
          className="gap-1.5 pr-1.5 py-1 text-xs rounded-lg cursor-pointer hover:bg-muted"
          onClick={() => removeParamValue("category", cat)}
        >
          <span>{labels[cat] || cat}</span>
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </Badge>
      ))}

      {types.map((type) => (
        <Badge
          key={`type-${type}`}
          variant="secondary"
          className="gap-1.5 pr-1.5 py-1 text-xs rounded-lg cursor-pointer hover:bg-muted"
          onClick={() => removeParamValue("type", type)}
        >
          <span>{labels[type] || type}</span>
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </Badge>
      ))}

      {conditions.map((cond) => (
        <Badge
          key={`cond-${cond}`}
          variant="secondary"
          className="gap-1.5 pr-1.5 py-1 text-xs rounded-lg cursor-pointer hover:bg-muted"
          onClick={() => removeParamValue("condition", cond)}
        >
          <span>{labels[cond] || cond}</span>
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </Badge>
      ))}

      {(minPrice || maxPrice) && (
        <Badge
          variant="secondary"
          className="gap-1.5 pr-1.5 py-1 text-xs rounded-lg cursor-pointer hover:bg-muted"
          onClick={removePrice}
        >
          <span>
            ₹{minPrice ? Number(minPrice).toLocaleString("en-IN") : "0"} – ₹
            {maxPrice ? Number(maxPrice).toLocaleString("en-IN") : "50,000+"}
          </span>
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </Badge>
      )}

      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-semibold text-primary hover:underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
}

