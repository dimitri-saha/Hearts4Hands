import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

/**
 * Rebuild hourly so posts published from /admin show up without a redeploy.
 * (`revalidatePath` in the publish action covers the pages themselves; the
 * sitemap isn't a route an editor would think to invalidate.)
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/volunteer`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/donate`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/leadership`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/blog/submit`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/signup`, changeFrequency: "yearly", priority: 0.6 },
  ];

  const posts = await getPublishedPosts();
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.updated_at ?? post.published_at ?? undefined,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
