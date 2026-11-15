import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    await connectDB();
    const count = await Notification.countDocuments({
      user: session.user.id,
      readAt: null,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

