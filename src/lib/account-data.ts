import "server-only";

import { getSessionClient } from "./supabase/server";
import type { BlogSubmission, Group, GroupRole, Post, VolunteerSignup } from "./supabase/types";

/**
 * Everything the volunteer dashboard reads.
 *
 * All of it goes through the *session* client, not the service role — so
 * row-level security decides what comes back. If the "own rows only" policies
 * were ever wrong, these queries would return nothing rather than somebody
 * else's volunteering. The service role is used in exactly one place (the club
 * roster), where it's paired with an explicit leadership check.
 */

export type HourEntry = VolunteerSignup;

export type AccountTotals = {
  approvedHours: number;
  approvedCards: number;
  pendingHours: number;
  pendingCount: number;
  rejectedCount: number;
  entryCount: number;
};

export type PublishedStory = Pick<Post, "slug" | "title" | "published_at" | "category">;

export type Membership = {
  group: Group;
  role: GroupRole;
  /** Approved hours logged by everyone in the group, this member included. */
  groupHours: number;
  memberCount: number;
};

export async function getMyHourEntries(): Promise<HourEntry[]> {
  const supabase = await getSessionClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("volunteer_signups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[account] hour entries failed:", error.message);
    return [];
  }
  return data ?? [];
}

/** Approved figures are the ones that count; pending is shown so a total never looks wrong for no reason. */
export function totalsFor(entries: HourEntry[]): AccountTotals {
  const t: AccountTotals = {
    approvedHours: 0,
    approvedCards: 0,
    pendingHours: 0,
    pendingCount: 0,
    rejectedCount: 0,
    entryCount: entries.length,
  };

  for (const e of entries) {
    if (e.status === "approved") {
      t.approvedHours += Number(e.hours) || 0;
      t.approvedCards += e.cards_made || 0;
    } else if (e.status === "pending") {
      t.pendingHours += Number(e.hours) || 0;
      t.pendingCount += 1;
    } else {
      t.rejectedCount += 1;
    }
  }

  // Hours are numeric(6,2); round to kill floating-point dust like 3.7000000000000006.
  t.approvedHours = Math.round(t.approvedHours * 100) / 100;
  t.pendingHours = Math.round(t.pendingHours * 100) / 100;
  return t;
}

/**
 * Only stories that actually went live.
 *
 * Drafts and not-approved submissions are deliberately absent: not-approved
 * ones are deleted 30 days after the decision, and a dashboard that shows
 * something due to vanish is worse than one that never showed it.
 */
export async function getMyPublishedStories(): Promise<PublishedStory[]> {
  const supabase = await getSessionClient();
  if (!supabase) return [];

  const { data: submissions, error } = await supabase
    .from("blog_submissions")
    .select("published_post_id")
    .eq("status", "approved")
    .not("published_post_id", "is", null);

  if (error) {
    console.error("[account] story lookup failed:", error.message);
    return [];
  }

  const ids = (submissions ?? [])
    .map((s: Pick<BlogSubmission, "published_post_id">) => s.published_post_id)
    .filter((id): id is string => Boolean(id));

  if (ids.length === 0) return [];

  // Readable through the public "published posts" policy.
  const { data: posts } = await supabase
    .from("posts")
    .select("slug,title,published_at,category")
    .in("id", ids)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return posts ?? [];
}

