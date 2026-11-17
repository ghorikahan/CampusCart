import { type ListingCategory } from "@/models/Listing";
import { getGeminiClient, getGeminiModel, isGeminiConfigured } from "./gemini";

export interface SuggestCategoryParams {
  title: string;
  description?: string;
}

export interface SuggestCategoryResult {
  success: boolean;
  category: ListingCategory;
  confidence: number; // 0 to 1
  reason?: string;
  error?: string;
  isFallback?: boolean;
}

const CATEGORY_KEYWORDS: Record<ListingCategory, string[]> = {
  BOOKS: [
    "book", "books", "textbook", "textbooks", "novel", "novels", "edition", "volume",
    "isbn", "author", "syllabus", "notes", "calculus", "algebra", "geometry",
    "physics", "chemistry", "biology", "organic", "anatomy", "physiology", "pathology",
    "medicine", "law", "history", "literature", "study guide", "paperback", "hardcover",
    "ncert", "mcqs", "solution", "solutions", "guide", "handbook", "reader",
  ],
  ELECTRONICS: [
    "laptop", "macbook", "computer", "pc", "tablet", "ipad", "phone", "iphone",
    "android", "samsung", "oneplus", "pixel", "charger", "cable", "usb", "type-c",
    "lightning", "power bank", "battery", "monitor", "screen", "keyboard", "mouse",
    "headphones", "earphones", "airpods", "earbuds", "headset", "speaker", "bluetooth",
    "calculator", "ti-84", "casio", "gpu", "cpu", "ssd", "ram", "hdmi", "adapter",
    "smartwatch", "watch", "webcam", "camera", "microphone", "mic", "kindle", "tripod",
  ],
  FURNITURE: [
    "chair", "desk", "table", "lamp", "study lamp", "bed", "mattress", "stool",
    "bean bag", "shelf", "bookshelf", "drawer", "wardrobe", "nightstand", "mirror",
    "organizer", "clothes rack", "cushion", "sofa", "rug", "curtain", "hanger",
  ],
  STATIONERY: [
    "notebook", "register", "binder", "folder", "diary", "pen", "pencil", "eraser",
    "sharpener", "marker", "highlighter", "stapler", "staples", "ruler", "scale",
    "compass", "glue", "tape", "scissors", "whiteout", "sticky notes", "post-it",
    "art paper", "sketchbook", "drawing sheet", "drafting board", "pouches",
  ],
  OTHER: [
    "cycle", "bicycle", "bike", "helmet", "skateboard", "backpack", "bag", "tote",
    "luggage", "gym", "dumbbell", "badminton", "racket", "umbrella", "raincoat",
    "lab coat", "safety goggles", "kettle", "electric kettle", "iron", "bottle",
    "water bottle", "flask", "induction", "cooker", "utensil", "mug", "blanket",
    "quilt", "pillow", "guitar", "instrument", "clothes", "hoodie", "jacket",
  ],
};

const VALID_CATEGORIES: ListingCategory[] = [
  "BOOKS",
  "ELECTRONICS",
  "FURNITURE",
  "STATIONERY",
  "OTHER",
];

/**
 * Keyword-based category classification engine.
 * Computes weighted frequency scores across title (weight 3x) and description (weight 1x).
 */
export function classifyCategoryByKeywords(
  title: string,
  description: string = ""
): { category: ListingCategory; confidence: number; reason: string } {
  const cleanTitle = title.toLowerCase();
  const cleanDesc = description.toLowerCase();

  const titleWords = new Set(cleanTitle.split(/[^a-z0-9_-]+/).filter((w) => w.length > 2));
  const descWords = new Set(cleanDesc.split(/[^a-z0-9_-]+/).filter((w) => w.length > 2));

  let bestCategory: ListingCategory = "OTHER";
  let maxScore = 0;
  let matchedKeyword = "";

  for (const cat of VALID_CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[cat];
    let score = 0;
    let localMatched = "";

    for (const kw of keywords) {
      if (cleanTitle.includes(kw) || titleWords.has(kw)) {
        score += 3;
        if (!localMatched) localMatched = kw;
      } else if (cleanDesc.includes(kw) || descWords.has(kw)) {
        score += 1;
        if (!localMatched) localMatched = kw;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
      matchedKeyword = localMatched;
    }
  }

  if (maxScore === 0) {
    return {
      category: "OTHER",
      confidence: 0.5,
      reason: "No strong category keywords detected, defaulted to Other Student Goods.",
    };
  }

  // Map matching score to confidence in range [0.70, 0.98]
  const rawConfidence = 0.65 + Math.min(0.33, (maxScore * 0.08));
  const confidence = Math.round(rawConfidence * 100) / 100;

  return {
    category: bestCategory,
    confidence,
    reason: `Matched keyword "${matchedKeyword}" in title/description.`,
  };
}

/**
 * Suggests a listing category using Gemini AI, with automatic keyword-based fallback.
 */
export async function suggestListingCategory(
  params: SuggestCategoryParams
): Promise<SuggestCategoryResult> {
  const { title, description = "" } = params;

  if (!title || title.trim().length < 2) {
    return {
      success: false,
      category: "OTHER",
      confidence: 0.5,
      error: "Please enter a title to suggest a category.",
      isFallback: true,
    };
  }

  // 1. If Gemini is not configured, use keyword engine immediately
  if (!isGeminiConfigured()) {
    const fallback = classifyCategoryByKeywords(title, description);
    return {
      success: true,
      category: fallback.category,
      confidence: fallback.confidence,
      reason: fallback.reason,
      isFallback: true,
    };
  }

  // 2. Call Gemini API
  try {
    const client = getGeminiClient();
    if (!client) {
      throw new Error("Gemini client is unavailable");
    }

    const modelName = getGeminiModel();
    const prompt = `Classify this university student marketplace listing into EXACTLY ONE of these categories:
- BOOKS
- ELECTRONICS
- FURNITURE
- STATIONERY
- OTHER

Listing details:
Title: "${title.trim()}"
Description: "${description.trim()}"

Return ONLY a valid JSON object without any backticks, markdown formatting, or preamble:
{"category":"BOOKS|ELECTRONICS|FURNITURE|STATIONERY|OTHER","confidence":0.95,"reason":"Brief one-sentence reason"}`;

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const outputText = response.text?.trim() || "";

    // Parse JSON
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        category?: string;
        confidence?: number;
        reason?: string;
      };

      const upperCat = String(parsed.category || "").toUpperCase() as ListingCategory;
      if (VALID_CATEGORIES.includes(upperCat)) {
        const conf = typeof parsed.confidence === "number" ? Math.min(1, Math.max(0.5, parsed.confidence)) : 0.85;
        return {
          success: true,
          category: upperCat,
          confidence: Math.round(conf * 100) / 100,
          reason: parsed.reason || `Identified as ${upperCat} based on item specifications.`,
          isFallback: false,
        };
      }
    }

    throw new Error("Invalid format from Gemini response");
  } catch (error) {
    console.warn("Gemini category suggestion failed, using keyword classifier:", error);
    const fallback = classifyCategoryByKeywords(title, description);
    return {
      success: true,
      category: fallback.category,
      confidence: fallback.confidence,
      reason: fallback.reason,
      isFallback: true,
    };
  }
}
