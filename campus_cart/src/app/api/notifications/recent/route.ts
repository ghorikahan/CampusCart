import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { serializeDocuments } from "@/lib/serialize";
import type { SerializedNotification } from "@/server/notifications/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ notifications: [] }, { status: 200 });
    }

    await connectDB();
    const docs = await Notification.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return NextResponse.json({
      notifications: serializeDocuments<SerializedNotification>(docs),
    });
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}
