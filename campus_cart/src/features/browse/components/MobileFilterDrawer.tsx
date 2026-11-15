"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrowseFilters } from "./BrowseFilters";

export function MobileFilterDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden rounded-xl text-xs gap-1.5 h-9"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base font-heading">Filter Marketplace</SheetTitle>
        </SheetHeader>
        <div className="py-2">
          <BrowseFilters onFilterChange={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

