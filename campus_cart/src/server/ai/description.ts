import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AiRateLimit } from "@/models/AiRateLimit";
import { getGeminiClient, getGeminiModel, isGeminiConfigured } from "./gemini";

export interface GenerateDescriptionParams {
  title: string;
  category?: string;
  condition?: string;
  listingType?: string;
  keywords?: string;
  userId: string;
}

export interface GenerateDescriptionResult {
  success: boolean;
  description?: string;
  error?: string;
  remaining?: number;
  isFallback?: boolean;
}

const MAX_DESCRIPTIONS_PER_HOUR = 10;

/**
 * Fallback generator when Gemini API key is missing or service is unavailable.
 * Produces a high-quality, friendly 60-120 word student description.
 */
function generateTemplateDescription(params: GenerateDescriptionParams): string {
  const { title, category, condition, listingType, keywords } = params;
  const conditionStr = (condition || "GOOD").replace("_", " ").toLowerCase();
  const typeStr = listingType === "FREE" ? "free giveaway" : listingType === "EXCHANGE" ? "exchange item" : "item for sale";
  const catStr = category || "campus gear";
  const notesStr = keywords?.trim() ? ` Notable details: ${keywords.trim()}.` : "";

  return `Up for grab on campus is this ${conditionStr} condition ${title}, listed as a ${typeStr} in our ${catStr} section.${notesStr} Ideal for university students looking for a reliable, budget-friendly option for the semester without paying retail prices. The item has been well maintained, is fully functional, and ready for immediate use. Available for safe and convenient pickup right on campus near the library, dorms, or student center. Feel free to send an enquiry or reasonable offer!`;
}

/**
 * Generates an AI-crafted description using Google Gemini API with 10/hr rate limiting.
 */
export async function generateListingDescription(
  params: GenerateDescriptionParams
): Promise<GenerateDescriptionResult> {
  const { title, category, condition, listingType, keywords, userId } = params;

  if (!title || title.trim().length < 3) {
    return {
      success: false,
      error: "Please enter a listing title first before generating a description.",
    };
  }

  if (!userId || !Types.ObjectId.isValid(userId)) {
    return {
      success: false,
      error: "You must be signed in to generate an AI description.",
    };
  }

  await connectDB();
  const userObjectId = new Types.ObjectId(userId);

  // 1. Enforce rate limiting: max 10 requests per hour per user
  const recentCount = await AiRateLimit.countDocuments({
    user: userObjectId,
    action: "DESCRIPTION",
  });

  if (recentCount >= MAX_DESCRIPTIONS_PER_HOUR) {
    return {
      success: false,
      error: `Hourly rate limit reached. You can generate up to ${MAX_DESCRIPTIONS_PER_HOUR} descriptions per hour. Please try again later or write your own.`,
      remaining: 0,
    };
  }

  // Record rate limit consumption
  await AiRateLimit.create({
    user: userObjectId,
    action: "DESCRIPTION",
  });

  const remaining = Math.max(0, MAX_DESCRIPTIONS_PER_HOUR - (recentCount + 1));

  // 2. Check if Gemini API is configured
  if (!isGeminiConfigured()) {
    const fallbackDesc = generateTemplateDescription(params);
    return {
      success: true,
      description: fallbackDesc,
      remaining,
      isFallback: true,
    };
  }

  // 3. Call Gemini API
  try {
    const client = getGeminiClient();
    if (!client) {
      throw new Error("Gemini client could not be initialized");
    }

    const modelName = getGeminiModel();
    const prompt = `You are a friendly, helpful student assistant for CampusCart, a university student marketplace.
Write a warm, honest, and engaging description (strictly between 60 and 120 words) for a student listing with the following specifications:
- Item Title: "${title.trim()}"
- Category: "${category || "OTHER"}"
- Condition: "${condition || "GOOD"}"
- Listing Type: "${listingType || "FOR_SALE"}"
- Keywords / Extra Details: "${keywords?.trim() || "Standard student gear"}"

Strict Constraints:
1. Word count must be strictly between 60 and 120 words.
2. Tone: Friendly student-to-student tone.
3. Mention the condition honestly and highlight why it is great for college or dorm life.
4. Suggest easy on-campus meetup (e.g. library, campus center, or hostels).
5. Output ONLY the plain description text. Do NOT include markdown headers, bolding tags, asterisks, quotation marks, or bullet points.`;

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const outputText = response.text?.trim();

    if (!outputText || outputText.length < 20) {
      throw new Error("Received empty or incomplete output from Gemini API");
    }

    // Clean any surrounding quotation marks or formatting
    const cleanedText = outputText.replace(/^["']|["']$/g, "").trim();

    return {
      success: true,
      description: cleanedText,
      remaining,
      isFallback: false,
    };
  } catch (error) {
    console.warn("Gemini API call failed, falling back to smart template:", error);
    const fallbackDesc = generateTemplateDescription(params);
    return {
      success: true,
      description: fallbackDesc,
      remaining,
      isFallback: true,
    };
  }
}
