"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Ban,
  PackageCheck,
  MoreVertical,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  bulkUpdateListingsStatus,
  bulkToggleListingsActive,
  bulkDeleteListings,
} from "@/server/dashboard/actions";
import {
  updateListingStatus,
  toggleListingActive,
  deleteListing,
} from "@/features/listings/actions";
import type { DashboardListingRow } from "@/server/dashboard/types";
import type { ListingStatus } from "@/models/Listing";
import { cn } from "@/lib/utils";

interface MyListingsTabProps {
  initialListings: DashboardListingRow[];
  initialStatusFilter?: string;
}

export function MyListingsTab({
  initialListings,
  initialStatusFilter = "ALL",
}: MyListingsTabProps) {
  const router = useRouter();
  const [listings, setListings] = useState(initialListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkActing, setIsBulkActing] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Single delete state
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [isSingleDeleting, setIsSingleDeleting] = useState(false);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Status filter
      if (statusFilter === "AVAILABLE" && (item.status !== "AVAILABLE" || !item.isActive)) {
        return false;
      }
      if (statusFilter === "RESERVED" && item.status !== "RESERVED") {
        return false;
      }
      if (statusFilter === "SOLD" && item.status !== "SOLD") {
        return false;
      }
      if (statusFilter === "INACTIVE" && item.isActive) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory) return false;
      }

      return true;
    });
  }, [listings, statusFilter, searchQuery]);

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredListings.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkStatus = async (status: ListingStatus) => {
    if (!selectedIds.length || isBulkActing) return;
    setIsBulkActing(true);
    try {
      const res = await bulkUpdateListingsStatus(selectedIds, status);
      if (res.success) {
        toast.success(`Updated ${res.modifiedCount} listings to ${status}`);
        setListings((prev) =>
          prev.map((item) =>
            selectedIds.includes(item.id)
              ? {
                  ...item,
                  status,
                  soldAt: status === "SOLD" ? new Date().toISOString() : null,
                }
              : item
          )
        );
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update listings");
      }
    } catch {
      toast.error("Failed to update listings");
    } finally {
      setIsBulkActing(false);
    }
  };

  const handleBulkActive = async (isActive: boolean) => {
    if (!selectedIds.length || isBulkActing) return;
    setIsBulkActing(true);
    try {
      const res = await bulkToggleListingsActive(selectedIds, isActive);
      if (res.success) {
        toast.success(`Updated visibility for ${res.modifiedCount} listings`);
        setListings((prev) =>
          prev.map((item) =>
            selectedIds.includes(item.id) ? { ...item, isActive } : item
          )
        );
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update listings");
      }
    } catch {
      toast.error("Failed to update listings");
    } finally {
      setIsBulkActing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || isBulkActing) return;
    setIsBulkActing(true);
    try {
      const res = await bulkDeleteListings(selectedIds);
      if (res.success) {
        toast.success(`Deleted ${res.modifiedCount} listings`);
        setListings((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setBulkDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete listings");
      }
    } catch {
      toast.error("Failed to delete listings");
    } finally {
      setIsBulkActing(false);
    }
  };

  // Single Actions
  const handleSingleStatus = async (id: string, status: ListingStatus) => {
    try {
      const res = await updateListingStatus(id, status);
      if (res.success) {
        toast.success(`Listing marked as ${status}`);
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSingleToggleActive = async (id: string, currentIsActive: boolean) => {
    try {
      const res = await toggleListingActive(id);
      if (res.success) {
        toast.success(!currentIsActive ? "Listing activated" : "Listing deactivated");
        setListings((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isActive: !currentIsActive } : item
          )
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to toggle visibility");
      }
    } catch {
      toast.error("Failed to toggle visibility");
    }
  };

  const handleSingleDelete = async () => {
    if (!singleDeleteId || isSingleDeleting) return;
    setIsSingleDeleting(true);
    try {
      const res = await deleteListing(singleDeleteId);
      if (res.success) {
        toast.success("Listing deleted");
        setListings((prev) => prev.filter((item) => item.id !== singleDeleteId));
        setSingleDeleteId(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete listing");
      }
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setIsSingleDeleting(false);
    }
  };

  const isAllSelected =
    filteredListings.length > 0 && selectedIds.length === filteredListings.length;

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { label: "All", value: "ALL" },
            { label: "Available", value: "AVAILABLE" },
            { label: "Reserved", value: "RESERVED" },
            { label: "Sold", value: "SOLD" },
            { label: "Inactive", value: "INACTIVE" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my listings..."
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-primary/30 bg-background/95 backdrop-blur shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">
              {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"} selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] text-muted-foreground hover:underline ml-1"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkActing}
              onClick={() => handleBulkStatus("AVAILABLE")}
              className="h-7 text-xs rounded-lg font-medium"
            >
              Available
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkActing}
              onClick={() => handleBulkStatus("RESERVED")}
              className="h-7 text-xs rounded-lg font-medium"
            >
              Reserved
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkActing}
              onClick={() => handleBulkStatus("SOLD")}
              className="h-7 text-xs rounded-lg font-medium"
            >
              Sold
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkActing}
              onClick={() => handleBulkActive(false)}
              className="h-7 text-xs rounded-lg font-medium"
            >
              Deactivate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isBulkActing}
              onClick={() => setBulkDeleteDialogOpen(true)}
              className="h-7 text-xs rounded-lg gap-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      )}

      {/* Listings: Desktop Table / Mobile Cards */}
      {filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-3xl border-dashed border-border/80 bg-card/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <PackageCheck className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-foreground font-heading">
            No listings found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
            {searchQuery
              ? `No items matching "${searchQuery}". Try a different keyword.`
              : "You don't have any listings in this filter category."}
          </p>
          <Link href="/listings/new">
            <Button size="sm" className="rounded-xl gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>Create New Listing</span>
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-border/70 overflow-hidden bg-card">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all listings"
                    />
                  </TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredListings.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const firstImg = item.images[0]?.url;

                  return (
                    <TableRow
                      key={item.id}
                      className={cn(isSelected && "bg-primary/[0.03]")}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(item.id)}
                          aria-label={`Select ${item.title}`}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                          {firstImg ? (
                            <Image
                              src={firstImg}
                              alt={item.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                              None
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[220px]">
                        <Link
                          href={`/listings/${item.id}`}
                          className="font-semibold text-xs text-foreground hover:text-primary transition-colors line-clamp-1 block"
                        >
                          {item.title}
                        </Link>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          {item.category} • {item.condition}
                        </span>
                      </TableCell>

                      <TableCell className="font-semibold text-xs whitespace-nowrap">
                        {item.price !== null
                          ? `₹${item.price.toLocaleString("en-IN")}`
                          : item.listingType === "FREE"
                          ? "FREE"
                          : "EXCHANGE"}
                      </TableCell>

                      <TableCell>
                        {item.status === "AVAILABLE" && (
                          <Badge variant="success" className="text-[10px] px-2 py-0">
                            Available
                          </Badge>
                        )}
                        {item.status === "RESERVED" && (
                          <Badge variant="warning" className="text-[10px] px-2 py-0">
                            Reserved
                          </Badge>
                        )}
                        {item.status === "SOLD" && (
                          <Badge variant="destructive" className="text-[10px] px-2 py-0">
                            Sold
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                            Inactive
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {item.viewCount.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="right" className="w-44 p-1 shadow-lg">
                            <DropdownMenuLabel className="text-[11px]">
                              Listing Actions
                            </DropdownMenuLabel>
                            <Link href={`/listings/${item.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                                <span>View Page</span>
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/listings/${item.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                                <span>Edit Listing</span>
                              </DropdownMenuItem>
                            </Link>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[11px]">
                              Change Status
                            </DropdownMenuLabel>

                            {item.status !== "AVAILABLE" && (
                              <DropdownMenuItem
                                onClick={() => handleSingleStatus(item.id, "AVAILABLE")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-2" />
                                <span>Mark Available</span>
                              </DropdownMenuItem>
                            )}
                            {item.status !== "RESERVED" && (
                              <DropdownMenuItem
                                onClick={() => handleSingleStatus(item.id, "RESERVED")}
                              >
                                <Clock className="h-3.5 w-3.5 text-amber-500 mr-2" />
                                <span>Mark Reserved</span>
                              </DropdownMenuItem>
                            )}
                            {item.status !== "SOLD" && (
                              <DropdownMenuItem
                                onClick={() => handleSingleStatus(item.id, "SOLD")}
                              >
                                <Check className="h-3.5 w-3.5 text-purple-500 mr-2" />
                                <span>Mark Sold</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleSingleToggleActive(item.id, item.isActive)}
                            >
                              <Ban className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                              <span>{item.isActive ? "Deactivate" : "Activate"}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              destructive
                              onClick={() => setSingleDeleteId(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
            {filteredListings.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const firstImg = item.images[0]?.url;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col p-4 rounded-2xl border transition-all bg-card gap-3",
                    isSelected ? "border-primary/50 bg-primary/[0.02]" : "border-border/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(item.id)}
                      className="mt-1"
                      aria-label={`Select ${item.title}`}
                    />

                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0">
                      {firstImg ? (
                        <Image
                          src={firstImg}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/listings/${item.id}`}
                        className="font-bold text-xs text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>

                      <p className="text-xs font-bold text-primary mt-0.5">
                        {item.price !== null
                          ? `₹${item.price.toLocaleString("en-IN")}`
                          : item.listingType === "FREE"
                          ? "FREE"
                          : "EXCHANGE"}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {item.status === "AVAILABLE" && (
                          <Badge variant="success" className="text-[9px] px-1.5 py-0">
                            Available
                          </Badge>
                        )}
                        {item.status === "RESERVED" && (
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                            Reserved
                          </Badge>
                        )}
                        {item.status === "SOLD" && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                            Sold
                          </Badge>
                        )}
                        {!item.isActive && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Quick Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {item.viewCount} views
                    </span>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                        <Link href={`/listings/${item.id}`}>View</Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                        <Link href={`/listings/${item.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSingleDeleteId(item.id)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(singleDeleteId)}
        onOpenChange={(open) => !open && setSingleDeleteId(null)}
        title="Delete Listing"
        description="Are you sure you want to permanently delete this listing? Photos will be removed and any saved favorites will be cleared."
        confirmLabel="Delete Listing"
        confirmVariant="destructive"
        isLoading={isSingleDeleting}
        onConfirm={handleSingleDelete}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title={`Delete ${selectedIds.length} Listings`}
        description="Are you sure you want to permanently delete the selected listings? This action cannot be undone."
        confirmLabel={`Delete ${selectedIds.length} Listings`}
        confirmVariant="destructive"
        isLoading={isBulkActing}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
