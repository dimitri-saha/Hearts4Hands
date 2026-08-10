import "server-only";

import { cache } from "react";

import { getPublicClient } from "./supabase/server";
import type { Post } from "./supabase/types";
import { starterPosts } from "@/content/starter-posts";

/**
 * Reads for the public blog.
 *
 * Every function degrades to `starterPosts` when Supabase is unconfigured or
 * the `posts` table is still empty, so the Stories page is never blank —
 * see `src/content/starter-posts.ts`.
 */

const publishedStarters = [...starterPosts].sort(
  (a, b) => Date.parse(b.published_at ?? "") - Date.parse(a.published_at ?? ""),
);

/** `cache` dedupes within a single render pass (list page + metadata + sitemap). */
export const getPublishedPosts = cache(async (): Promise<Post[]> => {
  const supabase = getPublicClient();
  if (!supabase) return publishedStarters;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[posts] failed to load published posts:", error.message);
    return publishedStarters;
  }
  return data?.length ? data : publishedStarters;
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.slug === slug) ?? null;
});

export async function getFeaturedPost(): Promise<Post | null> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.featured) ?? posts[0] ?? null;
}

export async function getRecentPosts(limit = 3): Promise<Post[]> {
  return (await getPublishedPosts()).slice(0, limit);
}

/** Same-category posts first, then anything else, to fill the "keep reading" row. */
export async function getRelatedPosts(post: Post, limit = 2): Promise<Post[]> {
  const posts = (await getPublishedPosts()).filter((p) => p.slug !== post.slug);
  const sameCategory = posts.filter((p) => p.category === post.category);
  const rest = posts.filter((p) => p.category !== post.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getPostsByCategory(category: string | null): Promise<Post[]> {
  const posts = await getPublishedPosts();
  if (!category) return posts;
  return posts.filter((p) => p.category === category);
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const posts = await getPublishedPosts();
  return posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
}
