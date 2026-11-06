import Link from "next/link";
import { ShoppingBag, ArrowRight, ShieldCheck, RefreshCw, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <main className="flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <ShoppingBag className="h-8 w-8" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Student-to-Student Marketplace
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Welcome to <span className="text-primary">CampusCart</span>
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Buy, sell, exchange, and donate campus essentials with trusted fellow students. Clean, fast, and secure.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/listings">
            <Button size="lg" className="gap-2">
              Explore Listings
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/listings/new">
            <Button variant="outline" size="lg">
              Sell an Item
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left w-full">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold text-base">Verified Campus Members</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Trade safely within your student community. Meet up at student centers, dorms, or libraries.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <RefreshCw className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold text-base">Sale, Free & Exchange</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Flexible deals: sell for cash, swap study materials, or give away items before moving out.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <BookOpen className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold text-base">Structured Enquiries</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Negotiate price offers with formal accept/reject tracking and zero commission fees.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
