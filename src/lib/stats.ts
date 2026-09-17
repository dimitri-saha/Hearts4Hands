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
  /**
   * The split behind the headline figures.
   *
   * `baseline` is the work done before this website existed — entered by hand
   * at /admin/stats, because there are no rows for it and inventing 57
   * `volunteer_signups` to make the arithmetic work would put fabricated
   * records behind real certificates.
   *
   * `live` is counted from approved entries. The public numbers are the sum.
   */
  baseline: { volunteers: number; hoursLogged: number; cardsMade: number };
  live: { volunteers: number; hoursLogged: number; cardsMade: number };
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
    baseline: {
      volunteers: row.volunteers,
      hoursLogged: row.hours_logged,
      cardsMade: row.cards_made,
    },
    live: { volunteers: 0, hoursLogged: 0, cardsMade: 0 },
  };
}

const fallback: ImpactStats = {
  ...fallbackStats,
  note: null,
  isLive: false,
  baseline: {
    volunteers: fallbackStats.volunteers,
    hoursLogged: fallbackStats.hoursLogged,
    cardsMade: fallbackStats.cardsMade,
  },
  live: { volunteers: 0, hoursLogged: 0, cardsMade: 0 },
};

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
  /** When the most recent entry was approved — drives the "last updated" line. */
  lastApprovedAt: string | null;
} | null> {
  const admin = getServiceClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("volunteer_signups")
    .select("user_id,email,hours,cards_made,reviewed_at")
    .eq("status", "approved")
    .limit(10000);

  if (error) {
    console.error("[stats] approved-work count failed:", error.message);
    return null;
  }

  let hours = 0;
  let cards = 0;
  let lastApprovedAt: string | null = null;
  const people = new Set<string>();

  for (const row of data ?? []) {
    hours += Number(row.hours) || 0;
    cards += row.cards_made || 0;
    if (row.reviewed_at && (!lastApprovedAt || row.reviewed_at > lastApprovedAt)) {
      lastApprovedAt = row.reviewed_at;
    }
    // Entries predating accounts have no user_id; fall back to the email so
    // one person logging several times still counts once.
    people.add(row.user_id ?? row.email.toLowerCase());
  }

  return {
    volunteers: people.size,
    hours: Math.round(hours),
    cards,
    lastApprovedAt,
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

  // "Last updated" has to mean the newest thing that actually changed. The
  // money figures are edited by hand (site_stats.updated_at) while the counts
  // move whenever an entry is approved — so take whichever happened later,
  // otherwise the date can sit weeks behind numbers that changed this morning.
  const updatedAt =
    counted.lastApprovedAt && (!base.updatedAt || counted.lastApprovedAt > base.updatedAt)
      ? counted.lastApprovedAt
      : base.updatedAt;

  // Baseline + live, not one or the other.
  //
  // Hearts4Hands ran for a school year before this site existed: 57 volunteers,
  // 171 hours, hundreds of cards, none of which has a row in the database. The
  // headline figures have to include that history or the site understates what
  // the group has actually done — but the history can't be faked into
  // `volunteer_signups`, because those rows are what certificates certify and
  // what /verify stands behind.
  //
  // So the pre-website totals stay in `site_stats` as a hand-entered baseline,
  // new work is counted from approved entries, and the public number is the
  // sum. Nothing needs re-typing as volunteers log hours.
  return {
    ...base,
    updatedAt,
    volunteers: base.baseline.volunteers + counted.volunteers,
    hoursLogged: base.baseline.hoursLogged + counted.hours,
    cardsMade: base.baseline.cardsMade + counted.cards,
    live: {
      volunteers: counted.volunteers,
      hoursLogged: counted.hours,
      cardsMade: counted.cards,
    },
    // Live once there is a database row at all, or any approved work.
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
