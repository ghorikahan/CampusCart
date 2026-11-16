import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Favorite } from "@/models/Favorite";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    await connectDB();
    const count = await Favorite.countDocuments({
      user: session.user.id,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching favorites count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

