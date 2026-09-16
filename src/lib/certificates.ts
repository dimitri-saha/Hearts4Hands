import "server-only";

import { getPublicClient, getServiceClient, getSessionClient } from "./supabase/server";
import type { Certificate, CertificateVerification } from "./supabase/types";

/**
 * Reading and issuing certificates.
 *
 * Certificates are cumulative — see migration 0005 for the reasoning. That
 * means eligibility is simply "your approved total is higher than the last
 * certificate said", and nothing ever has to be marked as spent.
 */

export type Eligibility =
  | { ok: true; hours: number; cards: number; entryIds: string[] }
  | { ok: false; reason: "no-approved-hours" | "nothing-new"; hours: number; cards: number };

/**
 * What a new certificate would say, and whether issuing one is worthwhile.
 *
 * Reads through the session client with an explicit `user_id` filter. RLS on
 * `volunteer_signups` carries both "own rows" and `is_admin()`, and those are
 * OR'd — an admin requesting their own certificate would otherwise be issued
 * one covering every volunteer's hours. See CLAUDE.md §11.
 */
export async function checkEligibility(userId: string): Promise<Eligibility> {
  const supabase = await getSessionClient();
  if (!supabase) return { ok: false, reason: "no-approved-hours", hours: 0, cards: 0 };

  const { data, error } = await supabase
    .from("volunteer_signups")
    .select("id, hours, cards_made")
    .eq("user_id", userId)
    .eq("status", "approved");

  if (error) {
    console.error("[certificates] eligibility read failed:", error.message);
    return { ok: false, reason: "no-approved-hours", hours: 0, cards: 0 };
  }

  const rows = data ?? [];
  const hours = Math.round(rows.reduce((n, r) => n + (Number(r.hours) || 0), 0) * 10) / 10;
  const cards = rows.reduce((n, r) => n + (r.cards_made || 0), 0);

  if (rows.length === 0 || hours <= 0) {
    return { ok: false, reason: "no-approved-hours", hours, cards };
  }

  // Nothing has been approved since the last one, so a new certificate would be
  // a duplicate with a newer date on it.
  const latest = await getLatestCertificate(userId);
  if (latest && Number(latest.hours) >= hours && latest.cards >= cards && !latest.revoked_at) {
    return { ok: false, reason: "nothing-new", hours, cards };
  }

  return { ok: true, hours, cards, entryIds: rows.map((r) => r.id) };
}

export async function getMyCertificates(userId: string): Promise<Certificate[]> {
  const supabase = await getSessionClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[certificates] list failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function getLatestCertificate(userId: string): Promise<Certificate | null> {
  const supabase = await getSessionClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

/**
 * One certificate, for the owner (or an admin) to download.
 *
 * Goes through the session client so RLS decides — but still filters on the
 * code, and the caller checks ownership. A revoked certificate is returned
 * rather than hidden, so the route can refuse it with a reason instead of a 404
 * that looks like a bug.
 */
export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const supabase = await getSessionClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error("[certificates] fetch failed:", error.message);
    return null;
  }
  return data ?? null;
}

/**
 * Public verification.
 *
 * Calls a `security definer` function with a fixed projection rather than
 * reading the table: RLS can hide rows but not columns, and this path must
 * never be able to return `user_id` however it is called.
 */
export async function verifyCertificate(code: string): Promise<CertificateVerification | null> {
  const supabase = getPublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("verify_certificate", { p_code: code });
  if (error) {
    console.error("[certificates] verify failed:", error.message);
    return null;
  }
  return data?.[0] ?? null;
}

/** Issues a certificate. Service role: `user_id` comes from the session, never from input. */
export async function issueCertificate(args: {
  userId: string;
  fullName: string;
  hours: number;
  cards: number;
  entryIds: string[];
}): Promise<Certificate | null> {
  const admin = getServiceClient();
  if (!admin) return null;

  const { data: code, error: codeError } = await admin.rpc("generate_certificate_code");
  if (codeError || !code) {
    console.error("[certificates] code generation failed:", codeError?.message);
    return null;
  }

  const { data, error } = await admin
    .from("certificates")
    .insert({
      code,
      user_id: args.userId,
      full_name: args.fullName,
      hours: args.hours,
      cards: args.cards,
      entry_ids: args.entryIds,
      revoked_at: null,
      revoked_reason: null,
      revoked_by: null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[certificates] insert failed:", error.message);
    return null;
  }
  return data;
}

/** Every issued certificate, newest first. Admin screens only. */
export async function getAllCertificates(): Promise<Certificate[]> {
  const admin = getServiceClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("certificates")
    .select("*")
    .order("issued_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[certificates] admin list failed:", error.message);
    return [];
  }
  return data ?? [];
}
