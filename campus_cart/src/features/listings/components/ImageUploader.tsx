"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type UploadedImage = {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
};

interface ImageUploaderProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/**
 * Fast client-side canvas compression down to max 1920px WebP
 * before network upload to ensure snappy transfers.
 */
async function compressImageClientSide(
  file: File,
  maxDimension = 1920,
  quality = 0.85
): Promise<File> {
  if (file.size < 200 * 1024) {
    return file; // Already lightweight
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            return resolve(file);
          }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ".webp"),
            {
              type: "image/webp",
              lastModified: Date.now(),
            }
          );
          resolve(compressed);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 8,
  error,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploadError(null);
      const remainingSlots = maxImages - value.length;

      if (remainingSlots <= 0) {
        setUploadError(`You have reached the maximum limit of ${maxImages} photos.`);
        return;
      }

      const fileArray = Array.from(files).slice(0, remainingSlots);

      if (files.length > remainingSlots) {
        setUploadError(
          `Only ${remainingSlots} photo${remainingSlots > 1 ? "s" : ""} could be added (max ${maxImages}).`
        );
      }

      // Client-side format & size validation
      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (!ALLOWED_TYPES.has(file.type.toLowerCase())) {
          setUploadError(`"${file.name}" is not a supported format. Please use JPEG, PNG, or WebP.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setUploadError(`"${file.name}" exceeds the 10MB file size limit.`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setUploadingCount((prev) => prev + validFiles.length);

      const newlyUploaded: UploadedImage[] = [];

      for (const file of validFiles) {
        try {
          // 1. Client-side compression
          const compressed = await compressImageClientSide(file);

          // 2. Upload to /api/upload
          const formData = new FormData();
          formData.append("file", compressed);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const json = await res.json();

          if (!res.ok || !json.success) {
            throw new Error(json.error || `Upload failed for ${file.name}`);
          }

          newlyUploaded.push({
            url: json.data?.url || json.url,
            publicId: json.data?.publicId || json.publicId,
            width: json.data?.width || json.width,
            height: json.data?.height || json.height,
          });
        } catch (err) {
          console.error("Upload error:", err);
          setUploadError(
            err instanceof Error ? err.message : `Failed to upload ${file.name}`
          );
        } finally {
          setUploadingCount((prev) => Math.max(0, prev - 1));
        }
      }

      if (newlyUploaded.length > 0) {
        onChange([...value, ...newlyUploaded]);
      }
    },
    [maxImages, onChange, value]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    const updated = [...value];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    handleMove(index, 0);
  };

  return (
    <div className="space-y-4">
      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.005]"
            : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/50",
          value.length >= maxImages && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={value.length >= maxImages || uploadingCount > 0}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUploadFiles(e.target.files);
              e.target.value = ""; // Reset input
            }
          }}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-foreground">
          Click to upload or drag and drop photos
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG, or WebP up to 10MB each (max {maxImages} photos)
        </p>

        {uploadingCount > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-primary animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading {uploadingCount} photo{uploadingCount > 1 ? "s" : ""}...</span>
          </div>
        )}
      </div>

      {/* Errors */}
      {(uploadError || error) && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {value.length} of {maxImages} photos added
            </span>
            <span>First photo is the primary cover image</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {value.map((img, index) => {
              const isCover = index === 0;

              return (
                <div
                  key={img.url + index}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-xl border bg-muted/30 transition-all",
                    isCover
                      ? "ring-2 ring-primary border-transparent shadow-sm"
                      : "border-border/60 hover:border-border"
                  )}
                >
                  <Image
                    src={img.url}
                    alt={`Listing photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="indigo" className="text-[10px] gap-1 px-2 py-0.5 shadow-sm">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        Cover
                      </Badge>
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-destructive transition"
                        title="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(index, index - 1);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white hover:bg-white/20 transition"
                            title="Move left"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                        )}
                        {index < value.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(index, index + 1);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white hover:bg-white/20 transition"
                            title="Move right"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetCover(index);
                          }}
                          className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold hover:bg-primary/90 transition"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {value.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>At least 1 photo is required before publishing.</span>
        </div>
      )}
    </div>
  );
}

