"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { User, type IUser } from "@/models/User";
import { registerSchema, updateProfileSchema, type RegisterInput, type UpdateProfileInput } from "./schemas";
import { requireUser } from "@/server/auth";
import { serializeDocument } from "@/lib/serialize";
import { checkAuthRateLimit } from "@/server/security/rateLimiter";
import { sanitizeText } from "@/lib/security";

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Server action to register a new student user.
 */
export async function registerUser(input: RegisterInput): Promise<ActionResponse> {
  try {
    const parsed = registerSchema.safeParse(input);

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Invalid registration information.",
      };
    }

    const { name, email, password } = parsed.data;

    // Rate limit: max 5 registration attempts per 15 minutes per email
    const rateLimit = await checkAuthRateLimit(email);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: rateLimit.error || "Too many registration attempts. Please wait 15 minutes before trying again.",
      };
    }

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return {
        success: false,
        error: "An account with this email address already exists. Please log in.",
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create student user with sanitized text
    await User.create({
      name: sanitizeText(name),
      email: email.toLowerCase().trim(),
      passwordHash,
      authProvider: "CREDENTIALS",
      contactPreference: "IN_APP",
      showPhone: false,
    });

    return {
      success: true,
      message: "Account created successfully! You can now log in.",
    };
  } catch (error) {
    console.error("❌ Registration error:", error);
    return {
      success: false,
      error: "Something went wrong while creating your account. Please try again.",
    };
  }
}

/**
 * Server action to update user profile information.
 */
export async function updateProfile(input: UpdateProfileInput): Promise<ActionResponse> {
  try {
    const user = await requireUser();

    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Invalid profile data.",
      };
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $set: {
          name: sanitizeText(parsed.data.name),
          bio: parsed.data.bio ? sanitizeText(parsed.data.bio) : undefined,
          university: parsed.data.university ? sanitizeText(parsed.data.university) : undefined,
          course: parsed.data.course ? sanitizeText(parsed.data.course) : undefined,
          city: parsed.data.city ? sanitizeText(parsed.data.city) : undefined,
          image: parsed.data.image || undefined,
          phone: parsed.data.phone ? sanitizeText(parsed.data.phone) : undefined,
          showPhone: parsed.data.showPhone,
          contactPreference: parsed.data.contactPreference,
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    revalidatePath("/settings/profile");
    revalidatePath("/", "layout");

    const safeUser = serializeDocument(updatedUser as IUser);

    return {
      success: true,
      message: "Profile updated successfully!",
      data: safeUser,
    };
  } catch (error) {
    console.error("❌ Update profile error:", error);
    return {
      success: false,
      error: "Unable to update profile. Please try again.",
    };
  }
}

