import { ShoppingBag, ArrowRight, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <main className="flex max-w-2xl flex-col items-center text-center">
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

        <p className="mt-4 text-lg text-muted-foreground">
          Buy, sell, exchange, and donate campus essentials with trusted fellow students. Clean, fast, and secure.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-95">
            Explore Listings
            <ArrowRight className="h-4 w-4" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-card-foreground shadow-sm hover:bg-accent">
            Sell an Item
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left w-full">
          <div className="rounded-xl border border-border bg-card p-4">
            <ShieldCheck className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-semibold text-sm">Verified Campus Members</h3>
            <p className="text-xs text-muted-foreground mt-1">Direct peer interactions within your student community.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <RefreshCw className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-semibold text-sm">Sale & Exchange</h3>
            <p className="text-xs text-muted-foreground mt-1">Flexible listing types: buy, trade, or give away items for free.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <ShoppingBag className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-semibold text-sm">Zero Platform Fees</h3>
            <p className="text-xs text-muted-foreground mt-1">Direct student-to-student enquiries with no hidden cuts.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
