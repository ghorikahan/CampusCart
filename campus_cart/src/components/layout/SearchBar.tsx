"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "ALL", label: "All" },
  { value: "BOOKS", label: "Books" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "STATIONERY", label: "Stationery" },
  { value: "OTHER", label: "Other" },
];

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category !== "ALL") params.set("category", category);
      router.push(`/listings?${params.toString()}`);
    },
    [query, category, router]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center rounded-xl border border-border bg-muted/40 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all ${className ?? ""}`}
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
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
      />

      {/* Search icon button */}
      <button
        type="submit"
        className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

