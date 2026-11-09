import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "@/lib/env";

const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Uploads an image buffer directly to Cloudinary using upload_stream.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: "image" | "raw" | "auto";
  } = {}
): Promise<UploadResult> {
  const folder = options.folder ?? "campuscart/listings";

  if (!isConfigured) {
    // In dev / test environments without Cloudinary keys, generate a consistent mock URL
    console.warn("⚠️ Cloudinary credentials missing. Using placeholder URL for upload.");
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      url: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80`,
      publicId: `${folder}/${mockId}`,
      width: 1200,
      height: 800,
      format: "webp",
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: options.resourceType ?? "image",
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed with empty result"));
        }
        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary by its publicId.
 */
export async function deleteFromCloudinary(publicId?: string): Promise<boolean> {
  if (!publicId || publicId.startsWith("mock_") || publicId.includes("/mock_")) {
    return true;
  }

  if (!isConfigured) {
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return result.result === "ok";
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset (${publicId}):`, error);
    return false;
  }
}

export { cloudinary };

