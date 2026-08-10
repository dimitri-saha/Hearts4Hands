import "server-only";

import { redirect } from "next/navigation";

import { getSessionClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

export type AdminUser = { id: string; email: string | null };

/**
 * Who is signed in, and are they on the admin allow-list?
 *
 * Membership is checked against the `admins` table rather than "any
 * authenticated user", so turning on Supabase sign-ups by accident can't
 * hand someone the editor dashboard.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await getSessionClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[auth] admin lookup failed:", error.message);
    return null;
  }
  if (!data) return null;

  return { id: user.id, email: user.email ?? null };
}

/** Guard for admin pages and admin server actions. Redirects when not allowed. */
export async function requireAdmin(returnTo?: string): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) {
    const query = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/admin/login${query}`);
  }
  return user;
}
