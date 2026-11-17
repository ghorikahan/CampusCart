/**
 * Helper to generate lightweight SVG blur placeholders for next/image.
 */
export function getBlurDataURL(bgColor: string = "#e2e8f0"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
    <filter id="b" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="1" />
    </filter>
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <rect width="100%" height="100%" fill="#94a3b8" opacity="0.3" filter="url(#b)"/>
  </svg>`;

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

export const DEFAULT_BLUR_DATA_URL = getBlurDataURL("#f1f5f9");

/**
 * Optimizes Cloudinary or Unsplash image URLs with on-the-fly resizing and compression.
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url) return "";
  const { width = 800, quality = 80 } = options;

  // Cloudinary URL optimization: inject f_auto,q_auto,w_{width}
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const parts = url.split("/upload/");
    const transformations = `f_auto,q_${quality},w_${width},c_limit`;
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
  }

  // Unsplash URL optimization
  if (url.includes("images.unsplash.com")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}auto=format&fit=crop&w=${width}&q=${quality}`;
  }

  return url;
}
