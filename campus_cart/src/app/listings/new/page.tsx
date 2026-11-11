import { Metadata } from "next";
import { requireUser } from "@/server/auth";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListingForm } from "@/features/listings/components/ListingForm";

export const metadata: Metadata = {
  title: "Sell an Item | CampusCart",
  description: "Create a new listing to sell, donate, or exchange items with fellow students.",
};

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <PageHeader
        title="Sell an Item"
        description="List your textbooks, electronics, or dorm essentials for campus students."
      />

      <ListingForm
        mode="create"
        currentUser={{
          id: user.id,
          name: user.name,
          image: user.image,
          university: user.university,
          city: user.city,
        }}
      />
    </div>
  );
}

