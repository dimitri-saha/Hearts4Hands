import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminAlert,
  AdminCard,
  AdminPageHeader,
  AdminStat,
} from "@/components/admin";
import { requireAdmin } from "@/lib/auth";
import { getStats } from "@/lib/stats";
import { getServiceClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

import { StatsForm } from "./StatsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impact numbers",
  robots: { index: false, follow: false },
};

/** Cents → a plain dollars string for a number input. */
const dollars = (cents: number) => String(Math.round(cents) / 100);

export default async function AdminStatsPage() {
  await requireAdmin("/admin/stats");

  const stats = await getStats();
  const supabase = getServiceClient();

  const description =
    "The numbers on the home page and the Donate page. Nothing calculates these — an editor types them in, so they are only as fresh as the last time someone updated them.";

  if (!supabase) {
    return (
      <div className="flex flex-col gap-5">
        <AdminPageHeader title="Impact numbers" description={description} />
        <AdminAlert tone="note" title="No database connected yet">
          <p>
            Saving impact numbers writes to the <span className="font-bold">site_stats</span> row in
            Supabase, which needs{" "}
            <code className="font-body font-bold">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-body font-bold">SUPABASE_SERVICE_ROLE_KEY</code> set in the
            environment. Add them and reload to edit these.
          </p>
          <p className="mt-2">
            The site still works without them — it shows the fallback numbers from{" "}
            <code className="font-body font-bold">src/lib/site.ts</code>.
          </p>
        </AdminAlert>

        <AdminCard title="What the site is showing right now">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStat label="Total raised" value={formatCurrency(stats.totalRaisedCents)} />
            <AdminStat label="Goal" value={formatCurrency(stats.goalCents)} />
            <AdminStat label="Materials" value={formatCurrency(stats.materialsCents)} />
            <AdminStat label="Research" value={formatCurrency(stats.researchCents)} />
            <AdminStat label="Cards made" value={formatNumber(stats.cardsMade)} />
            <AdminStat label="Volunteers" value={formatNumber(stats.volunteers)} />
            <AdminStat label="Hours logged" value={formatNumber(stats.hoursLogged)} />
            <AdminStat label="Hospitals served" value={formatNumber(stats.hospitalsServed)} />
          </div>
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Impact numbers" description={description} />

      {/* --- Where these numbers came from ---------------------------------- */}
      <AdminCard>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="text-[0.95rem] text-brown">
            <span className="font-display font-bold text-berry">Last updated:</span>{" "}
            {stats.updatedAt ? formatDate(stats.updatedAt) : "never"}
            {stats.isLive ? null : (
              <span className="text-brown-mid">
                {" "}
                — these are still the built-in fallback numbers. Saving once replaces them with real
                ones.
              </span>
            )}
          </p>
        </div>
        {stats.note ? (
          <p className="mt-3 rounded-lg border border-brown-faint bg-cream px-3 py-2 text-[0.95rem] whitespace-pre-wrap text-brown">
            <span className="font-display font-bold text-berry">Note on file:</span> {stats.note}
          </p>
        ) : (
          <p className="mt-3 text-sm text-brown-mid">No note on file.</p>
        )}
      </AdminCard>

      {/* --- Where each number shows up ------------------------------------- */}
      <AdminCard title="Where these appear" description="So you know what you're changing.">
        <ul className="flex list-none flex-col gap-2 text-[0.95rem] text-brown">
          <li>
            <span className="font-display font-bold text-berry">Total raised</span> — the running
            total on{" "}
            <Link
              href="/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
            >
              /donate ↗
            </Link>
            , and the fill on the progress bar toward the goal.
          </li>
          <li>
            <span className="font-display font-bold text-berry">Goal</span> — the target that
            progress bar fills toward. If it&apos;s zero the bar reads as empty.
          </li>
          <li>
            <span className="font-display font-bold text-berry">Materials and research</span> — the
            two segments of the allocation bar on the Donate page. When both are zero the bar falls
            back to showing the planned 30 / 70 split, labelled as an intention rather than a fact.
          </li>
          <li>
            <span className="font-display font-bold text-berry">
              Cards, volunteers, hours, hospitals
            </span>{" "}
            — the impact tiles on the{" "}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
            >
              home page ↗
            </Link>{" "}
            and the About page.
          </li>
        </ul>
      </AdminCard>

      <AdminCard title="Update the numbers">
        <StatsForm
          initial={{
            totalRaised: dollars(stats.totalRaisedCents),
            materials: dollars(stats.materialsCents),
            research: dollars(stats.researchCents),
            goal: dollars(stats.goalCents),
            cardsMade: String(stats.cardsMade),
            volunteers: String(stats.volunteers),
            hoursLogged: String(stats.hoursLogged),
            hospitalsServed: String(stats.hospitalsServed),
            note: stats.note ?? "",
          }}
        />
      </AdminCard>

      <AdminAlert tone="note" title="How often should these change?">
        <p>
          There is no rule yet — the PRD leaves the cadence open (§9). A reasonable default until
          someone decides otherwise: <span className="font-bold">once a month</span>, and again
          within a few days of any fundraiser closing, so the number on the Donate page never
          trails reality by more than a campaign. Hours and cards are easiest to refresh right after
          a review session on{" "}
          <Link
            href="/admin/volunteers"
            className="text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
          >
            the volunteer hours page
          </Link>
          .
        </p>
      </AdminAlert>
    </div>
  );
}
