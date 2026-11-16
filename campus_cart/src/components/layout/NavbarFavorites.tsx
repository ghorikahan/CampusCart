"use client";

import Link from "next/link";
import useSWR from "swr";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NavbarFavoritesProps {
  initialCount?: number;
}

export function NavbarFavorites({ initialCount = 0 }: NavbarFavoritesProps) {
  const { data } = useSWR<{ count: number }>("/api/favorites/count", fetcher, {
    fallbackData: { count: initialCount },
    refreshInterval: 60000,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });

  const count = data?.count ?? initialCount;

  return (
    <Link href="/favorites" aria-label={`Saved Items (${count})`}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-xl transition-colors hover:text-rose-500"
      >
        <Heart className="h-5 w-5" />
        {count > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm",
              "animate-in zoom-in-75 duration-200"
            )}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>
    </Link>
  );
}

