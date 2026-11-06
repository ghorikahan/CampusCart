import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "University or personal email is required")
      .email("Please enter a valid email address")
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password cannot exceed 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  university: z
    .string()
    .max(150, "University cannot exceed 150 characters")
    .optional(),
  course: z.string().max(150, "Course cannot exceed 150 characters").optional(),
  city: z.string().max(100, "City cannot exceed 100 characters").optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number cannot exceed 20 characters").optional(),
  showPhone: z.boolean(),
  contactPreference: z.enum(["IN_APP", "EMAIL", "PHONE", "WHATSAPP"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
