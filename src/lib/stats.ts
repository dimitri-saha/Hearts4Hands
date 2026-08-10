import "server-only";

import { cache } from "react";

import { getPublicClient } from "./supabase/server";
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

/** Manually maintained impact numbers (PRD §5.3). Never throws. */
export const getStats = cache(async (): Promise<ImpactStats> => {
  const supabase = getPublicClient();
  if (!supabase) return fallback;

  const { data, error } = await supabase
    .from("site_stats")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[stats] failed to load site stats:", error.message);
    return fallback;
  }
  return data ? fromRow(data) : fallback;
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
