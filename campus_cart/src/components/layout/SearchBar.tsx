"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, BookOpen, Laptop, Armchair, PenTool, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceTag } from "@/components/shared/PriceTag";
import { cn } from "@/lib/utils";
import { type SearchSuggestion } from "@/server/listings/search";

const categories = [
  { value: "ALL", label: "All" },
  { value: "BOOKS", label: "Books" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "STATIONERY", label: "Stationery" },
  { value: "OTHER", label: "Other" },
];

const categoryIcons: Record<string, React.ElementType> = {
  BOOKS: BookOpen,
  ELECTRONICS: Laptop,
  FURNITURE: Armchair,
  STATIONERY: PenTool,
  OTHER: Package,
};

interface SearchBarProps {
  className?: string;
  initialQuery?: string;
  initialCategory?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  className,
  initialQuery = "",
  initialCategory = "ALL",
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error("Suggestion fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const activeSuggestions = query.trim().length >= 2 ? suggestions : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsOpen(false);
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category !== "ALL") params.set("category", category);
      router.push(`/browse?${params.toString()}`);
    },
    [query, category, router]
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-xl border border-border bg-muted/40 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all"
      >
        {/* Category select */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-28 shrink-0 rounded-none border-0 border-r border-border bg-transparent text-xs focus:ring-0 focus:ring-offset-0 focus-visible:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value} className="text-xs">
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search input */}
        <Input
          type="search"
          placeholder="Search books, electronics, furniture…"
          value={query}
          autoFocus={autoFocus}
          onFocus={() => {
            if (activeSuggestions.length > 0) setIsOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="h-9 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />

        {/* Loading Spinner or Search Icon Button */}
        <button
          type="submit"
          className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Search"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && activeSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden divide-y divide-border/60 animate-in fade-in-0 zoom-in-95">
          <div className="p-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
            Top Matches
          </div>
          <div className="py-1">
            {activeSuggestions.map((item) => {
              const Icon = categoryIcons[item.category] || Package;

              return (
                <Link
                  key={item.id}
                  href={`/browse?q=${encodeURIComponent(item.title)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {item.category.toLowerCase()}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <PriceTag
                      price={item.price}
                      listingType={item.listingType as "FOR_SALE" | "FREE" | "EXCHANGE"}
                      className="text-xs"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="p-2 bg-muted/20 text-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-semibold text-primary hover:underline"
            >
              See all results for &ldquo;{query}&rdquo; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
