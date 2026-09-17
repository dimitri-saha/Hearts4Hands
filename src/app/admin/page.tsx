import type { Metadata } from "next";
import Link from "next/link";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import type { SubmissionStatus } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";
import {
  AdminAlert,
  AdminCard,
  AdminEmpty,
  AdminPageHeader,
  AdminStat,
  StatusBadge,
} from "@/components/admin";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

type Activity = {
  key: string;
  kind: "Volunteer" | "Story";
  title: string;
  meta: string;
  createdAt: string;
  status: SubmissionStatus;
  href: string;
};

type Dashboard = {
  pendingVolunteers: number;
  pendingStories: number;
  unhandledMessages: number;
  publishedPosts: number;
  activity: Activity[];
};

/**
 * Counts come back as `head: true` queries — Postgres returns the number and
 * no rows, which is all a tile needs. Every result is read defensively: a
 * failing query shows a zero, never a stack trace on the dashboard.
 */
async function loadDashboard(): Promise<Dashboard | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const [volunteersPending, storiesPending, messagesUnhandled, postsPublished, volunteers, stories] =
    await Promise.all([
      supabase
        .from("volunteer_signups")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("blog_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("handled", false),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase
        .from("volunteer_signups")
        .select("id, full_name, country, hours, cards_made, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("blog_submissions")
        .select("id, title, author_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  for (const result of [
    volunteersPending,
    storiesPending,
    messagesUnhandled,
    postsPublished,
    volunteers,
    stories,
  ]) {
    if (result.error) console.error("[admin] dashboard query failed:", result.error.message);
  }

  const activity: Activity[] = [
    ...(volunteers.data ?? []).map((row) => ({
      key: `volunteer-${row.id}`,
      kind: "Volunteer" as const,
      title: row.full_name,
      meta: [
        row.country,
        row.hours > 0 ? `${row.hours} ${row.hours === 1 ? "hour" : "hours"}` : null,
        row.cards_made > 0 ? `${row.cards_made} cards` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      createdAt: row.created_at,
      status: row.status,
      href: "/admin/volunteers",
    })),
    ...(stories.data ?? []).map((row) => ({
      key: `story-${row.id}`,
      kind: "Story" as const,
      title: row.title,
      meta: `by ${row.author_name}`,
      createdAt: row.created_at,
      status: row.status,
      href: "/admin/stories",
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return {
    pendingVolunteers: volunteersPending.count ?? 0,
    pendingStories: storiesPending.count ?? 0,
    unhandledMessages: messagesUnhandled.count ?? 0,
    publishedPosts: postsPublished.count ?? 0,
    activity,
  };
}

export default async function AdminOverviewPage() {
  const user = await requireAdmin("/admin");
  // The overview totals volunteer hours, messages and posts. An editor has no
  // business with the first two, so they start at the stories queue instead.
  if (user.role !== "owner") redirect("/admin/stories");
  const data = await loadDashboard();

  const waiting = data
    ? data.pendingVolunteers + data.pendingStories + data.unhandledMessages
    : 0;

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description={
          data
            ? waiting > 0
              ? `${waiting.toLocaleString()} ${waiting === 1 ? "thing needs" : "things need"} a look. Nothing here happens automatically — a person decides.`
              : "The queues are clear. Nice work."
            : "Everything you can review from here needs the service-role key."
        }
      />

      {!data ? (
        <AdminAlert tone="note" title="Reviewing needs one more key">
          <p>
            You&apos;re signed in, but <code className="font-mono text-[0.9em]">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            isn&apos;t set on this deploy — so submissions can&apos;t be read or approved from here.
          </p>
          <p className="mt-2">
            Copy it from Supabase → Project settings → API → <em>service_role</em>, add it to{" "}
            <code className="font-mono text-[0.9em]">.env.local</code> (or your Vercel environment
            variables), and restart. Keep it server-side: it bypasses row-level security, so it must
            never carry a <code className="font-mono text-[0.9em]">NEXT_PUBLIC_</code> prefix.
          </p>
        </AdminAlert>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStat
              label="Volunteer hours"
              value={data.pendingVolunteers}
              hint={
                data.pendingVolunteers > 0
                  ? `${data.pendingVolunteers === 1 ? "submission" : "submissions"} waiting for you`
                  : "nothing waiting"
              }
              attention={data.pendingVolunteers > 0}
              href="/admin/volunteers"
            />
            <AdminStat
              label="Story submissions"
              value={data.pendingStories}
              hint={
                data.pendingStories > 0
                  ? `${data.pendingStories === 1 ? "story" : "stories"} waiting for you`
                  : "nothing waiting"
              }
              attention={data.pendingStories > 0}
              href="/admin/stories"
            />
            <AdminStat
              label="Messages"
              value={data.unhandledMessages}
              hint={
                data.unhandledMessages > 0
                  ? `${data.unhandledMessages === 1 ? "message" : "messages"} waiting for you`
                  : "all replied to"
              }
              attention={data.unhandledMessages > 0}
              href="/admin/messages"
            />
            <AdminStat
              label="Published stories"
              value={data.publishedPosts}
              hint="live on the blog"
              href="/admin/stories"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
            <AdminCard
              title="Latest activity"
              description="The five most recent volunteer and story submissions."
              className="lg:col-span-3"
            >
              {data.activity.length === 0 ? (
                <AdminEmpty
                  title="No submissions yet."
                  description="New volunteer sign-ups and story submissions will show up here as they arrive."
                />
              ) : (
                <ul className="flex list-none flex-col divide-y divide-brown-faint/70">
                  {data.activity.map((item) => (
                    <li key={item.key} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-bold text-brown-soft">{item.kind}</p>
                        <Link
                          href={item.href}
                          className="font-display font-bold text-berry underline decoration-pink-deep decoration-2 underline-offset-4"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-brown-mid">
                          {item.meta ? `${item.meta} · ` : ""}
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={item.status} className="mt-0.5 shrink-0" />
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>

            <AdminCard title="How this works" className="lg:col-span-2">
              <ul className="flex list-none flex-col gap-3 text-[0.95rem] text-brown">
                <li>
                  <strong className="font-display text-berry">Everything is reviewed by hand.</strong>{" "}
                  Nothing a volunteer submits appears on the site until someone here approves it.
                </li>
                <li>
                  <strong className="font-display text-berry">Approving hours feeds award tracking.</strong>{" "}
                  Approved volunteer submissions are the record we count for service-award
                  thresholds, so approve what you can verify and leave a note when you can&apos;t.
                </li>
                <li>
                  <strong className="font-display text-berry">Publishing a story creates a post.</strong>{" "}
                  Editing and publishing a submission writes a real public post at{" "}
                  <code className="font-mono text-[0.9em]">/blog/&lt;slug&gt;</code>. Save it as a
                  draft first if it isn&apos;t ready.
                </li>
                <li>
                  <strong className="font-display text-berry">Impact numbers are manual.</strong> The
                  totals on the home and donate pages come from{" "}
                  <Link
                    href="/admin/stats"
                    className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
                  >
                    Impact numbers
                  </Link>
                  , not from a payment integration — update them when the fundraiser moves.
                </li>
              </ul>
            </AdminCard>
          </div>
        </>
      )}

      <p className="mt-6 text-sm text-brown-soft">
        Signed in as {user.email ?? "an editor"}.
      </p>
    </>
  );
}
