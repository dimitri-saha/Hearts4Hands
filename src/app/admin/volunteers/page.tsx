import type { Metadata } from "next";

import { getProofUrl, reviewVolunteer } from "@/app/actions/admin";
import {
  AdminAlert,
  AdminCard,
  AdminDetail,
  AdminEmpty,
  AdminList,
  AdminListItem,
  AdminPageHeader,
  AdminStat,
  FilterTabs,
  StatusBadge,
} from "@/components/admin";
import { requireAdmin } from "@/lib/auth";
import { volunteerActivities } from "@/lib/site";
import { getServiceClient } from "@/lib/supabase/server";
import { isGuardianSubmission } from "@/lib/validation";
import type { SubmissionStatus, VolunteerSignup } from "@/lib/supabase/types";
import { formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Volunteer hours",
  robots: { index: false, follow: false },
};

const ROW_LIMIT = 200;

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Not approved" },
  { value: "all", label: "All" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

function parseFilter(value: string | undefined): Filter {
  return FILTERS.some((f) => f.value === value) ? (value as Filter) : "pending";
}

function activityLabel(value: string) {
  return volunteerActivities.find((a) => a.value === value)?.label ?? value;
}

function locationOf(row: VolunteerSignup) {
  return [row.city, row.state, row.country].filter(Boolean).join(", ") || "Not given";
}

export default async function AdminVolunteersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin("/admin/volunteers");

  const filter = parseFilter((await searchParams).status);
  const supabase = getServiceClient();

  if (!supabase) {
    return (
      <div className="flex flex-col gap-5">
        <AdminPageHeader
          title="Volunteer hours"
          description="Review logged hours and proof of cards, then approve or send them back."
        />
        <AdminAlert tone="note" title="No database connected yet">
          <p>
            Volunteer submissions live in Supabase, and this page needs the{" "}
            <code className="font-body font-bold">SUPABASE_SERVICE_ROLE_KEY</code> environment
            variable to read them. Add it (plus{" "}
            <code className="font-body font-bold">NEXT_PUBLIC_SUPABASE_URL</code>) in Vercel →
            Settings → Environment Variables, or in <code className="font-body font-bold">.env.local</code>{" "}
            for local work, then reload.
          </p>
          <p className="mt-2">
            Until then nothing is broken — the public volunteer form simply tells people to email us
            instead.
          </p>
        </AdminAlert>
      </div>
    );
  }

  // Counts drive the filter tabs; they're independent of the row limit below.
  const countFor = (status: SubmissionStatus) =>
    supabase
      .from("volunteer_signups")
      .select("id", { count: "exact", head: true })
      .eq("status", status);

  const listQuery = supabase
    .from("volunteer_signups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(ROW_LIMIT);

  const [pendingCount, approvedCount, rejectedCount, listResult, approvedResult] =
    await Promise.all([
      countFor("pending"),
      countFor("approved"),
      countFor("rejected"),
      filter === "all" ? listQuery : listQuery.eq("status", filter),
      // Approved-only aggregate: the summary strip and award tracking must never
      // count hours nobody has checked yet.
      supabase
        .from("volunteer_signups")
        .select("email, full_name, hours, cards_made")
        .eq("status", "approved"),
    ]);

  const loadError = listResult.error ?? approvedResult.error;
  const rows = (listResult.data ?? []) as VolunteerSignup[];
  const approved = approvedResult.data ?? [];

  const totalHours = approved.reduce((sum, r) => sum + (r.hours ?? 0), 0);
  const totalCards = approved.reduce((sum, r) => sum + (r.cards_made ?? 0), 0);

  // Group approved hours per person so the same volunteer's multiple logs add up.
  const byVolunteer = new Map<string, { name: string; hours: number }>();
  for (const row of approved) {
    const key = row.email.toLowerCase();
    const existing = byVolunteer.get(key);
    if (existing) existing.hours += row.hours ?? 0;
    else byVolunteer.set(key, { name: row.full_name, hours: row.hours ?? 0 });
  }

  // Approved hours per volunteer — the figure a certificate would be issued
  // against. No thresholds: we issue our own certificate, not a graded award.
  const approvedTotals = [...byVolunteer.entries()]
    .map(([email, v]) => ({ email, ...v }))
    .filter((v) => v.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  // One signed URL per row that has a proof file. Batched: 40 serial round-trips
  // to storage would make this page crawl.
  const proofUrls = new Map<string, string | null>(
    await Promise.all(
      rows
        .filter((r) => r.proof_path)
        .map(
          async (r) => [r.id, await getProofUrl(r.proof_path as string)] as [string, string | null],
        ),
    ),
  );

  const total = (pendingCount.count ?? 0) + (approvedCount.count ?? 0) + (rejectedCount.count ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Volunteer hours"
        description="Check the hours and the proof photo, then approve or send it back with a note. Only approved hours count toward the totals below."
        count={rows.length}
      />

      <FilterTabs
        basePath="/admin/volunteers"
        active={filter}
        label="Filter volunteer submissions by review status"
        options={[
          { value: "pending", label: "Pending", count: pendingCount.count ?? 0 },
          { value: "approved", label: "Approved", count: approvedCount.count ?? 0 },
          { value: "rejected", label: "Not approved", count: rejectedCount.count ?? 0 },
          { value: "all", label: "All", count: total },
        ]}
      />

      {loadError ? (
        <AdminAlert tone="error" title="Couldn't load everything">
          <p>
            The database returned an error: {loadError.message}. What you can see below may be
            incomplete.
          </p>
        </AdminAlert>
      ) : null}

      {/* --- Summary: approved only ----------------------------------------- */}
      <section aria-labelledby="totals-heading" className="flex flex-col gap-2">
        <h2 id="totals-heading" className="sr-only">
          Approved totals
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <AdminStat
            label="Approved hours"
            value={formatNumber(Math.round(totalHours * 10) / 10)}
            hint="Across every approved log"
          />
          <AdminStat
            label="Approved cards"
            value={formatNumber(totalCards)}
            hint="Made and confirmed"
          />
          <AdminStat
            label="Volunteers counted"
            value={formatNumber(byVolunteer.size)}
            hint="Distinct email addresses"
          />
        </div>
        <p className="font-hand text-base text-brown-mid">
          Approved submissions only. Anything still pending isn&apos;t counted here — hours only
          become real once someone has looked at them.
        </p>
      </section>

      {/* --- Approved hours per volunteer ---------------------------------- */}
      <AdminCard
        title="Approved hours by volunteer"
        description="What each person has banked, counting approved entries only. This is the figure a certificate is issued against."
      >
        {approvedTotals.length === 0 ? (
          <p className="text-[0.95rem] text-brown-mid">
            No approved hours yet. Approve an entry above and it will show up here.
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-2">
            {approvedTotals.map((v) => (
              <li
                key={v.email}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-brown-faint/60 pb-2 last:border-b-0 last:pb-0"
              >
                <span className="font-display font-bold text-berry">
                  {v.name}{" "}
                  <a
                    href={`mailto:${v.email}`}
                    className="font-body text-sm font-normal text-brown-mid underline decoration-brown-faint underline-offset-2"
                  >
                    {v.email}
                  </a>
                </span>
                <span className="text-[0.95rem] text-brown tabular-nums">
                  {formatNumber(Math.round(v.hours * 10) / 10)} approved hours
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 border-t border-brown-faint/70 pt-3 text-sm text-brown-mid">
          These are the hours volunteers entered themselves, as approved on this page. Pending and
          not-approved entries are excluded.
        </p>
      </AdminCard>

      {/* --- Export note ----------------------------------------------------- */}
      <AdminAlert tone="note" title="Need a spreadsheet?">
        <p>
          There&apos;s no download button here on purpose. Open your Supabase project → Table Editor
          → <span className="font-bold">volunteer_signups</span> → Export → Download as CSV. That
          gives you every column, including the ones this page summarises, which is what the award
          paperwork wants.
        </p>
      </AdminAlert>

      {/* --- The queue -------------------------------------------------------- */}
      <section aria-labelledby="queue-heading" className="flex flex-col gap-3">
        <h2 id="queue-heading" className="font-display text-xl font-bold text-berry">
          {FILTERS.find((f) => f.value === filter)?.label} submissions
          {rows.length === ROW_LIMIT ? (
            <span className="ml-2 font-body text-sm font-normal text-brown-mid">
              showing the {ROW_LIMIT} most recent
            </span>
          ) : null}
        </h2>

        {rows.length === 0 ? (
          <AdminEmpty
            title={
              filter === "pending"
                ? "Nothing waiting for review."
                : "No submissions match this filter."
            }
            description={
              filter === "pending"
                ? "Every logged hour has been looked at. Nice work."
                : "Try another tab, or check back after the next round of sign-ups."
            }
          />
        ) : (
          <AdminList>
            {rows.map((row) => {
              const proofUrl = row.proof_path ? proofUrls.get(row.id) : undefined;
              const noteId = `note-${row.id}`;

              return (
                <AdminListItem
                  key={row.id}
                  title={row.full_name}
                  badge={<StatusBadge status={row.status} />}
                  meta={
                    <>
                      <a
                        href={`mailto:${row.email}`}
                        className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
                      >
                        {row.email}
                      </a>
                      {" · "}
                      {locationOf(row)}
                      {row.school ? ` · ${row.school}` : null}
                      {" · submitted "}
                      {formatDate(row.created_at)}
                    </>
                  }
                  actions={
                    <form
                      action={reviewVolunteer}
                      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <input type="hidden" name="id" value={row.id} />
                      <label htmlFor={noteId} className="sr-only">
                        Note to record with this decision for {row.full_name}
                      </label>
                      <input
                        id={noteId}
                        name="reviewerNote"
                        type="text"
                        maxLength={500}
                        defaultValue={row.reviewer_note ?? ""}
                        placeholder="Optional note (saved with the decision)"
                        className="min-w-0 flex-1 rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-body text-sm text-brown placeholder:text-brown-soft focus:border-red focus:outline-none"
                      />
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {row.status !== "approved" ? (
                          <button
                            type="submit"
                            name="status"
                            value="approved"
                            className="rounded-lg border border-leaf bg-leaf/18 px-3 py-1.5 font-display text-sm font-bold text-brown hover:bg-leaf/30"
                          >
                            ✓ Approve
                          </button>
                        ) : null}
                        {row.status !== "rejected" ? (
                          <button
                            type="submit"
                            name="status"
                            value="rejected"
                            className="rounded-lg border border-red bg-red/10 px-3 py-1.5 font-display text-sm font-bold text-berry hover:bg-red/20"
                          >
                            × Reject
                          </button>
                        ) : null}
                        {row.status !== "pending" ? (
                          <button
                            type="submit"
                            name="status"
                            value="pending"
                            className="rounded-lg border border-brown-faint bg-cream px-3 py-1.5 font-display text-sm font-bold text-brown-mid hover:bg-kraft"
                          >
                            ↩ Reset to pending
                          </button>
                        ) : null}
                      </div>
                    </form>
                  }
                >
                  <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <AdminDetail label="Hours">
                      <span className="font-display text-lg font-bold text-berry tabular-nums">
                        {formatNumber(row.hours ?? 0)}
                      </span>
                    </AdminDetail>
                    <AdminDetail label="Cards made">
                      <span className="font-display text-lg font-bold text-berry tabular-nums">
                        {formatNumber(row.cards_made ?? 0)}
                      </span>
                    </AdminDetail>
                    <AdminDetail label="Activity date">
                      {row.activity_date ? formatDate(row.activity_date) : "Not given"}
                    </AdminDetail>
                    <AdminDetail label="Age group">
                      {row.age_group ?? "Not given"}
                      {isGuardianSubmission(row.age_group) ? (
                        <span className="mt-1 block text-sm text-brown-mid">
                          Submitted by a parent, guardian, or teacher — the name and email above
                          are the adult&apos;s, not the child&apos;s.
                        </span>
                      ) : null}
                    </AdminDetail>

                    <AdminDetail label="Helping with" className="sm:col-span-2">
                      {row.activities?.length
                        ? row.activities.map(activityLabel).join(", ")
                        : "Not given"}
                    </AdminDetail>

                    <AdminDetail label="Proof of cards" className="sm:col-span-2">
                      {row.proof_path ? (
                        proofUrl ? (
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
                          >
                            Open the uploaded file ↗
                            <span className="ml-1 font-body text-sm font-normal text-brown-mid">
                              (link expires in 30 minutes)
                            </span>
                          </a>
                        ) : (
                          <span className="text-brown-mid">
                            A file was uploaded, but the link couldn&apos;t be generated. Reload, or
                            look for{" "}
                            <code className="font-body">{row.proof_path}</code> in the{" "}
                            <span className="font-bold">volunteer-proof</span> storage bucket.
                          </span>
                        )
                      ) : (
                        <span className="text-brown-mid">No photo attached.</span>
                      )}
                    </AdminDetail>

                    {row.notes ? (
                      <AdminDetail label="Their notes" className="sm:col-span-2 lg:col-span-4">
                        <p className="whitespace-pre-wrap">{row.notes}</p>
                      </AdminDetail>
                    ) : null}

                    {row.reviewed_at || row.reviewer_note ? (
                      <AdminDetail label="Review" className="sm:col-span-2 lg:col-span-4">
                        {row.reviewed_at ? (
                          <span className="text-brown-mid">
                            Reviewed {formatDate(row.reviewed_at)}.{" "}
                          </span>
                        ) : null}
                        {row.reviewer_note ? (
                          <span className="whitespace-pre-wrap">
                            &ldquo;{row.reviewer_note}&rdquo;
                          </span>
                        ) : null}
                      </AdminDetail>
                    ) : null}
                  </dl>
                </AdminListItem>
              );
            })}
          </AdminList>
        )}
      </section>
    </div>
  );
}
