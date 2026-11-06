import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User, type IUser } from "@/models/User";
import { serializeDocument } from "@/lib/serialize";

export interface CurrentUser extends Omit<IUser, "_id" | "createdAt" | "updatedAt"> {
  id: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Returns the currently authenticated user document as a plain JSON-safe object,
 * or null if no active session or user not found.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    await connectDB();
    const userDoc = await User.findById(session.user.id).lean();

    if (!userDoc) {
      return null;
    }

    // Exclude passwordHash from returned client object for security
    const userObj = { ...(userDoc as IUser & { passwordHash?: string }) };
    delete userObj.passwordHash;

    return serializeDocument<CurrentUser>(userObj);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as { digest: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Error retrieving current user:", error);
    return null;
  }
}

/**
 * Ensures the user is authenticated. If not, automatically redirects to /login.
 * Returns the authenticated user plain object.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
