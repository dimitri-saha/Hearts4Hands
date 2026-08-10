import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  getServiceRoleKey,
  isSupabaseConfigured,
  isSupabaseWritable,
} from "./env";

export type Client = SupabaseClient<Database>;

/**
 * Anonymous read client for public data (published posts, site stats).
 * Returns null when Supabase isn't configured so callers fall back to
 * static content.
 */
export function getPublicClient(): Client | null {
  if (!isSupabaseConfigured) return null;
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client. Bypasses RLS — never expose this to the browser and
 * never call it from a route that hasn't validated its input or the caller's
 * admin session.
 */
export function getServiceClient(): Client | null {
  if (!isSupabaseWritable) return null;
  return createClient<Database>(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "hearts4hands-server" } },
  });
}

/**
 * Cookie-bound client used only by the admin area, so Supabase Auth sessions
 * survive across requests. `cookies()` is async in Next 15+.
 */
export async function getSessionClient(): Promise<Client | null> {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component: middleware refreshes the session
          // instead, so this is safe to ignore.
        }
      },
    },
  });
}
