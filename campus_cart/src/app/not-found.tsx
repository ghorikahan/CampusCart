import Link from "next/link";
import { SearchX, Home, ShoppingBag, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-border/70 bg-card shadow-xs">
        {/* 404 Badge & Graphic */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5">
          <SearchX className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
            Page or item not found
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The listing, seller profile, or page you were looking for doesn&apos;t exist, has been removed, or was marked sold by the seller.
          </p>
        </div>

        {/* Quick Recovery Navigation */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
          <Button
            asChild
            variant="default"
            className="rounded-xl gap-2 font-semibold text-xs"
          >
            <Link href="/browse">
              <ShoppingBag className="h-3.5 w-3.5" />
              Browse Listings
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-xl gap-2 font-semibold text-xs border-border/80"
          >
            <Link href="/listings/new">
              <PlusCircle className="h-3.5 w-3.5" />
              Post a Listing
            </Link>
          </Button>
        </div>

        <div className="pt-2 border-t border-border/60">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <Home className="h-3 w-3" />
            Back to CampusCart Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
