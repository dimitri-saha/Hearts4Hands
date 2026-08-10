import type { Metadata } from "next";

import { contact } from "@/lib/site";
import { allocationSplit, getStats, goalProgress } from "@/lib/stats";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";
import { AllocationBar, ProgressBar } from "@/components/ui/Stats";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScallopEdge, TornEdge, WaveEdge } from "@/components/illustrations/Dividers";
import { CoinJar, Megaphone } from "@/components/illustrations/Objects";
import { HeartTrio } from "@/components/illustrations/Hearts";
import { Star } from "@/components/illustrations/Doodles";
import { GiveOptions } from "@/components/donate/GiveOptions";

/**
 * Impact numbers are edited by hand in /admin, which calls `revalidatePath`.
 * This is the belt-and-braces path: it also picks up changes made straight in
 * the Supabase dashboard, within ten minutes.
 */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Give through GoFundMe, Venmo, or PayPal. Every dollar is split between card-making materials and cancer research, and the running total is published here.",
  alternates: { canonical: "/donate" },
};

const giftTiers = [
  {
    amount: "$10",
    title: "A kitchen table, stocked",
    body: "Card stock, envelopes, and a fresh box of crayons for one volunteer to work through.",
  },
  {
    amount: "$25",
    title: "A classroom's worth of cards",
    body: "Materials and postage for a class or club to make and mail a batch together.",
  },
  {
    amount: "$100",
    title: "A card drive, start to stamp",
    body: "Everything a whole school drive needs, with the rest going straight into the research share.",
  },
];

const otherWays = [
  {
    title: "Send materials instead of money",
    body: "Card stock, blank cards, envelopes, and stamps all get used. Email us and we'll tell you what we're short on.",
    href: `mailto:${contact.general}`,
    cta: "Email us",
  },
  {
    title: "Run a fundraiser",
    body: "A bake sale, an art auction, a lemonade stand. We'll help you plan it and share it.",
    href: "/volunteer",
    cta: "Start one",
  },
  {
    title: "Ask about matching gifts",
    body: "Plenty of workplaces match what their employees give. Ask yours, and email us for whatever paperwork they need.",
    href: `mailto:${contact.general}`,
    cta: "Ask us for details",
  },
  {
    title: "Share the site",
    body: "Tell one person who might make a card. That's genuinely how most of our volunteers found us.",
    href: contact.instagram,
    cta: "Find us on Instagram",
  },
];

