"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: Array<{ url: string; width?: number; height?: number; publicId?: string }>;
  title: string;
  className?: string;
}

export function ImageGallery({ images, title, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const validImages = images && images.length > 0 ? images : [{ url: "/placeholder.png" }];
  const currentImage = validImages[selectedIndex] || validImages[0];

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  }, [validImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Main Image Display */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30 group">
        <Image
          src={currentImage.url}
          alt={`${title} - view ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
        />

        {/* Expand / Lightbox Trigger */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-background/80 backdrop-blur-md text-foreground shadow-sm transition hover:bg-background hover:scale-105"
          aria-label="View full image"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Navigation arrows (if > 1 image) */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Indicator pill */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md text-[11px] font-medium text-foreground">
              {selectedIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={img.url + idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                selectedIndex === idx
                  ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none text-white sm:rounded-2xl">
          <DialogTitle className="sr-only">{title} preview</DialogTitle>
          <div className="relative flex items-center justify-center min-h-[50vh] max-h-[85vh] w-full p-4">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-[70vh] w-full">
              <Image
                src={currentImage.url}
                alt={title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-xs font-medium text-white/90">
                  {selectedIndex + 1} of {validImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

