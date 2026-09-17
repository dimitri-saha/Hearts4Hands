import Link from "next/link";

import { AwardRibbon, CoinJar, GreetingCard, Globe } from "@/components/illustrations/Objects";
import { HandsHeart } from "@/components/illustrations/Hearts";
import { Alert } from "@/components/ui/Feedback";
import { Section, SectionHeading } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/Stats";
import type { ImpactStats } from "@/lib/stats";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const inlineLink =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4 hover:text-berry";

/**
 * Impact snapshot (PRD §5.1).
 *
 * When the numbers are still the fallback zeros, a wall of proud noughts reads
 * as failure rather than as a beginning — so we say plainly that we are new and
 * invite the reader to be the first entry in the table.
 */
export function ImpactSnapshot({ stats }: { stats: ImpactStats }) {
  const empty =
    stats.totalRaisedCents === 0 &&
    stats.cardsMade === 0 &&
    stats.volunteers === 0 &&
    stats.hoursLogged === 0 &&
    stats.hospitalsServed === 0;
  const gettingStarted = !stats.isLive || empty;

  return (
    <Section tone="paper">
      <SectionHeading
        eyebrow="Where we are right now"
        title="The count so far"
        subtitle="Hours and cards are counted from work a real person has checked and approved, plus what the group did before this site existed. Money and hospitals we update by hand."
      />

      <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
        <li>
          <StatTile
            value={formatCurrency(stats.totalRaisedCents)}
            label="Raised so far"
            icon={<CoinJar className="h-12 w-11" />}
            className="h-full px-3 sm:px-5"
          />
        </li>
        <li>
          <StatTile
            value={formatNumber(stats.cardsMade)}
            label="Cards made"
            tone="blush"
            icon={<GreetingCard className="h-12 w-14" />}
            className="h-full px-3 sm:px-5"
          />
        </li>
        <li>
          <StatTile
            value={formatNumber(stats.volunteers)}
            label="Volunteers"
            tone="cream"
            icon={<Globe className="h-12 w-12" />}
            className="h-full px-3 sm:px-5"
          />
        </li>
        <li>
          <StatTile
            value={formatNumber(stats.hoursLogged)}
            label="Hours logged"
            icon={<AwardRibbon className="h-12 w-10" />}
            className="h-full px-3 sm:px-5"
          />
        </li>
        {/* Spans both columns on a phone so a fifth tile doesn't sit orphaned
            in a two-column grid. */}
        <li className="col-span-2 lg:col-span-1">
          <StatTile
            value={formatNumber(stats.hospitalsServed)}
            label={stats.hospitalsServed === 1 ? "Hospital reached" : "Hospitals reached"}
            tone="pink"
            icon={<HandsHeart className="h-12 w-14" />}
            className="h-full px-3 sm:px-5"
          />
        </li>
      </ul>

      {gettingStarted ? (
        <Alert tone="note" title="We are just getting started" className="mx-auto mt-8 max-w-3xl">
          <p>
            Hearts4Hands is new, so those numbers are still zero — and we would rather say that than
            dress it up. The first card, the first hour, and the first dollar have not happened yet.
            One of them could be yours.{" "}
            <Link href="/volunteer" className={inlineLink}>
              Be the first volunteer
            </Link>{" "}
            or{" "}
            <Link href="/donate" className={inlineLink}>
              chip in for paper and postage
            </Link>
            .
          </p>
        </Alert>
      ) : null}

      {stats.updatedAt ? (
        <p className="mt-6 text-center font-hand text-base text-brown-soft">
          Last updated {formatDate(stats.updatedAt)}
        </p>
      ) : null}
    </Section>
  );
}
