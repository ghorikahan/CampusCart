import Link from "next/link";
import { ShoppingBag, PlusCircle, Heart, Bell } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserNav } from "./UserNav";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 transition hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <span className="hidden text-lg font-bold tracking-tight font-heading sm:block">
            CampusCart
          </span>
        </Link>

        {/* Central search — hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <SearchBar className="w-full" />
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {session?.user ? (
            <>
              {/* Favorites */}
              <Link href="/favorites" aria-label="Favorites">
                <Button variant="ghost" size="icon" className="relative rounded-xl">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              {/* Notifications */}
              <Link href="/notifications" aria-label="Notifications">
                <Button variant="ghost" size="icon" className="relative rounded-xl">
                  <Bell className="h-5 w-5" />
                  {/* Unread badge — placeholder */}
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                </Button>
              </Link>

              {/* Sell CTA */}
              <Link href="/listings/new" className="hidden sm:block">
                <Button size="sm" className="gap-1.5 rounded-xl">
                  <PlusCircle className="h-4 w-4" />
                  Sell
                </Button>
              </Link>

              <UserNav user={session.user} />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="rounded-xl">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-xl">Get Started</Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <MobileMenu isLoggedIn={!!session?.user} />
        </div>
      </div>

      {/* Mobile search row */}
      <div className="md:hidden border-t border-border/40 px-4 py-2">
        <SearchBar />
      </div>
    </header>
  );
}
