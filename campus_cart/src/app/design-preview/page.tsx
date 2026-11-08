"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriceTag } from "@/components/shared/PriceTag";
import { SellerChip } from "@/components/shared/SellerChip";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ImageGallery } from "@/components/shared/ImageGallery";
import { ListingCard, type ListingCardData } from "@/components/shared/ListingCard";
import { ListingCardSkeleton } from "@/components/shared/ListingCardSkeleton";

const sampleGalleryImages = [
  {
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
  },
  {
    url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80",
  },
  {
    url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80",
  },
];

const sampleListings: ListingCardData[] = [
  {
    id: "preview-1",
    title: "MacBook Air M1 2020 - 8GB / 256GB Space Gray (Great Condition)",
    price: 52000,
    category: "ELECTRONICS",
    condition: "LIKE_NEW",
    listingType: "FOR_SALE",
    status: "AVAILABLE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      },
    ],
    seller: {
      name: "Alex Chen",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      university: "IIT Bombay",
    },
    createdAt: new Date("2026-11-08T10:00:00.000Z"),
    locationText: "Hostel 14, Main Campus",
  },
  {
    id: "preview-2",
    title: "Thomas Calculus (14th Edition) + Linear Algebra Reference Notes",
    price: 0,
    category: "BOOKS",
    condition: "GOOD",
    listingType: "FREE",
    status: "AVAILABLE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      },
    ],
    seller: {
      name: "Priya Sharma",
      image: null,
      university: "Delhi University",
    },
    createdAt: new Date("2026-11-06T12:00:00.000Z"),
    locationText: "North Campus Library",
  },
  {
    id: "preview-3",
    title: "Texas Instruments TI-84 Plus CE Graphing Calculator",
    price: null,
    category: "ELECTRONICS",
    condition: "NEW",
    listingType: "EXCHANGE",
    status: "RESERVED",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
      },
    ],
    seller: {
      name: "Rohit Verma",
      image: null,
      university: "BITS Pilani",
    },
    createdAt: new Date("2026-11-07T18:00:00.000Z"),
    locationText: "Mess Hall Block 2",
  },
  {
    id: "preview-4",
    title: "Ergonomic Desk Mesh Chair with Lumbar Support & Armrests",
    price: 2500,
    category: "FURNITURE",
    condition: "GOOD",
    listingType: "FOR_SALE",
    status: "SOLD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80",
      },
    ],
    seller: {
      name: "Ananya Iyer",
      image: null,
      city: "Bengaluru",
    },
    createdAt: new Date("2026-11-03T14:00:00.000Z"),
    locationText: "Koramangala 4th Block",
  },
];

