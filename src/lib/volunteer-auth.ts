import "server-only";

import { redirect } from "next/navigation";

import { getSessionClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";
import type { Profile } from "./supabase/types";

/**
 * Session helpers for volunteer accounts.
 *
 * Deliberately separate from `lib/auth.ts`, which gates `/admin` on membership
 * of the `admins` table. Being signed in as a volunteer grants nothing there —
 * public sign-ups are enabled, so "is authenticated" is no longer a meaningful
 * permission on its own.
 */

export type Volunteer = {
  id: string;
  email: string | null;
  profile: Profile | null;
};

/**
 * The signed-in volunteer, or null.
 *
 * Reads the profile through the *session* client rather than the service role,
 * so row-level security is doing the work rather than being bypassed — if the
 * "own profile only" policy were ever wrong, this would return nothing instead
 * of somebody else's data.
 */
export async function getVolunteer(): Promise<Volunteer | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await getSessionClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[volunteer-auth] profile lookup failed:", error.message);
  }

  return { id: user.id, email: user.email ?? null, profile: profile ?? null };
}

/** Guard for `/account/*` pages and volunteer-only server actions. */
export async function requireVolunteer(returnTo?: string): Promise<Volunteer> {
  const volunteer = await getVolunteer();
  if (!volunteer) {
    const query = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${query}`);
  }
  return volunteer;
}

/**
 * An account created by a parent or guardian for a child under 13.
 *
 * These accounts can log hours but never submit a story — publishing a child's
 * writing under their name is public disclosure, which needs stricter consent
 * than an account can carry. Checked in the form, in the server action, and by
 * a trigger in migration 0004.
 */
export function isGuardianAccount(volunteer: Volunteer | null): boolean {
  return volunteer?.profile?.is_guardian_account === true;
}

/** Display name for the dashboard: the volunteer, not the account holder. */
export function volunteerName(volunteer: Volunteer | null): string {
  return volunteer?.profile?.full_name?.trim() || "there";
}
