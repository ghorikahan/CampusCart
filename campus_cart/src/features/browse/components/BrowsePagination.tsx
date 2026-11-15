"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrowsePaginationProps {
  currentPage: number;
  totalPages: number;
}

export function BrowsePagination({ currentPage, totalPages }: BrowsePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Generate page numbers with ellipses
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (
      pages[pages.length - 1] !== "..." &&
      (i < currentPage - 1 || i > currentPage + 1)
    ) {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => navigateToPage(currentPage - 1)}
        className="rounded-xl text-xs gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span key={`dots-${idx}`} className="px-2 text-xs text-muted-foreground">
              ...
            </span>
          );
        }

        const isCurrent = p === currentPage;
        return (
          <Button
            key={`page-${p}`}
            variant={isCurrent ? "default" : "outline"}
            size="sm"
            onClick={() => navigateToPage(Number(p))}
            className="rounded-xl h-8 w-8 p-0 text-xs font-semibold"
          >
            {p}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => navigateToPage(currentPage + 1)}
        className="rounded-xl text-xs gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

