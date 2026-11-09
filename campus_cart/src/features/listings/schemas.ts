import { z } from "zod";

export const listingCategories = [
  "BOOKS",
  "ELECTRONICS",
  "FURNITURE",
  "STATIONERY",
  "OTHER",
] as const;

export const listingConditions = [
  "NEW",
  "LIKE_NEW",
  "GOOD",
  "FAIR",
  "POOR",
] as const;

export const listingTypes = ["FOR_SALE", "FREE", "EXCHANGE"] as const;
export const listingStatuses = ["AVAILABLE", "RESERVED", "SOLD"] as const;

export const listingImageSchema = z.object({
  url: z.string().url("Valid image URL is required"),
  publicId: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const geoPointSchema = z.object({
  type: z.literal("Point").default("Point"),
  coordinates: z
    .tuple([
      z.number().min(-180, "Longitude must be >= -180").max(180, "Longitude must be <= 180"),
      z.number().min(-90, "Latitude must be >= -90").max(90, "Latitude must be <= 90"),
    ])
    .describe("[longitude, latitude]"),
});

/**
 * Base Listing Schema fields before conditional refinement
 */
const baseListingFields = {
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  category: z.enum(listingCategories, {
    message: "Please select a valid category",
  }),
  condition: z.enum(listingConditions, {
    message: "Please select a condition",
  }),
  listingType: z.enum(listingTypes, {
    message: "Please select a listing type",
  }),
  price: z
    .number()
    .nullable()
    .optional(),
  exchangeFor: z
    .string()
    .trim()
    .max(200, "Exchange description cannot exceed 200 characters")
    .nullable()
    .optional(),
  locationText: z
    .string()
    .trim()
    .max(150, "Location cannot exceed 150 characters")
    .nullable()
    .optional(),
  location: geoPointSchema.optional(),
  images: z
    .array(listingImageSchema)
    .min(1, "At least 1 image is required")
    .max(8, "Cannot upload more than 8 images"),
};

/**
 * Validates and normalizes pricing and exchange rules:
 * - FOR_SALE: price required and > 0
 * - FREE: price must be null (or coerced to null)
 * - EXCHANGE: exchangeFor required (min 3 chars), price is optional
 */
function refinePricingAndExchange(
  data: {
    listingType: "FOR_SALE" | "FREE" | "EXCHANGE";
    price?: number | null;
    exchangeFor?: string | null;
  },
  ctx: z.RefinementCtx
) {
  if (data.listingType === "FOR_SALE") {
    if (data.price === undefined || data.price === null || data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Price is required and must be greater than 0 for items for sale",
      });
    }
  } else if (data.listingType === "FREE") {
    if (data.price !== undefined && data.price !== null && data.price > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Price must be empty or null for free items",
      });
    }
  } else if (data.listingType === "EXCHANGE") {
    if (!data.exchangeFor || data.exchangeFor.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exchangeFor"],
        message: "Please describe what item you would like in exchange (at least 3 characters)",
      });
    }
  }
}

/**
 * Create Listing Schema
 */
export const createListingSchema = z
  .object(baseListingFields)
  .superRefine(refinePricingAndExchange)
  .transform((data) => ({
    ...data,
    price: data.listingType === "FREE" ? null : data.price ?? null,
    exchangeFor: data.listingType === "EXCHANGE" ? (data.exchangeFor ?? undefined) : undefined,
    locationText: data.locationText ?? undefined,
  }));

export type CreateListingInput = z.input<typeof createListingSchema>;
export type CreateListingOutput = z.output<typeof createListingSchema>;

/**
 * Update Listing Schema
 */
export const updateListingSchema = z
  .object({
    ...baseListingFields,
  })
  .superRefine(refinePricingAndExchange)
  .transform((data) => ({
    ...data,
    price: data.listingType === "FREE" ? null : data.price ?? null,
    exchangeFor: data.listingType === "EXCHANGE" ? (data.exchangeFor ?? undefined) : undefined,
    locationText: data.locationText ?? undefined,
  }));

export type UpdateListingInput = z.input<typeof updateListingSchema>;
export type UpdateListingOutput = z.output<typeof updateListingSchema>;

/**
 * Schema for updating status only
 */
export const updateListingStatusSchema = z.object({
  status: z.enum(listingStatuses),
});

