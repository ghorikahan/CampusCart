import Link from "next/link";
import { ShoppingBag, PlusCircle } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserNav } from "./UserNav";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            CampusCart
          </span>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link href="/listings/new">
                <Button size="sm" className="hidden sm:inline-flex items-center gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  <span>Sell Item</span>
                </Button>
              </Link>
              <UserNav user={session.user} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

