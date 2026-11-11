import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getListingById } from "@/server/listings/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListingForm } from "@/features/listings/components/ListingForm";
import { ListingEditActions } from "@/features/listings/components/ListingEditActions";
import { type IListingImage, type ListingCategory, type ListingCondition, type ListingType, type ListingStatus } from "@/models/Listing";

export const metadata: Metadata = {
  title: "Edit Listing | CampusCart",
  description: "Update your marketplace listing details, photos, or pricing.",
};

export const dynamic = "force-dynamic";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const user = await requireUser();

  const listing = (await getListingById(id)) as {
    id: string;
    _id: string;
    title: string;
    description: string;
    category: ListingCategory;
    condition: ListingCondition;
    listingType: ListingType;
    price: number | null;
    exchangeFor?: string;
    status: ListingStatus;
    isActive: boolean;
    locationText?: string;
    location?: { type: "Point"; coordinates: [number, number] };
    images: IListingImage[];
    seller: {
      id?: string;
      _id?: string;
      name?: string;
    };
  } | null;

  if (!listing) {
    notFound();
  }

  // Verify ownership
  const sellerId = listing.seller?.id || listing.seller?._id;
  if (sellerId !== user.id) {
    redirect("/dashboard/listings");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <PageHeader
        title="Edit Listing"
        description={`Update details, photos, or status for "${listing.title}".`}
      />

      {/* Inventory & Visibility Controls */}
      <ListingEditActions
        listingId={listing.id || listing._id}
        initialStatus={listing.status}
        initialIsActive={listing.isActive}
      />

      {/* Edit Form */}
      <ListingForm
        mode="edit"
        listingId={listing.id || listing._id}
        initialData={{
          title: listing.title,
          description: listing.description,
          category: listing.category,
          condition: listing.condition,
          listingType: listing.listingType,
          price: listing.price,
          exchangeFor: listing.exchangeFor,
          locationText: listing.locationText,
          location: listing.location,
          images: listing.images,
          status: listing.status,
          isActive: listing.isActive,
        }}
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

