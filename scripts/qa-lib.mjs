import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

/**
 * Shared helpers for the QA sweep.
 *
 * Throwaway accounts are created through the Supabase admin API with
 * `email_confirm: true` rather than through the sign-up form. That is
 * deliberate: the form would make Supabase send a real confirmation email to a
 * fake address, and bounces from fake addresses damage the sending domain's
 * reputation on Resend. The form's own validation is still exercised — just
 * without posting a bogus address to a live mail provider.
 */
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

export const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const BASE = process.env.QA_BASE ?? "http://localhost:3000";
export const TAG = "qa-sweep";           // every created row carries this, so cleanup is exact
export const PASSWORD = "Qa-Sweep-Pass-7731";

export function qaEmail(slug) {
  return `${TAG}-${slug}@hearts4hands-qa.invalid`;
}

export async function makeUser(slug, { fullName, ageGroup = "18 or older" } = {}) {
  const email = qaEmail(slug);
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const u of existing.users.filter((u) => u.email === email)) {
    await admin.auth.admin.deleteUser(u.id);
  }
  const { data, error } = await admin.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true,
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);

  await admin.from("profiles").upsert({
    user_id: data.user.id,
    full_name: fullName ?? `QA ${slug}`,
    age_group: ageGroup,
    country: "United States",
  });
  return data.user;
}

export async function signIn(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  // By name, not by type: several forms can share a page (the account nav
  // carries a "Sign out" submit button that sits above everything else), and a
  // bare button[type=submit] selector picks whichever comes first in the DOM.
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}

/** Deletes every row and account this sweep created. Safe to run repeatedly. */
export async function cleanup() {
  const removed = { users: 0, signups: 0, certificates: 0, groups: 0, submissions: 0, messages: 0 };
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const mine = data.users.filter((u) => (u.email ?? "").startsWith(TAG));

  for (const u of mine) {
    const { count: c1 } = await admin.from("certificates").delete({ count: "exact" }).eq("user_id", u.id);
    const { count: c2 } = await admin.from("volunteer_signups").delete({ count: "exact" }).eq("user_id", u.id);
    const { count: c3 } = await admin.from("blog_submissions").delete({ count: "exact" }).eq("user_id", u.id);
    removed.certificates += c1 ?? 0; removed.signups += c2 ?? 0; removed.submissions += c3 ?? 0;
    await admin.auth.admin.deleteUser(u.id);
    removed.users++;
  }
  // Also sweep by name. `volunteer_signups.user_id` is ON DELETE SET NULL, so a
  // row whose account was deleted first is orphaned rather than removed — and
  // deleting by user_id alone would never find it again.
  const { count: orphans } = await admin
    .from("volunteer_signups")
    .delete({ count: "exact" })
    .is("user_id", null)
    .like("full_name", "QA %");
  removed.signups += orphans ?? 0;

  const { count: g } = await admin.from("groups").delete({ count: "exact" }).like("name", `${TAG}%`);
  const { count: m } = await admin.from("contact_messages").delete({ count: "exact" }).like("email", `${TAG}%`);
  removed.groups = g ?? 0; removed.messages = m ?? 0;
  return removed;
}
