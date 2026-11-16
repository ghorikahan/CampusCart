import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getDashboardData } from "@/server/dashboard/queries";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export const metadata: Metadata = {
  title: "Seller Dashboard | CampusCart",
  description: "Monitor your listings, pending enquiries, view analytics, and track completed sales.",
};

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    tab?: string;
    status?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { tab, status } = await searchParams;

  const validTabs = ["listings", "enquiries", "sent", "sold"] as const;
  const activeTab = (validTabs.includes(tab as typeof validTabs[number])
    ? tab
    : "listings") as "listings" | "enquiries" | "sent" | "sold";

  const data = await getDashboardData();
  if (!data) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <DashboardView
          data={data}
          activeTab={activeTab}
          initialStatusFilter={status}
        />
      </div>
    </div>
  );
}

