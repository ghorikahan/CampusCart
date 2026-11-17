import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Listing } from "@/models/Listing";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();

  // 1. Static Core Public Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // 2. Dynamic Public Listing Routes
  let dynamicListings: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const recentListings = await Listing.find(
      { isActive: true, status: "AVAILABLE" },
      "_id updatedAt"
    )
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    dynamicListings = recentListings.map((item) => ({
      url: `${baseUrl}/listings/${item._id.toString()}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch (error) {
    console.warn("Could not generate dynamic listing sitemap entries:", error);
  }

  return [...staticRoutes, ...dynamicListings];
}
