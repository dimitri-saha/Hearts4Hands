"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { errorState, successState, type ActionState } from "@/lib/action-state";

/**
 * Managing who can get into the admin area.
 *
 * Three rules run before every change here, and they exist because the failure
 * they prevent is unrecoverable from inside the product:
 *
 *   1. **Never remove or demote the last owner.** An organisation with no owner
 *      cannot appoint one — the only way back is editing Postgres by hand.
 *   2. **Nobody changes their own role or removes themselves.** Not a security
 *      boundary (an owner could ask another owner) but it makes a mis-click
 *      impossible rather than merely unlikely.
 *   3. **Roles come from a fixed list**, never from whatever the form posted.
 */

const ROLES = ["owner", "editor"] as const;
type Role = (typeof ROLES)[number];

function parseRole(value: FormDataEntryValue | null): Role | null {
  const v = String(value ?? "");
  return (ROLES as readonly string[]).includes(v) ? (v as Role) : null;
}

/**
 * The page hides controls that would be refused, so these should never fire.
 * They still redirect with a reason rather than returning silently: a button
 * that does nothing at all is the kind of thing somebody debugs for an hour.
 */
function refuse(reason: "last-owner" | "self" | "missing"): never {
  redirect(`/admin/team?refused=${reason}`);
}

export async function setAdminRole(formData: FormData): Promise<void> {
  const { requireOwner } = await import("@/lib/auth");
  const { getServiceClient } = await import("@/lib/supabase/server");
  const { countOwners } = await import("@/lib/admins");

  const me = await requireOwner("/admin/team");
  const client = getServiceClient();
  if (!client) return;

  const userId = String(formData.get("userId") ?? "").trim();
  const role = parseRole(formData.get("role"));
  if (!userId || !role) refuse("missing");
  if (userId === me.id) refuse("self");

  const { data: target } = await client
    .from("admins")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!target) refuse("missing");
  if (target.role === "owner" && role !== "owner" && (await countOwners()) <= 1) {
    refuse("last-owner");
  }

  const { error } = await client.from("admins").update({ role }).eq("user_id", userId);
  if (error) console.error("[admin-team] role change failed:", error.message);

  revalidatePath("/admin/team");
}

/**
 * Takes away admin access. The person keeps their Supabase account — they may
 * be a volunteer too, and deleting the auth user would take their logged hours
 * and certificates with it.
 */
export async function removeAdmin(formData: FormData): Promise<void> {
  const { requireOwner } = await import("@/lib/auth");
  const { getServiceClient } = await import("@/lib/supabase/server");
  const { countOwners } = await import("@/lib/admins");

  const me = await requireOwner("/admin/team");
  const client = getServiceClient();
  if (!client) return;

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) refuse("missing");
  if (userId === me.id) refuse("self");

  const { data: target } = await client
    .from("admins")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!target) refuse("missing");
  if (target.role === "owner" && (await countOwners()) <= 1) refuse("last-owner");

  const { error } = await client.from("admins").delete().eq("user_id", userId);
  if (error) console.error("[admin-team] remove failed:", error.message);

  revalidatePath("/admin/team");
}

/**
 * Grants admin access to an email address.
 *
 * Two cases, and the difference matters. If they already have an account — a
 * volunteer being promoted to editor, say — nothing is created and no email is
 * sent; they just gain access next time they sign in. If they don't, Supabase
 * sends an invitation and the account only exists once they accept.
 */
export async function inviteAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { requireOwner } = await import("@/lib/auth");
  const { getServiceClient } = await import("@/lib/supabase/server");
  const { findAuthUserByEmail } = await import("@/lib/admins");
  const { rateLimit } = await import("@/lib/rate-limit");
  const { echoValues } = await import("@/lib/action-state");

  const me = await requireOwner("/admin/team");
  const echoed = echoValues(formData);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = parseRole(formData.get("role")) ?? "editor";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return errorState("That doesn't look like an email address.", { email: "Check this." }, echoed);
  }

  const limit = rateLimit(`invite:${me.id}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) return errorState("That's a lot of invitations at once. Give it an hour.", undefined, echoed);

  const client = getServiceClient();
  if (!client) {
    return errorState("Supabase isn't configured in this environment.", undefined, echoed);
  }

  const existing = await findAuthUserByEmail(email);

  if (existing) {
    const { data: already } = await client
      .from("admins")
      .select("user_id")
      .eq("user_id", existing.id)
      .maybeSingle();

    if (already) {
      return errorState(`${email} already has an admin account.`, undefined, echoed);
    }

    const { error } = await client
      .from("admins")
      .insert({ user_id: existing.id, email, role });

    if (error) {
      console.error("[admin-team] grant failed:", error.message);
      return errorState("Couldn't grant access. Check the logs.", undefined, echoed);
    }

    revalidatePath("/admin/team");
    return successState(
      `${email} already had an account, so no invitation was needed — they're now ${role === "owner" ? "an owner" : "an editor"} and will see the admin next time they sign in.`,
    );
  }

  const { data: invited, error: inviteError } = await client.auth.admin.inviteUserByEmail(email);

  if (inviteError || !invited?.user) {
    console.error("[admin-team] invite failed:", inviteError?.message);
    return errorState(
      `Couldn't send an invitation to ${email}. ${inviteError?.message ?? ""}`.trim(),
      undefined,
      echoed,
    );
  }

  const { error } = await client
    .from("admins")
    .insert({ user_id: invited.user.id, email, role });

  if (error) {
    console.error("[admin-team] insert after invite failed:", error.message);
    return errorState(
      "The invitation went out but the admin record failed to save. Add them again once they accept.",
      undefined,
      echoed,
    );
  }

  revalidatePath("/admin/team");
  return successState(
    `Invitation sent to ${email}. They'll be ${role === "owner" ? "an owner" : "an editor"} once they set a password.`,
  );
}
