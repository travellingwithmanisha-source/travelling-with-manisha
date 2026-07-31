import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listPublishedDestinations } from "@/services/trip.service";

// Regenerate at most once an hour — this route hits the database, and a
// crawler can request it far more often than the destination list
// actually changes. Also means this doesn't need `dynamic =
// "force-dynamic"` like the DB-backed pages elsewhere in the app: ISR
// handles the "don't query on every request" problem more efficiently
// than "query on every request" would.
export const revalidate = 3600;

/**
 * Next.js's file-convention sitemap (app/sitemap.ts -> /sitemap.xml).
 * Includes static marketing routes plus every published destination.
 * Once homestay/tour-package detail pages exist, add them here too —
 * paginate rather than loading every listing into one sitemap file once
 * the catalog is large (Google's limit is 50,000 URLs per sitemap file).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/destinations`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const destinations = await listPublishedDestinations();
  const destinationRoutes: MetadataRoute.Sitemap = destinations.map((destination) => ({
    url: `${siteConfig.url}/destinations/${destination.slug}`,
    lastModified: destination.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...destinationRoutes];
}
