import { type Metadata } from "next";
import { requireUser } from "@/server/auth";
import { ProfileForm } from "@/features/auth/components/ProfileForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile Settings | CampusCart",
  description: "Manage your CampusCart student profile, contact preferences, and public visibility.",
};

export default async function ProfileSettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your student identity, contact preferences, and campus profile.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}

