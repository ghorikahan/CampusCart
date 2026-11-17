"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log unexpected client error to monitoring / console
    console.error("Global client error captured:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-destructive/20 bg-card shadow-xs">
        {/* Warning Icon Banner */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We encountered an unexpected error while loading this page. Our campus technical team has been notified.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-muted-foreground/60 pt-1">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
          <Button
            type="button"
            onClick={reset}
            className="rounded-xl gap-2 font-semibold text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl gap-2 font-semibold text-xs border-border/80"
          >
            <Link href="/browse">
              <ShoppingBag className="h-3.5 w-3.5" />
              Browse Market
            </Link>
          </Button>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <Home className="h-3 w-3" />
            Return to CampusCart Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
