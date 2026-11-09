import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 1600;

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to upload images." },
        { status: 401 }
      );
    }

    // 2. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in form data." },
        { status: 400 }
      );
    }

    // 3. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed formats: JPEG, PNG, WebP.`,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File is too large. Maximum allowed file size is 10MB.",
        },
        { status: 400 }
      );
    }

    // 5. Read array buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 6. Process image with sharp:
    //    - Auto-orient based on EXIF
    //    - Resize to max 1600px width/height preserving aspect ratio
    //    - Compress as WebP at ~80% quality
    const processedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Read metadata of processed buffer
    const metadata = await sharp(processedBuffer).metadata();
    const width = metadata.width ?? 800;
    const height = metadata.height ?? 600;

    // 7. Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(processedBuffer, {
      folder: "campuscart/listings",
      resourceType: "image",
    });

    const responsePayload = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      width,
      height,
      format: "webp",
    };

    return NextResponse.json({
      success: true,
      data: responsePayload,
      ...responsePayload, // Direct access compatibility
    });
  } catch (error) {
    console.error("Image upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process and upload image.",
      },
      { status: 500 }
    );
  }
}

