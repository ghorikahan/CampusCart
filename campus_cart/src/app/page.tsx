import { Suspense } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Laptop,
  Armchair,
  PenTool,
  Package,
  Gift,
  Camera,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/layout/SearchBar";
import { ListingCard } from "@/components/shared/ListingCard";
import { ListingCardSkeleton } from "@/components/shared/ListingCardSkeleton";
import { searchListings } from "@/server/listings/search";
import { getUserFavoriteListingIds } from "@/server/favorites/queries";

export const dynamic = "force-dynamic";

const QUICK_CATEGORY_CHIPS = [
  { label: "📚 Textbooks", href: "/browse?category=BOOKS" },
  { label: "💻 Laptops & Tech", href: "/browse?category=ELECTRONICS" },
  { label: "🪑 Dorm Furniture", href: "/browse?category=FURNITURE" },
  { label: "📐 Stationery", href: "/browse?category=STATIONERY" },
  { label: "🎁 Free Giveaways", href: "/browse?type=FREE" },
  { label: "🔄 Item Exchange", href: "/browse?type=EXCHANGE" },
];

const CATEGORY_CARDS = [
  {
    name: "Books & Textbooks",
    category: "BOOKS",
    icon: BookOpen,
    desc: "Engineering, Medicine, Law, Science & exam prep notes.",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    name: "Electronics & Tech",
    category: "ELECTRONICS",
    icon: Laptop,
    desc: "Laptops, monitors, graphing calculators, cables & chargers.",
    color: "from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400",
  },
  {
    name: "Dorm Furniture",
    category: "FURNITURE",
    icon: Armchair,
    desc: "Desk chairs, mattress pads, study lamps, storage crates.",
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  },
  {
    name: "Stationery & Supplies",
    category: "STATIONERY",
    icon: PenTool,
    desc: "Drawing instruments, lab coats, binders, notebooks.",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Other Goods",
    category: "OTHER",
    icon: Package,
    desc: "Cycles, sports gear, musical instruments, kitchenettes.",
    color: "from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
  },
];

async function FreshListingsSection() {
  const result = await searchListings({
    pageSize: 8,
    sort: "newest",
    includeReserved: true,
  });

  if (result.listings.length === 0) return null;

  const favoriteIds = await getUserFavoriteListingIds(result.listings.map((l) => l.id));
  const favoriteSet = new Set(favoriteIds);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">
            Fresh on Campus
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Recently posted listings from students across your campus.
          </p>
        </div>
        <Link href="/browse">
          <Button variant="ghost" size="sm" className="gap-1 text-xs rounded-xl font-semibold">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {result.listings.map((item) => (
          <ListingCard
            key={item.id}
            listing={item}
            isFavorite={favoriteSet.has(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

async function FreeStuffSection() {
  const result = await searchListings({
    types: ["FREE"],
    pageSize: 4,
    sort: "newest",
  });

  if (result.listings.length === 0) return null;

  const favoriteIds = await getUserFavoriteListingIds(result.listings.map((l) => l.id));
  const favoriteSet = new Set(favoriteIds);

  return (
    <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1 px-2.5 py-0.5 text-xs font-bold">
              <Gift className="h-3.5 w-3.5" />
              Free Giveaways
            </Badge>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ₹0 Campus Donations
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">
            Free Stuff From Moving Students
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Seniors giving away notes, textbooks, and room essentials before graduation.
          </p>
        </div>

        <Link href="/browse?type=FREE">
          <Button variant="outline" size="sm" className="rounded-xl border-emerald-500/30 gap-1.5 text-xs">
            See all free items
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {result.listings.map((item) => (
          <ListingCard
            key={item.id}
            listing={item}
            isFavorite={favoriteSet.has(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-16 sm:space-y-20 pb-16">
      {/* ========================================================
          1. HERO SECTION WITH SEARCH & CATEGORY CHIPS
          ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-foreground shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>The Student-to-Student Marketplace</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight">
              Buy, Sell, or Give Away <br className="hidden sm:inline" />
              <span className="gradient-heading">Second-Hand Campus Goods</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              No shady delivery drivers. No platform commissions. Trade directly with verified
              peers on your university campus.
            </p>
          </div>

          {/* Big Search Bar */}
          <div className="mx-auto max-w-2xl shadow-lg rounded-2xl bg-card p-1.5 border border-border/80">
            <SearchBar className="w-full" autoFocus={false} />
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              Quick links:
            </span>
            {QUICK_CATEGORY_CHIPS.map((chip) => (
              <Link key={chip.label} href={chip.href}>
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 text-xs rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-150 cursor-pointer shadow-xs"
                >
                  {chip.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* ========================================================
            2. FRESH LISTINGS GRID (STREAMED)
            ======================================================== */}
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <FreshListingsSection />
        </Suspense>

        {/* ========================================================
            3. FREE STUFF ROW (STREAMED)
            ======================================================== */}
        <Suspense
          fallback={
            <div className="h-72 w-full rounded-3xl bg-muted/40 animate-pulse" />
          }
        >
          <FreeStuffSection />
        </Suspense>

        {/* ========================================================
            4. BROWSE BY CATEGORY ICON CARDS
            ======================================================== */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">
                Browse by Category
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Explore listings categorized for college academic life.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORY_CARDS.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.category}
                  href={`/browse?category=${cat.category}`}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card card-hover transition-all"
                >
                  <div className="space-y-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-primary">
                    <span>Explore</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            5. HOW IT WORKS 3-STEP SECTION
            ======================================================== */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
              How CampusCart Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Trading campus goods should be effortless, free, and safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Camera className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                Step 1
              </span>
              <h3 className="text-base font-bold">Snap & List in 60s</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Snap photos on your phone, choose a price, set as free giveaway, or propose an
                exchange item.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <MessageSquare className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                Step 2
              </span>
              <h3 className="text-base font-bold">Connect on Campus</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Interested peers submit structured enquiries with offer prices. Accept, decline, or
                coordinate without sharing personal contacts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                Step 3
              </span>
              <h3 className="text-base font-bold">Meet & Hand Off</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Meet at the campus library, cafeteria, or hostel lobby. Inspect the item, settle in
                cash or UPI, and wrap up.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. CTA BANNER
            ======================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-indigo-700 text-primary-foreground p-8 sm:p-12 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="max-w-xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Clearing Out Your Dorm or Finishing Exams?
              </h2>
              <p className="text-xs sm:text-sm text-primary-foreground/80 leading-relaxed">
                Turn your unused textbooks, stationery, and gadgets into cash — or donate them to
                juniors starting their semester.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/listings/new">
                <Button size="lg" variant="secondary" className="rounded-xl font-bold gap-2 shadow-md">
                  <PlusCircle className="h-4 w-4" />
                  List an Item Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
