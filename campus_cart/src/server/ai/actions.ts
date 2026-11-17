"use server";

import { getCurrentUser } from "@/server/auth";
import { generateListingDescription, type GenerateDescriptionResult } from "./description";
import { suggestListingCategory, type SuggestCategoryResult } from "./category";

/**
 * Server Action: Generates a friendly 60-120 word description using Gemini AI.
 * Rate limited to 10 generations per hour per authenticated user.
 */
export async function generateDescriptionAction(params: {
  title: string;
  category?: string;
  condition?: string;
  listingType?: string;
  keywords?: string;
}): Promise<GenerateDescriptionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return {
        success: false,
        error: "You must be signed in to generate an AI description.",
      };
    }

    return await generateListingDescription({
      ...params,
      userId: user.id,
    });
  } catch (error) {
    console.error("generateDescriptionAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate description.",
    };
  }
}

/**
 * Server Action: Suggests a category from title & description with confidence rating.
 * Accessible to authenticated users and visitors during listing draft creation.
 */
export async function suggestCategoryAction(params: {
  title: string;
  description?: string;
}): Promise<SuggestCategoryResult> {
  try {
    return await suggestListingCategory(params);
  } catch (error) {
    console.error("suggestCategoryAction error:", error);
    return {
      success: false,
      category: "OTHER",
      confidence: 0.5,
      error: error instanceof Error ? error.message : "Failed to suggest category.",
      isFallback: true,
    };
  }
}
