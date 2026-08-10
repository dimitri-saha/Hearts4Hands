import "server-only";

import { headers } from "next/headers";

/**
 * Best-effort, in-memory rate limiting for public form submissions.
 *
 * On serverless this is per-instance, so it throttles a single abusive client
 * rather than guaranteeing a global cap — which, combined with the honeypot
 * and minimum fill time, is proportionate for a small nonprofit site. If spam
 * ever becomes a real problem, swap the map for Upstash Redis; the call sites
 * don't change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_ENTRIES = 5000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 10 * 60 * 1000 } = {},
): RateLimitResult {
  const now = Date.now();

  // Opportunistic sweep so the map can't grow without bound.
  if (buckets.size > MAX_ENTRIES) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    if (buckets.size > MAX_ENTRIES) buckets.clear();
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

/** Caller IP, as best as the platform reports it. Falls back to a shared bucket. */
export async function clientKey(scope: string) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown";
  return `${scope}:${ip}`;
}
