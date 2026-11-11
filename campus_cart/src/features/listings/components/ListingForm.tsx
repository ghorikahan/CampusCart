"use client";

import { useState, useEffect, useCallback, useTransition, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Sparkles,
  MapPin,
  Loader2,
  RotateCcw,
  Eye,
  CheckCircle2,
  Tag,
  Layers,
  FileText,
  Camera,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { ListingCard, type ListingCardData } from "@/components/shared/ListingCard";
import {
  createListingSchema,
  updateListingSchema,
  type CreateListingInput,
  type CreateListingOutput,
  listingCategories,
  listingConditions,
} from "@/features/listings/schemas";
import { createListing, updateListing } from "@/features/listings/actions";
import { type ListingStatus } from "@/models/Listing";
import { cn } from "@/lib/utils";

const DRAFT_STORAGE_KEY = "campuscart_listing_draft_v1";
const emptySubscribe = () => () => {};
const defaultImages: UploadedImage[] = [];

const categoryLabels: Record<(typeof listingCategories)[number], string> = {
  BOOKS: "Books & Textbooks",
  ELECTRONICS: "Electronics & Gadgets",
  FURNITURE: "Dorm Furniture",
  STATIONERY: "Stationery & Supplies",
  OTHER: "Other Student Goods",
};

const conditionLabels: Record<(typeof listingConditions)[number], string> = {
  NEW: "Brand New (Unopened)",
  LIKE_NEW: "Like New (Barely Used)",
  GOOD: "Good (Minor Wear)",
  FAIR: "Fair (Fully Functional)",
  POOR: "Poor (Visible Wear / Repair Needed)",
};

interface ListingFormProps {
  mode: "create" | "edit";
  listingId?: string;
  initialData?: {
    title?: string;
    description?: string;
    category?: (typeof listingCategories)[number];
    condition?: (typeof listingConditions)[number];
    listingType?: "FOR_SALE" | "FREE" | "EXCHANGE";
    price?: number | null;
    exchangeFor?: string | null;
    locationText?: string | null;
    location?: { type: "Point"; coordinates: [number, number] };
    images?: UploadedImage[];
    status?: ListingStatus;
    isActive?: boolean;
  };
  currentUser: {
    id: string;
    name: string;
    image?: string | null;
    university?: string | null;
    city?: string | null;
  };
}

export function ListingForm({
  mode,
  listingId,
  initialData,
  currentUser,
}: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [draftDismissed, setDraftDismissed] = useState(false);

  // Synchronously read draft from localStorage on client with useSyncExternalStore
  const savedDraftRaw = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return mode === "create" ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
      } catch {
        return null;
      }
    },
    () => null
  );

  const draftInfo = useMemo(() => {
    if (mode !== "create" || !savedDraftRaw || draftDismissed) return null;
    try {
      const parsed = JSON.parse(savedDraftRaw);
      if (parsed?.data && parsed?.timestamp) {
        return {
          data: parsed.data as CreateListingInput,
          timestamp: new Date(parsed.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }
    } catch {
      // Ignore JSON parse errors
    }
    return null;
  }, [mode, savedDraftRaw, draftDismissed]);

  const hasDraft = Boolean(draftInfo);
  const draftTimestamp = draftInfo?.timestamp ?? null;

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CreateListingInput, unknown, CreateListingOutput>({
    resolver: zodResolver(mode === "create" ? createListingSchema : updateListingSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "BOOKS",
      condition: initialData?.condition || "GOOD",
      listingType: initialData?.listingType || "FOR_SALE",
      price: initialData?.price !== undefined ? initialData.price : 500,
      exchangeFor: initialData?.exchangeFor || "",
      locationText: initialData?.locationText || currentUser.university || "",
      location: initialData?.location || undefined,
      images: initialData?.images || [],
    },
  });

  // Watched fields for dynamic UI & live preview
  const watchedTitle = useWatch({ control, name: "title" }) || "";
  const watchedDescription = useWatch({ control, name: "description" }) || "";
  const watchedCategory = useWatch({ control, name: "category" }) || "BOOKS";
  const watchedCondition = useWatch({ control, name: "condition" }) || "GOOD";
  const watchedListingType = useWatch({ control, name: "listingType" }) || "FOR_SALE";
  const watchedPrice = useWatch({ control, name: "price" });
  const watchedExchangeFor = useWatch({ control, name: "exchangeFor" });
  const watchedLocationText = useWatch({ control, name: "locationText" });
  const watchedLocation = useWatch({ control, name: "location" });
  const watchedImagesRaw = useWatch({ control, name: "images" });
  const watchedImages = watchedImagesRaw ?? defaultImages;

  // 1. Unsaved Changes Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  // 2. Debounced auto-save to localStorage
  useEffect(() => {
    if (mode !== "create" || !isDirty) return;

    const timer = setTimeout(() => {
      try {
        const draftPayload = {
          data: {
            title: watchedTitle,
            description: watchedDescription,
            category: watchedCategory,
            condition: watchedCondition,
            listingType: watchedListingType,
            price: watchedPrice,
            exchangeFor: watchedExchangeFor,
            locationText: watchedLocationText,
            location: watchedLocation,
            images: watchedImages,
          },
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      } catch {
        // Ignore quota errors
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    mode,
    isDirty,
    watchedTitle,
    watchedDescription,
    watchedCategory,
    watchedCondition,
    watchedListingType,
    watchedPrice,
    watchedExchangeFor,
    watchedLocationText,
    watchedLocation,
    watchedImages,
  ]);

  // Restore Draft
  const handleRestoreDraft = () => {
    if (draftInfo?.data) {
      reset(draftInfo.data);
      toast.success("Draft restored successfully!");
      setDraftDismissed(true);
    }
  };

  // Discard Draft
  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftDismissed(true);
      toast.info("Draft discarded.");
    } catch {
      // Ignore
    }
  };

  // Geolocation trigger
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { longitude, latitude } = pos.coords;
        setValue(
          "location",
          {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          { shouldDirty: true }
        );
        toast.success(
          `Coordinates pinned (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)!`
        );
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        toast.error("Could not capture location. Please check browser permissions.");
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [setValue]);

  // AI Placeholders
  const handleSuggestCategory = () => {
    toast.info("✨ AI Category Suggestion will analyze your title & photos once connected!", {
      description: "Feature marked for upcoming AI milestone.",
    });
  };

  const handleGenerateDescription = () => {
    toast.info("✨ AI Description Generator will draft specifications from your title!", {
      description: "Feature marked for upcoming AI milestone.",
    });
  };

  // Form Submission
  const onSubmit = async (values: CreateListingOutput) => {
    startTransition(async () => {
      try {
        if (mode === "create") {
          const res = await createListing(values);
          if (!res.success) {
            toast.error(res.error || "Failed to create listing.");
            return;
          }

          toast.success("Listing published successfully!");
          localStorage.removeItem(DRAFT_STORAGE_KEY);

          const newId = (res.data as { id?: string; _id?: string })?.id ||
            (res.data as { id?: string; _id?: string })?._id;

          if (newId) {
            router.push(`/listings/${newId}`);
          } else {
            router.push("/dashboard/listings");
          }
        } else {
          if (!listingId) return;

          const res = await updateListing(listingId, values);
          if (!res.success) {
            toast.error(res.error || "Failed to update listing.");
            return;
          }

          toast.success("Listing updated successfully!");
          router.push(`/listings/${listingId}`);
          router.refresh();
        }
      } catch (err) {
        console.error("Listing form submission error:", err);
        toast.error("An unexpected error occurred while saving.");
      }
    });
  };

  // Constructed live preview object
  const previewListing: ListingCardData = {
    id: listingId || "preview-card",
    title: watchedTitle.trim() || "Item Title Will Appear Here",
    price:
      watchedListingType === "FOR_SALE"
        ? typeof watchedPrice === "number"
          ? watchedPrice
          : 0
        : null,
    category: watchedCategory || "BOOKS",
    condition: watchedCondition || "GOOD",
    listingType: watchedListingType || "FOR_SALE",
    status: initialData?.status || "AVAILABLE",
    isActive: initialData?.isActive ?? true,
    images: watchedImages.length > 0 ? watchedImages : [],
    seller: {
      name: currentUser.name || "Student Seller",
      image: currentUser.image,
      university: currentUser.university,
      city: currentUser.city,
    },
    createdAt: new Date(),
    locationText: watchedLocationText || undefined,
  };

  return (
    <div className="relative">
      {/* Draft Notification Banner */}
      {hasDraft && mode === "create" && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs sm:text-sm text-foreground">
              You have an autosaved draft from{" "}
              <span className="font-semibold text-primary">{draftTimestamp}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleRestoreDraft}
              className="rounded-xl text-xs flex-1 sm:flex-initial"
            >
              Restore Draft
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDiscardDraft}
              className="rounded-xl text-xs text-muted-foreground hover:text-destructive flex-1 sm:flex-initial"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid: Form on Left, Sticky Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-section Form */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ========================================================
                SECTION 1: BASICS
                ======================================================== */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <Tag className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold font-heading">1. Basic Information</h2>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-xs font-semibold">
                    Listing Title <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {watchedTitle?.length || 0}/100
                  </span>
                </div>
                <Input
                  id="title"
                  placeholder="e.g. Mechanical Engineering Drawing Kit, 2nd Edition (Complete)"
                  maxLength={100}
                  {...register("title")}
                  className={cn(errors.title && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category with AI Suggestion Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category" className="text-xs font-semibold">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={handleSuggestCategory}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      <Sparkles className="h-3 w-3" />
                      Suggest category
                    </button>
                  </div>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {listingCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {categoryLabels[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-xs text-destructive font-medium">{errors.category.message}</p>
                  )}
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-xs font-semibold">
                    Condition <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="condition"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {listingConditions.map((cond) => (
                            <SelectItem key={cond} value={cond}>
                              {conditionLabels[cond]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.condition && (
                    <p className="text-xs text-destructive font-medium">{errors.condition.message}</p>
                  )}
                </div>
              </div>

              {/* Listing Type Segmented Control */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">
                  Listing Type <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="listingType"
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-muted/50 border border-border/60">
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange("FOR_SALE");
                          if (watchedPrice === null || watchedPrice === 0) {
                            setValue("price", 500, { shouldValidate: true });
                          }
                        }}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                          field.value === "FOR_SALE"
                            ? "bg-card text-foreground shadow-xs border border-border/80"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        For Sale (₹)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          field.onChange("FREE");
                          setValue("price", null, { shouldValidate: true });
                        }}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                          field.value === "FREE"
                            ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Free / Donate
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          field.onChange("EXCHANGE");
                        }}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                          field.value === "EXCHANGE"
                            ? "bg-card text-primary shadow-xs border border-border/80"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Exchange 🔄
                      </button>
                    </div>
                  )}
                />
              </div>

              {/* Conditional Price / Exchange Inputs */}
              {watchedListingType === "FOR_SALE" && (
                <div className="space-y-2 p-4 rounded-xl bg-muted/20 border border-border/60">
                  <Label htmlFor="price" className="text-xs font-semibold">
                    Price (INR) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min={1}
                      max={999999}
                      placeholder="e.g. 450"
                      className="pl-8 text-base font-semibold"
                      value={watchedPrice ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value);
                        setValue("price", val, { shouldValidate: true, shouldDirty: true });
                      }}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-xs text-destructive font-medium">{errors.price.message}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Set a fair campus price. Negotiation can be agreed via direct enquiry.
                  </p>
                </div>
              )}

              {watchedListingType === "FREE" && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Giving this item away for free to fellow students! Price will automatically be
                    marked as <span className="font-bold">FREE</span>.
                  </span>
                </div>
              )}

              {watchedListingType === "EXCHANGE" && (
                <div className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Label htmlFor="exchangeFor" className="text-xs font-semibold">
                    What would you like in exchange? <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="exchangeFor"
                    placeholder="e.g. TI-84 Calculator, Dorm Desk Lamp, or Physics Notes"
                    {...register("exchangeFor")}
                  />
                  {errors.exchangeFor && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.exchangeFor.message}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Specify items or book titles you are willing to trade for.
                  </p>
                </div>
              )}
            </div>

            {/* ========================================================
                SECTION 2: DETAILS & LOCATION
                ======================================================== */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold font-heading">2. Item Description & Location</h2>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-xs font-semibold">
                    Detailed Description <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      <Sparkles className="h-3 w-3" />
                      Generate description with AI
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      {watchedDescription?.length || 0}/2000
                    </span>
                  </div>
                </div>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Describe your item in detail: edition, condition, included accessories, reasons for selling, and pickup preferences (min 20 characters)..."
                  maxLength={2000}
                  {...register("description")}
                  className={cn(
                    "resize-y",
                    errors.description && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.description && (
                  <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
                )}
              </div>

              {/* Location Text & Current Location Button */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="locationText" className="text-xs font-semibold">
                    Campus Location / Meeting Spot
                  </Label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    {isLocating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    Use my current location
                  </button>
                </div>
                <Input
                  id="locationText"
                  placeholder="e.g. Hostel 14, Main Student Center, or North Library"
                  maxLength={150}
                  {...register("locationText")}
                />
                {watchedLocation?.coordinates && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Coordinates attached for map radius search (
                      {watchedLocation.coordinates[1].toFixed(3)}°N,{" "}
                      {watchedLocation.coordinates[0].toFixed(3)}°E)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================
                SECTION 3: PHOTOS
                ======================================================== */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <Camera className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold font-heading">3. Photos</h2>
              </div>

              <Controller
                control={control}
                name="images"
                render={({ field }) => (
                  <ImageUploader
                    value={field.value || []}
                    onChange={(imgs) => field.onChange(imgs)}
                    maxImages={8}
                    error={errors.images?.message}
                  />
                )}
              />
            </div>

            {/* ========================================================
                SECTION 4: PUBLISH CTA
                ======================================================== */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>
                  {mode === "create"
                    ? "Listing will be immediately discoverable on campus search."
                    : "Modifications will update your active listing in real-time."}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Preview Trigger Button */}
                <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="lg:hidden rounded-xl text-xs gap-1.5 flex-1 sm:flex-initial"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle className="text-base font-heading">
                        Live Listing Card Preview
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                      <ListingCard listing={previewListing} />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isPending || isSubmitting}
                  className="rounded-xl px-8 flex-1 sm:flex-initial"
                >
                  {isPending || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>{mode === "create" ? "Publishing..." : "Saving..."}</span>
                    </>
                  ) : (
                    <span>{mode === "create" ? "Publish Listing" : "Save Changes"}</span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Desktop Sticky Summary & Live Preview */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold tracking-wider uppercase text-foreground">
                    Marketplace Live Preview
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Realtime
                </Badge>
              </div>

              {/* Rendered Live ListingCard */}
              <div className="w-full">
                <ListingCard listing={previewListing} />
              </div>

              {/* Completeness Checklist */}
              <div className="space-y-2 pt-3 border-t border-border/60 text-xs">
                <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Listing Checklist
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {watchedTitle?.length >= 5 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
                    )}
                    <span className={watchedTitle?.length >= 5 ? "text-foreground" : "text-muted-foreground"}>
                      Title (5+ characters)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {watchedDescription?.length >= 20 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
                    )}
                    <span className={watchedDescription?.length >= 20 ? "text-foreground" : "text-muted-foreground"}>
                      Description (20+ characters)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {watchedImages?.length >= 1 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
                    )}
                    <span className={watchedImages?.length >= 1 ? "text-foreground" : "text-muted-foreground"}>
                      At least 1 photo uploaded
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(watchedListingType === "FOR_SALE" && watchedPrice && watchedPrice > 0) ||
                    watchedListingType === "FREE" ||
                    (watchedListingType === "EXCHANGE" && (watchedExchangeFor?.length ?? 0) >= 3) ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
                    )}
                    <span className="text-foreground">Pricing / Exchange details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
