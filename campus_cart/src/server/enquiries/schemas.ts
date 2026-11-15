import { z } from "zod";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const isValidObjectIdFormat = (val: string) => OBJECT_ID_REGEX.test(val);

export const createEnquirySchema = z.object({
  listingId: z
    .string()
    .min(1, "Listing ID is required")
    .refine((val) => isValidObjectIdFormat(val), {
      message: "Invalid listing ID format",
    }),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(1000, "Message cannot exceed 1000 characters"),
  offerPrice: z
    .number()
    .positive("Offer price must be greater than 0")
    .optional()
    .nullable(),
});

export const respondEnquirySchema = z.object({
  enquiryId: z
    .string()
    .min(1, "Enquiry ID is required")
    .refine((val) => isValidObjectIdFormat(val), {
      message: "Invalid enquiry ID format",
    }),
  action: z.enum(["ACCEPT", "REJECT"], {
    message: "Action must be ACCEPT or REJECT",
  }),
  responseMessage: z
    .string()
    .trim()
    .max(1000, "Response note cannot exceed 1000 characters")
    .optional(),
  setReserved: z.boolean().optional(),
  rejectOtherPending: z.boolean().optional(),
});

export const withdrawEnquirySchema = z.object({
  enquiryId: z
    .string()
    .min(1, "Enquiry ID is required")
    .refine((val) => isValidObjectIdFormat(val), {
      message: "Invalid enquiry ID format",
    }),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type RespondEnquiryInput = z.infer<typeof respondEnquirySchema>;
export type WithdrawEnquiryInput = z.infer<typeof withdrawEnquirySchema>;
