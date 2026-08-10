"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Browser client — used only by the admin sign-in form so Supabase Auth can
 * write its session cookies. Public pages never talk to Supabase directly;
 * they render server-side.
 */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
