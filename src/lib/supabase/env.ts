/**
 * Environment detection.
 *
 * The site is designed to build, deploy, and look complete *before* Supabase
 * exists. Every data path checks these flags and falls back to static content
 * instead of throwing, so a half-configured deploy degrades to a brochure site
 * rather than a stack trace.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

/** True when public reads (published posts, stats) can hit the database. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** True when server actions can write (form submissions, admin edits). */
export const isSupabaseWritable = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);

export function getServiceRoleKey() {
  return SERVICE_ROLE_KEY;
}
