import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { requireUser } from "@/server/auth";
import { getNotifications } from "@/server/notifications/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { NotificationsView } from "@/features/notifications/components/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications | CampusCart",
  description:
    "Stay updated on your enquiries, offers, price drops, and campus activity.",
};

export const dynamic = "force-dynamic";

interface NotificationsPageProps {
  searchParams: Promise<{
    filter?: string;
    page?: string;
  }>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  await requireUser();
  const { filter, page } = await searchParams;

  const currentFilter = filter === "unread" ? "unread" : "all";
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  const data = await getNotifications({
    filter: currentFilter,
    page: currentPage,
    pageSize: 15,
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mb-6"
        >
          <Link
            href="/"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3 mr-0.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="font-medium text-foreground truncate">
            Notifications
          </span>
        </nav>

        {/* Page Header */}
        <PageHeader
          title="Notifications"
          description="Stay updated with enquiries on your listings, offers, price alerts, and campus activity."
        />

        {/* Notifications View */}
        <div className="mt-8">
          <NotificationsView
            initialData={data}
            currentFilter={currentFilter}
          />
        </div>
      </div>
    </div>
  );
}

