import Link from "next/link";

import {
  getMyGroups,
  getMyHourEntries,
  getMyPublishedStories,
  getMyStoriesInReview,
  totalsFor,
} from "@/lib/account-data";
import { categoryLabel } from "@/lib/site";
import { formatDate, formatNumber } from "@/lib/utils";
import { isGuardianAccount, requireVolunteer, volunteerName } from "@/lib/volunteer-auth";
import { Button } from "@/components/ui/Button";
import { Card, Tag } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/Feedback";
import { StatTile } from "@/components/ui/Stats";
import { HeartTrio } from "@/components/illustrations/Hearts";
import { AwardRibbon, GreetingCard, OpenBook } from "@/components/illustrations/Objects";

const linkClass =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4";

const statusTone = {
  approved: { tone: "leaf", label: "Counted" },
  pending: { tone: "cream", label: "Waiting on us" },
  rejected: { tone: "red", label: "Not counted" },
} as const;

export default async function AccountPage() {
  const volunteer = await requireVolunteer("/account");
  const guardian = isGuardianAccount(volunteer);

  const [entries, stories, inReview, groups] = await Promise.all([
    getMyHourEntries(),
    getMyPublishedStories(),
    getMyStoriesInReview(),
    getMyGroups(volunteer.id),
  ]);

  const totals = totalsFor(entries);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="font-hand text-lg tracking-[0.14em] text-red-deep uppercase">Your account</p>
        <h1 className="text-3xl sm:text-4xl">
          Hello, {volunteerName(volunteer)}
          <HeartTrio className="ml-3 inline-block h-8 w-14 align-middle" />
        </h1>
        {guardian ? (
          <p className="text-brown-mid">
            You&apos;re looking after this account on behalf of a young volunteer. Everything comes
            to <strong className="font-display text-berry">{volunteer.email}</strong>.
          </p>
        ) : null}
      </header>

      {/* ---------------- totals ---------------- */}
      <section aria-labelledby="totals-heading" className="flex flex-col gap-4">
        <h2 id="totals-heading" className="text-2xl">
          What you&apos;ve done so far
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            value={formatNumber(totals.approvedHours)}
            label="Hours counted"
            hint="Checked and approved by us"
            icon={<AwardRibbon className="h-12 w-9" />}
          />
          <StatTile
            value={formatNumber(totals.approvedCards)}
            label="Cards made"
            tone="blush"
            icon={<GreetingCard className="h-11 w-14" />}
          />
          <StatTile
            value={formatNumber(stories.length)}
            label={stories.length === 1 ? "Story published" : "Stories published"}
            tone="cream"
            icon={<OpenBook className="h-11 w-14" />}
          />
        </div>

        {totals.pendingCount > 0 ? (
          <Alert tone="note">
            <p>
              <strong className="font-display text-berry">
                {formatNumber(totals.pendingHours)} more{" "}
                {totals.pendingHours === 1 ? "hour is" : "hours are"} waiting to be checked
              </strong>{" "}
              across {totals.pendingCount}{" "}
              {totals.pendingCount === 1 ? "entry" : "entries"}. A real person reads every one, so
              give it a couple of weeks. They&apos;ll be added to your total once approved.
            </p>
          </Alert>
        ) : null}
      </section>

      {/* ---------------- hour entries ---------------- */}
      <section aria-labelledby="entries-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="entries-heading" className="text-2xl">
            Everything you&apos;ve logged
          </h2>
          <Button href="/account/hours" size="sm">
            Log more hours
          </Button>
        </div>

        {entries.length === 0 ? (
          <EmptyState title="Nothing logged yet.">
            <p>
              Made some cards already?{" "}
              <Link className={linkClass} href="/account/hours">
                Add them here
              </Link>
              . Not sure where to start? The{" "}
              <Link className={linkClass} href="/volunteer#how-to-make-a-card">
                card-making guide
              </Link>{" "}
              walks you through it.
            </p>
          </EmptyState>
        ) : (
          <ul className="flex list-none flex-col gap-3">
            {entries.map((entry) => {
              const status = statusTone[entry.status];
              return (
                <Card as="li" key={entry.id} seed={entry.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <p className="font-display text-lg font-bold text-berry">
                      {formatNumber(Number(entry.hours))}{" "}
                      {Number(entry.hours) === 1 ? "hour" : "hours"}
                      {entry.cards_made > 0 ? (
                        <span className="font-body text-base font-normal text-brown">
                          {" "}
                          · {formatNumber(entry.cards_made)}{" "}
                          {entry.cards_made === 1 ? "card" : "cards"}
                        </span>
                      ) : null}
                    </p>
                    <Tag tone={status.tone}>{status.label}</Tag>
                  </div>

                  <p className="mt-1 text-sm text-brown-mid">
                    {entry.activity_date
                      ? `Made on ${formatDate(entry.activity_date)}`
                      : `Logged ${formatDate(entry.created_at)}`}
                    {entry.proof_path ? " · photo attached" : null}
                  </p>

                  {entry.notes ? (
                    <p className="mt-2 text-[0.95rem] text-brown">{entry.notes}</p>
                  ) : null}

                  {entry.status === "rejected" ? (
                    <p className="mt-3 rounded-lg border border-red/40 bg-red/5 px-3 py-2 text-sm text-brown">
                      <strong className="font-display text-berry">Why: </strong>
                      {entry.reviewer_note?.trim() ||
                        "No reason was recorded. Email us and we'll explain — it's usually something small."}
                    </p>
                  ) : null}
                </Card>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------------- stories ---------------- */}
      <section aria-labelledby="stories-heading" className="flex flex-col gap-4">
        <h2 id="stories-heading" className="text-2xl">
          Your stories
        </h2>

        {guardian ? (
          <Alert tone="note">
            <p>
              Story submissions aren&apos;t available on an under-13 account. Publishing a
              child&apos;s writing under their name needs a different kind of permission than an
              account can carry, so we don&apos;t collect it at all.
            </p>
          </Alert>
        ) : (
          <>
            {inReview > 0 ? (
              <Alert tone="note">
                <p>
                  {inReview === 1 ? "One story is" : `${inReview} stories are`} with our editors.
                  We&apos;ll email you before anything goes live.
                </p>
              </Alert>
            ) : null}

            {stories.length === 0 ? (
              <EmptyState title="Nothing published yet.">
                <p>
                  You don&apos;t have to be a writer.{" "}
                  <Link className={linkClass} href="/blog/submit">
                    Send us something
                  </Link>{" "}
                  and an editor will read it.
                </p>
              </EmptyState>
            ) : (
              <ul className="flex list-none flex-col gap-3">
                {stories.map((story) => (
                  <Card as="li" key={story.slug} seed={story.slug} className="px-5 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <Link href={`/blog/${story.slug}`} className="font-display text-lg font-bold text-berry hover:underline">
                        {story.title}
                      </Link>
                      <Tag tone="pink">{categoryLabel(story.category)}</Tag>
                    </div>
                    <p className="mt-1 text-sm text-brown-mid">
                      Live since {story.published_at ? formatDate(story.published_at) : "recently"}
                    </p>
                  </Card>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* ---------------- groups ---------------- */}
      <section aria-labelledby="groups-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="groups-heading" className="text-2xl">
            Your club
          </h2>
          <Button href="/account/groups" size="sm" variant="outline" alt>
            {groups.length ? "Manage" : "Join or start one"}
          </Button>
        </div>

        {groups.length === 0 ? (
          <EmptyState title="You're not in a club.">
            <p>
              Volunteering with a school club or a group of friends? Hours can be pooled into one
              total.{" "}
              <Link className={linkClass} href="/account/groups">
                Join one with a code, or start your own
              </Link>
              .
            </p>
          </EmptyState>
        ) : (
          <ul className="grid list-none gap-4 sm:grid-cols-2">
            {groups.map((m) => (
              <Card as="li" key={m.group.id} seed={m.group.id} tone="cream" className="px-5 py-4">
                <p className="font-display text-lg font-bold text-berry">{m.group.name}</p>
                {m.group.organisation ? (
                  <p className="text-sm text-brown-mid">{m.group.organisation}</p>
                ) : null}
                <p className="mt-2 text-brown">
                  <strong className="font-display">{formatNumber(m.groupHours)}</strong> hours
                  between {formatNumber(m.memberCount)}{" "}
                  {m.memberCount === 1 ? "member" : "members"}
                </p>
                {m.role === "leader" ? (
                  <p className="mt-1 font-hand text-base text-red-deep">You run this one</p>
                ) : null}
              </Card>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
