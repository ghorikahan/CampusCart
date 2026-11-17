import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/browse", "/listings", "/sellers"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/enquiries/",
          "/notifications/",
          "/favorites/",
          "/design-preview/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
