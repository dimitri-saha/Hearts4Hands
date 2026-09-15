import "server-only";

import { cache } from "react";

import { getPublicClient, getServiceClient } from "./supabase/server";
import type { SiteStats } from "./supabase/types";
import { fallbackStats } from "./site";

export type ImpactStats = {
  totalRaisedCents: number;
  materialsCents: number;
  researchCents: number;
  goalCents: number;
  cardsMade: number;
  volunteers: number;
  hoursLogged: number;
  hospitalsServed: number;
  note: string | null;
  updatedAt: string | null;
  /** False when the numbers came from `fallbackStats` rather than the database. */
  isLive: boolean;
};

function fromRow(row: SiteStats): ImpactStats {
  return {
    totalRaisedCents: row.total_raised_cents,
    materialsCents: row.materials_cents,
    researchCents: row.research_cents,
    goalCents: row.goal_cents,
    cardsMade: row.cards_made,
    volunteers: row.volunteers,
    hoursLogged: row.hours_logged,
    hospitalsServed: row.hospitals_served,
    note: row.note,
    updatedAt: row.updated_at,
    isLive: true,
  };
}

const fallback: ImpactStats = { ...fallbackStats, note: null, isLive: false };

/**
 * Volunteers, hours and cards, counted from approved entries.
 *
 * Service role, because `volunteer_signups` is readable only by its owner and
 * by admins — but this returns three integers and never a row, so nothing
 * about any individual leaves the function. Counting beats storing: there is
 * no figure to remember to update and nothing that can drift out of step with
 * what was actually approved.
 */
async function countApprovedWork(): Promise<{
  volunteers: number;
  hours: number;
  cards: number;
} | null> {
  const admin = getServiceClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("volunteer_signups")
    .select("user_id,email,hours,cards_made")
    .eq("status", "approved")
    .limit(10000);

  if (error) {
    console.error("[stats] approved-work count failed:", error.message);
    return null;
  }

  let hours = 0;
  let cards = 0;
  const people = new Set<string>();

  for (const row of data ?? []) {
    hours += Number(row.hours) || 0;
    cards += row.cards_made || 0;
    // Entries predating accounts have no user_id; fall back to the email so
    // one person logging several times still counts once.
    people.add(row.user_id ?? row.email.toLowerCase());
  }

  return {
    volunteers: people.size,
    hours: Math.round(hours),
    cards,
  };
}

/**
 * Impact numbers.
 *
 * Money raised stays manual (PRD §5.3) — that genuinely is maintained by hand.
 * Everything else is derived from approved hour entries. Never throws.
 */
export const getStats = cache(async (): Promise<ImpactStats> => {
  const supabase = getPublicClient();
  if (!supabase) return fallback;

  const [{ data, error }, counted] = await Promise.all([
    supabase.from("site_stats").select("*").eq("id", 1).maybeSingle(),
    countApprovedWork(),
  ]);

  if (error) {
    console.error("[stats] failed to load site stats:", error.message);
    return fallback;
  }

  const base = data ? fromRow(data) : fallback;
  if (!counted) return base;

  return {
    ...base,
    volunteers: counted.volunteers,
    hoursLogged: counted.hours,
    cardsMade: counted.cards,
    // Live once there is any approved work, even if nobody has saved money
    // figures yet.
    isLive: base.isLive || counted.volunteers > 0,
  };
});

/**
 * Percentages for the materials-vs-research allocation bar. Falls back to the
 * planned 30/70 split when nothing has been raised yet, so the bar still reads
 * as an intention rather than rendering empty.
 */
export function allocationSplit(stats: ImpactStats) {
  const known = stats.materialsCents + stats.researchCents;
  if (known <= 0) {
    return { materialsPct: 30, researchPct: 70, isProjected: true };
  }
  const materialsPct = Math.round((stats.materialsCents / known) * 100);
  return {
    materialsPct,
    researchPct: 100 - materialsPct,
    isProjected: false,
  };
}

/** Progress toward the fundraising goal, clamped to 0–100. */
export function goalProgress(stats: ImpactStats) {
  if (stats.goalCents <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((stats.totalRaisedCents / stats.goalCents) * 100)));
}
