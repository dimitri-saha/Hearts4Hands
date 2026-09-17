import "server-only";

import { redirect } from "next/navigation";

import { getSessionClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

import type { AdminRole } from "./supabase/types";

export type AdminUser = { id: string; email: string | null; role: AdminRole };

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
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[auth] admin lookup failed:", error.message);
    return null;
  }
  if (!data) return null;

  // Unknown or missing role reads as the lesser one. A typo in the column must
  // not be a promotion.
  const role: AdminRole = data.role === "owner" ? "owner" : "editor";
  return { id: user.id, email: user.email ?? null, role };
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

/**
 * Guard for everything an editor must not reach.
 *
 * Editors are recruited to read story submissions. Volunteer hour entries,
 * contact messages, certificates and the impact numbers all carry either
 * personal data or the power to change what the public site claims, and none of
 * it is needed to edit a story.
 *
 * An editor who lands here is sent to the stories queue rather than the login
 * screen — they are signed in correctly, just in the wrong place, and bouncing
 * them to a login form would look like a broken session.
 */
export async function requireOwner(returnTo?: string): Promise<AdminUser> {
  const user = await requireAdmin(returnTo);
  if (user.role !== "owner") redirect("/admin/stories?denied=1");
  return user;
}

/** For actions: true when the caller may act outside the stories queue. */
export async function isOwner(): Promise<boolean> {
  const user = await getAdminUser();
  return user?.role === "owner";
}
