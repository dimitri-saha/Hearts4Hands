import "server-only";

import { getServiceClient } from "./supabase/server";
import type { AdminRole } from "./supabase/types";

/**
 * Reading the admin allow-list for the management screen.
 *
 * Goes through the service role on purpose: it joins `admins` against Supabase
 * Auth, which only the service key can read. Every caller is behind
 * `requireOwner()`, and nothing here takes a role or an id from client input.
 */

export type AdminAccount = {
  userId: string;
  email: string;
  role: AdminRole;
  addedAt: string;
  lastSignInAt: string | null;
  confirmed: boolean;
  /** True when this row is the person looking at the screen. */
  isYou: boolean;
};

type AuthUserLite = {
  id: string;
  email?: string | null;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
};

async function listAuthUsers(): Promise<AuthUserLite[]> {
  const admin = getServiceClient();
  if (!admin) return [];

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error("[admins] listUsers failed:", error.message);
    return [];
  }
  return (data?.users ?? []) as AuthUserLite[];
}

export async function listAdmins(currentUserId: string): Promise<AdminAccount[]> {
  const admin = getServiceClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("admins")
    .select("user_id, email, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admins] list failed:", error.message);
    return [];
  }

  const users = new Map((await listAuthUsers()).map((u) => [u.id, u]));

  return (data ?? []).map((row) => {
    const user = users.get(row.user_id);
    return {
      userId: row.user_id,
      // The auth record is the live one — `admins.email` is a copy taken when
      // the row was made and can drift if somebody changes their address.
      email: user?.email ?? row.email ?? "(unknown)",
      role: row.role === "owner" ? "owner" : "editor",
      addedAt: row.created_at,
      lastSignInAt: user?.last_sign_in_at ?? null,
      confirmed: Boolean(user?.email_confirmed_at),
      isYou: row.user_id === currentUserId,
    };
  });
}

/** How many owners are left. Guards read this before any demotion or removal. */
export async function countOwners(): Promise<number> {
  const admin = getServiceClient();
  if (!admin) return 0;

  const { count, error } = await admin
    .from("admins")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "owner");

  if (error) {
    console.error("[admins] owner count failed:", error.message);
    // Fail closed: an unknown count must not authorise removing an owner.
    return 0;
  }
  return count ?? 0;
}

/** Finds an existing Supabase Auth user by email. Case-insensitive. */
export async function findAuthUserByEmail(email: string): Promise<AuthUserLite | null> {
  const wanted = email.trim().toLowerCase();
  const users = await listAuthUsers();
  return users.find((u) => (u.email ?? "").toLowerCase() === wanted) ?? null;
}
