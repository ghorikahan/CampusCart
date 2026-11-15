"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export function BrowseSortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || (searchParams.get("q") ? "relevance" : "newest");

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
        <ArrowUpDown className="h-3 w-3" />
        Sort:
      </span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="h-9 w-44 text-xs rounded-xl bg-background border-border">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="newest" className="text-xs">
            Newest First
          </SelectItem>
          <SelectItem value="relevance" className="text-xs">
            Most Relevant
          </SelectItem>
          <SelectItem value="price_asc" className="text-xs">
            Price: Low to High
          </SelectItem>
          <SelectItem value="price_desc" className="text-xs">
            Price: High to Low
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

