"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/listings", icon: Search },
  { label: "Sell", href: "/listings/new", icon: PlusCircle, isPrimary: true },
  { label: "Saved", href: "/favorites", icon: Heart },
  { label: "Profile", href: "/settings/profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ label, href, icon: Icon, isPrimary }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-colors",
                isPrimary
                  ? "text-primary-foreground"
                  : isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={label}
            >
              {isPrimary ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