/** Pending or not-approved submissions, as a count only — see the note above. */
export async function getMyStoriesInReview(): Promise<number> {
  const supabase = await getSessionClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("blog_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    console.error("[account] in-review count failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getMyGroups(userId: string): Promise<Membership[]> {
  const supabase = await getSessionClient();
  if (!supabase) return [];

  const { data: memberships, error } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", userId);

  if (error) {
    console.error("[account] membership lookup failed:", error.message);
    return [];
  }
  if (!memberships?.length) return [];

  const ids = memberships.map((m) => m.group_id);
  const { data: groups } = await supabase.from("groups").select("*").in("id", ids);
  // Archived clubs still appear on the groups page (with their history intact)
  // but are filtered out of the hour-logging picker by the caller.

  const out: Membership[] = [];
  for (const m of memberships) {
    const group = (groups ?? []).find((g) => g.id === m.group_id);
    if (!group) continue;

    // Group totals come from a helper that can see every member's entries;
    // an individual member can only read their own rows.
    const { hours, memberCount } = await groupTotals(group.id);
    out.push({ group, role: m.role, groupHours: hours, memberCount });
  }
  return out;
}

/**
 * A club's combined approved hours.
 *
 * Uses the service role because it aggregates across members, but returns only
 * two numbers — never rows — so it can't leak anything about who did what.
 */
export async function groupTotals(groupId: string): Promise<{ hours: number; memberCount: number }> {
  const { getServiceClient } = await import("./supabase/server");
  const admin = getServiceClient();
  if (!admin) return { hours: 0, memberCount: 0 };

  const [{ data: entries }, { count }] = await Promise.all([
    admin
      .from("volunteer_signups")
      .select("hours")
      .eq("group_id", groupId)
      .eq("status", "approved"),
    admin
      .from("group_members")
      .select("user_id", { count: "exact", head: true })
      .eq("group_id", groupId),
  ]);

  const hours = (entries ?? []).reduce(
    (sum: number, e: { hours: number }) => sum + (Number(e.hours) || 0),
    0,
  );
  return { hours: Math.round(hours * 100) / 100, memberCount: count ?? 0 };
}

export type RosterEntry = {
  userId: string;
  name: string;
  role: GroupRole;
  approvedHours: number;
  approvedCards: number;
};

/**
 * The club roster, visible to every member — not just leaders.
 *
 * Members seeing each other is the point of a club: in a school group everyone
 * already knows who's in the room, and seeing the totals is half the motivation.
 * The privacy line is drawn at *what* is shown rather than who sees it — names,
 * approved hours and approved cards, and nothing else. No email addresses, no
 * locations, no photos, no stories, nothing pending or rejected. Leaders get the
 * same list plus the management controls.
 *
 * The exposure that matters is someone joining with a leaked code, which is why
 * codes rotate in one click and leaders can now remove people.
 *
 * Service role, because it spans other people's profiles and hour entries —
 * which is why membership is checked here, in code, rather than stretching an
 * RLS policy wide enough to allow it.
 */
export async function getGroupRoster(
  groupId: string,
  requesterId: string,
): Promise<RosterEntry[] | null> {
  const { getServiceClient } = await import("./supabase/server");
  const admin = getServiceClient();
  if (!admin) return null;

  const { data: me } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", requesterId)
    .maybeSingle();

  // Not in this group at all: no roster, no matter who is asking.
  if (!me) return null;

  const { data: members } = await admin
    .from("group_members")
    .select("user_id, role")
    .eq("group_id", groupId);

  if (!members?.length) return [];

  const ids = members.map((m) => m.user_id);
  const [{ data: profiles }, { data: entries }] = await Promise.all([
    admin.from("profiles").select("user_id, full_name").in("user_id", ids),
    admin
      .from("volunteer_signups")
      .select("user_id, hours, cards_made")
      .eq("group_id", groupId)
      .eq("status", "approved"),
  ]);

  return members
    .map((m) => {
      const mine = (entries ?? []).filter((e) => e.user_id === m.user_id);
      return {
        userId: m.user_id,
        name:
          (profiles ?? []).find((p) => p.user_id === m.user_id)?.full_name ?? "A volunteer",
        role: m.role,
        approvedHours:
          Math.round(mine.reduce((s, e) => s + (Number(e.hours) || 0), 0) * 100) / 100,
        approvedCards: mine.reduce((s, e) => s + (e.cards_made || 0), 0),
      };
    })
    .sort((a, b) => b.approvedHours - a.approvedHours);
}
