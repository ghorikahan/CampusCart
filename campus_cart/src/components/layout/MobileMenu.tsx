"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, Heart, Bell, PlusCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface MobileMenuProps {
  isLoggedIn: boolean;
}

const navLinks = [
  { label: "Browse Listings", href: "/listings" },
  { label: "Free Items", href: "/listings?type=FREE" },
  { label: "Exchange", href: "/listings?type=EXCHANGE" },
  { label: "Books", href: "/listings?category=BOOKS" },
  { label: "Electronics", href: "/listings?category=ELECTRONICS" },
];

export function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden rounded-xl" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <SheetHeader className="px-6 py-4 border-b border-border/60">
          <SheetTitle className="flex items-center gap-2 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-4 w-4" />
            </div>
            CampusCart
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col py-4">
          {isLoggedIn && (
            <>
              <Link
                href="/listings/new"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Sell an Item
              </Link>
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-6 py-3 text-sm hover:bg-muted/50 transition-colors"
              >
                <Heart className="h-4 w-4" />
                Favorites
              </Link>
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-6 py-3 text-sm hover:bg-muted/50 transition-colors"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </Link>
              <Separator className="my-3" />
            </>
          )}

          <p className="px-6 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Browse
          </p>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-6 py-3 text-sm hover:bg-muted/50 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {!isLoggedIn && (
            <>
              <Separator className="my-3" />
              <div className="px-6 flex flex-col gap-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-xl" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