// Dev-only guard
export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState([500]);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioValue, setRadioValue] = useState("option-1");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <PageHeader
        title="Design System & Component Preview"
        description="Live preview of CampusCart tokens, UI primitives, and custom shared marketplace components."
      >
        <Badge variant="indigo" className="gap-1 px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3" />
          Dev Only Preview
        </Badge>
      </PageHeader>

      {/* 1. Design Tokens: Colors & Typography */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading">1. Design Tokens & Palette</h2>
          <p className="text-sm text-muted-foreground">
            Indigo/Violet primary, Emerald accent, semantic status tokens and dark mode.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
            <div className="h-12 w-full rounded-lg bg-primary" />
            <p className="text-xs font-semibold">Primary</p>
            <p className="text-[10px] text-muted-foreground">Indigo 600</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
            <div className="h-12 w-full rounded-lg bg-accent" />
            <p className="text-xs font-semibold">Accent</p>
            <p className="text-[10px] text-muted-foreground">Emerald 500</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
            <div className="h-12 w-full rounded-lg bg-secondary" />
            <p className="text-xs font-semibold">Secondary</p>
            <p className="text-[10px] text-muted-foreground">Subtle Tint</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
            <div className="h-12 w-full rounded-lg bg-muted" />
            <p className="text-xs font-semibold">Muted</p>
            <p className="text-[10px] text-muted-foreground">Surface Mute</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
            <div className="h-12 w-full rounded-lg bg-destructive" />
            <p className="text-xs font-semibold">Destructive</p>
            <p className="text-[10px] text-muted-foreground">Rose / Red</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
            <div className="h-12 w-full rounded-lg bg-amber-500" />
            <p className="text-xs font-semibold">Warning</p>
            <p className="text-[10px] text-muted-foreground">Amber</p>
          </div>
        </div>

        {/* Typography */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h1 className="text-3xl font-extrabold font-heading">
            Heading 1 — Plus Jakarta Sans (<span className="gradient-heading">Gradient Accent</span>)
          </h1>
          <h2 className="text-2xl font-bold font-heading">Heading 2 — Modern & Clean</h2>
          <h3 className="text-xl font-semibold font-heading">Heading 3 — Campus Marketplace Vibe</h3>
          <p className="text-base text-foreground leading-relaxed font-sans">
            Body Text — Inter font. Designed with crisp letterforms and open apertures for maximum
            legibility across small mobile screens and large desktop viewports.
          </p>
          <p className="text-sm text-muted-foreground leading-normal font-sans">
            Muted caption and secondary details for timestamps, categories, and subtext.
          </p>
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading">2. Buttons</h2>
          <p className="text-sm text-muted-foreground">Variants, sizes, and states.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Primary Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large CTA</Button>
          <Button size="icon" aria-label="Icon button">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* 3. Badges & Status */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading">3. Badges, Price Tags & Status</h2>
          <p className="text-sm text-muted-foreground">CampusCart badges and condition tags.</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="indigo">Indigo Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">StatusBadge:</span>
              <StatusBadge status="AVAILABLE" />
              <StatusBadge status="RESERVED" />
              <StatusBadge status="SOLD" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">PriceTag:</span>
              <PriceTag price={2499} listingType="FOR_SALE" />
              <PriceTag price={null} listingType="FREE" />
              <PriceTag price={null} listingType="EXCHANGE" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Form Controls */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading">4. Form Controls</h2>
          <p className="text-sm text-muted-foreground">
            Accessible inputs, selects, textareas, sliders, checkboxes, and radio buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Standard Input</label>
            <Input placeholder="Enter title or keywords…" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Category Select</label>
            <Select defaultValue="BOOKS">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BOOKS">Books & Textbooks</SelectItem>
                <SelectItem value="ELECTRONICS">Electronics & Gadgets</SelectItem>
                <SelectItem value="FURNITURE">Dorm Furniture</SelectItem>
                <SelectItem value="STATIONERY">Stationery</SelectItem>
                <SelectItem value="OTHER">Other Goods</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Textarea</label>
            <Textarea placeholder="Describe the item condition, reason for selling…" rows={2} />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold">Price Range Slider (₹{sliderValue[0]})</label>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={5000}
              step={100}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold">Checkbox</label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preview-check"
                checked={checkboxChecked}
                onCheckedChange={(c) => setCheckboxChecked(!!c)}
              />
              <label htmlFor="preview-check" className="text-sm font-medium leading-none cursor-pointer">
                Show phone number on listing
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold">Radio Group</label>
            <RadioGroup value={radioValue} onValueChange={setRadioValue} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-1" id="r1" />
                <label htmlFor="r1" className="text-xs">
                  Fixed Price
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-2" id="r2" />
                <label htmlFor="r2" className="text-xs">
                  Negotiable
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* 5. Radix Primitives: Tabs, Tooltip, Popover, Table, Pagination */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading">5. Tabs, Tooltip, Popover & Table</h2>
          <p className="text-sm text-muted-foreground">Interactive overlay and tabular components.</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data-table">Data Table</TabsTrigger>
            <TabsTrigger value="popovers">Popovers & Tooltips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4 rounded-xl border border-border bg-card mt-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Radix tabs with active states, focus rings, and animated content panels.
            </p>
          </TabsContent>

          <TabsContent value="data-table" className="mt-3">
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Active Items</TableHead>
                    <TableHead>Avg. Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Books</TableCell>
                    <TableCell>142</TableCell>
                    <TableCell>₹450</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Electronics</TableCell>
                    <TableCell>89</TableCell>
                    <TableCell>₹3,200</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>

          <TabsContent value="popovers" className="p-4 rounded-xl border border-border bg-card mt-3 flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    Hover for Tooltip
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verified student seller</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Click for Popover
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Campus Pickup</h4>
                  <p className="text-xs text-muted-foreground">
                    Meet at campus cafeteria or student activity center for safe exchange.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </TabsContent>
        </Tabs>
      </section>

      {/* 6. SellerChip, EmptyState & ConfirmDialog */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading">6. Seller Info, Dialog & Empty State</h2>
          <p className="text-sm text-muted-foreground">Shared components for listing and dialogs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl border border-border bg-card space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Seller Chips
            </h3>
            <div className="space-y-3">
              <SellerChip
                name="Rahul Sharma"
                image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                university="IIT Bombay"
              />
              <SellerChip name="Sneha Patel" university="BITS Pilani" />
              <SellerChip name="Kavita Rao" city="Bengaluru" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Confirm Dialog
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Re-usable modal with loading spinner, destructive or standard variants.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              className="w-full rounded-xl"
            >
              Open Delete Dialog
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Delete Listing?"
              description="Are you sure you want to delete this listing? This action cannot be undone."
              confirmLabel="Delete Listing"
              confirmVariant="destructive"
              onConfirm={async () => {
                await new Promise((r) => setTimeout(r, 1000));
                toast.success("Listing deleted successfully");
                setConfirmOpen(false);
              }}
            />
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Empty State
            </h3>
            <EmptyState
              title="No items found"
              description="Try adjusting your filters or search keywords."
              action={{ label: "Reset Filters", href: "/design-preview" }}
            />
          </div>
        </div>
      </section>

      {/* 7. Image Gallery Component */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading">7. Image Gallery & Lightbox</h2>
          <p className="text-sm text-muted-foreground">
            Multi-photo preview with thumbnails, keyboard navigation, and full-screen lightbox.
          </p>
        </div>

        <div className="max-w-2xl">
          <ImageGallery images={sampleGalleryImages} title="MacBook Air M1 Preview" />
        </div>
      </section>

      {/* 8. Listing Cards & Skeleton */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading">8. Listing Cards & Skeletons</h2>
          <p className="text-sm text-muted-foreground">
            Responsive grid showcasing all listing states: Available, Free, Exchange, Reserved, and Sold.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sampleListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onFavoriteToggle={(id) => {
                toast.info(`Toggled favorite on ${id}`);
              }}
            />
          ))}
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Skeleton Loading States
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
