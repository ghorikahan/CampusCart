import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

export function isGeminiConfigured(): boolean {
  const key = env.GEMINI_API_KEY?.trim() || "";
  return Boolean(key && !key.startsWith("your-") && key !== "mock" && key.length > 10);
}

export function getGeminiModel(): string {
  return env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
}

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return cachedClient;
}