export default async function DonatePage() {
  const stats = await getStats();
  const split = allocationSplit(stats);
  const progress = goalProgress(stats);
  const hasRaised = stats.isLive && stats.totalRaisedCents > 0;

  return (
    <>
      <PageHeader
        eyebrow="Donate"
        title="Crayons, envelopes, stamps — and research."
        intro="Every dollar does one of two jobs: it buys the materials that make a card, or it goes toward cancer research. We publish the split right here."
        illustration={<CoinJar className="h-44 w-40 sm:h-52 sm:w-48" />}
        tone="blush"
        nextTone="paper"
      />

      {/* --- Running total -------------------------------------------------- */}
      <Section tone="paper" width="narrow">
        <Card tone="cream" seed="running-total" className="px-6 py-9 sm:px-10 sm:py-11">
          {hasRaised ? (
            <div className="text-center">
              <p className="font-hand text-lg tracking-[0.14em] text-red-deep uppercase">
                Raised so far
              </p>
              <p className="font-display text-6xl leading-none font-bold text-red-deep sm:text-7xl">
                {formatCurrency(stats.totalRaisedCents)}
              </p>
              <p className="mt-3 text-brown-mid">
                toward our {formatCurrency(stats.goalCents)} goal
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-hand text-lg tracking-[0.14em] text-red-deep uppercase">
                Just getting started
              </p>
              <h2 className="mt-1 text-3xl sm:text-4xl">Be the first</h2>
              <p className="mx-auto mt-3 max-w-prose text-brown-mid">
                Nobody has given yet, so the bar below is waiting. Our first goal is{" "}
                {formatCurrency(stats.goalCents)} — enough materials to keep cards going out all
                year, with the rest to research. Raised so far:{" "}
                {formatCurrency(stats.totalRaisedCents)}.
              </p>
            </div>
          )}

          <ProgressBar
            value={progress}
            className="mt-8"
            caption={
              hasRaised
                ? `${progress}% of the way to ${formatCurrency(stats.goalCents)}.`
                : `The first gift is the one that gets this moving.`
            }
          />

          <div className="mt-9">
            <h3 className="text-xl">Where it goes</h3>
            <AllocationBar {...split} className="mt-3" />
          </div>

          <div className="mt-8 border-t-2 border-dashed border-brown-faint pt-5 text-sm text-brown-mid">
            {stats.updatedAt ? <p>Last updated {formatDate(stats.updatedAt)}.</p> : null}
            {stats.note ? <p className="mt-1">{stats.note}</p> : null}
            <p className="mt-1">
              A volunteer updates this total by hand after checking each platform, so it can lag a
              gift or two behind. If your donation isn&apos;t showing up after a while, tell us and
              we&apos;ll fix it.
            </p>
          </div>
        </Card>
      </Section>

      <div className="bg-paper">
        <WaveEdge color={sectionHex.cream} />
      </div>

      {/* --- Three ways to give ---------------------------------------------- */}
      <Section tone="cream">
        <SectionHeading
          eyebrow="Three ways to give"
          title="Pick whichever is easiest"
          subtitle="We don't take payments on this site. Every button here hands you off to a service you already trust."
        />

        <GiveOptions />
      </Section>

      <div className="bg-cream">
        <TornEdge color={sectionHex.paper} />
      </div>

      {/* --- What your gift buys --------------------------------------------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="What it buys"
          title="In real things"
          subtitle="Rough examples, so a number on a screen turns into something you can picture."
        />

        <ul className="mt-12 grid list-none gap-6 sm:grid-cols-3">
          {giftTiers.map((tier) => (
            <Card
              as="li"
              key={tier.amount}
              seed={tier.amount}
              tone="blush"
              className="flex flex-col gap-2 px-6 py-7"
            >
              <p className="font-display text-4xl leading-none font-bold text-red-deep">
                {tier.amount}
              </p>
              <h3 className="mt-1 text-xl">{tier.title}</h3>
              <p className="text-brown-mid">{tier.body}</p>
            </Card>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-2xl text-center text-brown-mid">
          These are illustrations, not promises. Paper and postage prices move around, and gifts
          are pooled rather than earmarked — whatever isn&apos;t spent on materials goes into the
          research share above.
        </p>
      </Section>

      <div className="bg-paper">
        <ScallopEdge color={sectionHex.blush} />
      </div>

      {/* --- Other ways to help ---------------------------------------------- */}
      <Section tone="blush">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-12">
          <Megaphone className="h-24 w-28 shrink-0 animate-float" />
          <div>
            <SectionHeading
              eyebrow="Not just money"
              title="Other ways to help"
              align="left"
              subtitle="Giving isn't the only useful thing you can do, and it isn't the most useful thing for everybody."
            />
          </div>
        </div>

        <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2">
          {otherWays.map((way) => (
            <Card
              as="li"
              key={way.title}
              seed={way.title}
              tone="paper"
              className="flex flex-col items-start gap-2 px-6 py-7"
            >
              <Star className="h-6 w-6" />
              <h3 className="text-xl">{way.title}</h3>
              <p className="text-brown-mid">{way.body}</p>
              <div className="mt-auto pt-4">
                <Button href={way.href} variant="paper" size="sm">
                  {way.cta}
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      </Section>

      <div className="bg-blush">
        <TornEdge color={sectionHex.paper} />
      </div>

      {/* --- Where the money goes -------------------------------------------- */}
      <Section tone="paper" width="narrow">
        <SectionHeading eyebrow="Straight answers" title="Where the money goes" />

        <div className="mt-8 flex flex-col gap-4 text-brown-mid">
          <p>
            Every dollar is split two ways. The materials share buys paper, envelopes, and postage
            so volunteers never have to pay to take part. The research share is granted to
            established cancer research organizations.
          </p>
          <p>
            We publish the numbers on this page and update them by hand as gifts come in. If a
            number here ever looks wrong to you, please say so — we&apos;d rather be corrected than
            look tidy.
          </p>
          <p>
            We&apos;re a small student-led group, so if you need to know about tax status before you
            give, email{" "}
            <a
              className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
              href={`mailto:${contact.general}`}
            >
              {contact.general}
            </a>{" "}
            and we&apos;ll tell you exactly where we stand rather than guess in a footnote.
          </p>
        </div>

        <Alert tone="note" className="mt-8">
          <p>
            We never take card details on this site. If a page ever asks you for them in our name,
            it isn&apos;t us — please let us know.
          </p>
        </Alert>
      </Section>

      <div className="bg-paper">
        <WaveEdge color={sectionHex.kraft} />
      </div>

      {/* --- Closing CTA ------------------------------------------------------ */}
      <Section tone="kraft" width="narrow">
        <div className="flex flex-col items-center gap-5 text-center">
          <HeartTrio className="h-20 w-28" />
          <h2 className="text-3xl sm:text-4xl">Would you rather give time?</h2>
          <p className="max-w-prose text-brown-mid">
            That works just as well. An afternoon, some crayons, and a stack of paper turns into
            mail that makes a kid laugh.
          </p>
          <Button href="/volunteer" size="lg">
            Volunteer instead
          </Button>
        </div>
      </Section>
    </>
  );
}
