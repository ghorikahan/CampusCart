import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { requireUser } from "@/server/auth";
import { getReceivedEnquiries, getSentEnquiries } from "@/server/enquiries/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { EnquiriesView } from "@/features/enquiries/components/EnquiriesView";
import { type EnquiryCardData } from "@/features/enquiries/components/EnquiryCard";

export const metadata: Metadata = {
  title: "Enquiries & Offers | CampusCart",
  description: "Track incoming offers on your campus listings and manage your sent enquiries.",
};

export const dynamic = "force-dynamic";

interface EnquiriesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function EnquiriesPage({ searchParams }: EnquiriesPageProps) {
  await requireUser();
  const { tab } = await searchParams;

  const defaultTab = tab === "sent" ? "sent" : "received";

  const [receivedRes, sentRes] = await Promise.all([
    getReceivedEnquiries({ pageSize: 50 }),
    getSentEnquiries({ pageSize: 50 }),
  ]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mb-6"
        >
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3 mr-0.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="font-medium text-foreground truncate">
            Enquiries & Offers
          </span>
        </nav>

        <PageHeader
          title="Enquiries & Offers"
          description="Manage offers received on your campus listings and follow up on enquiries you have sent."
          className="mb-8"
        />

        <EnquiriesView
          initialReceived={receivedRes.enquiries as unknown as EnquiryCardData[]}
          initialSent={sentRes.enquiries as unknown as EnquiryCardData[]}
          defaultTab={defaultTab}
        />
      </div>
    </div>
  );
}
