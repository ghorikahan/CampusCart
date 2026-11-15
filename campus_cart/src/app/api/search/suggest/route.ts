import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/server/listings/search";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (q.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await getSearchSuggestions(q, 5);

    return NextResponse.json(
      { suggestions },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Search suggestion API error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}

