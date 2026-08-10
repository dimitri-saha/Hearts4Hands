import type { Metadata } from "next";

import { Audience } from "@/components/about/Audience";
import { Team } from "@/components/about/Team";
import { Timeline } from "@/components/about/Timeline";
import { Values } from "@/components/about/Values";
import { HeartRule, ScallopEdge, TornEdge, WaveEdge } from "@/components/illustrations/Dividers";
import { HandsHeart } from "@/components/illustrations/Hearts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "About us",
  description:
    "How Hearts4Hands started, what we believe, and who is behind the cards. A student-led group making cards for kids in hospitals and raising money for cancer research.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="It started with paper and crayons"
        intro="Hearts4Hands is a student-led group. We make cards for kids in hospitals, publish stories written by volunteers, and raise money for cancer research."
        illustration={<HandsHeart className="h-36 w-40 sm:h-44 sm:w-48" />}
        nextTone="paper"
      />

      {/* ---------------------------------------------------------------- story */}
      <Section tone="paper" width="narrow">
        <SectionHeading eyebrow="Our story" title="A kid in a hospital bed should get mail" />

        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-lg text-brown">
          <p>
            A hospital room is a strange place to be a kid. The lights hum, the days blur, and
            almost everything that happens to you is decided by somebody else. Hearts4Hands started
            with one small idea about that: mail. Something that arrives with your name on it,
            drawn by a person who does not want anything from you.
          </p>
          <p>
            It began as a student project — a stack of construction paper, a box of crayons, and a
            long list of ideas. There was no office and no budget. There still is not much of
            either. What there is, is a way to turn an afternoon at a kitchen table into something
            that lands in a real kid&apos;s hands.
          </p>
          <p>
            Two things grew out of that. Volunteers kept telling us stories — about a sibling,
            about a diagnosis, about the year everything changed — so we built a place to publish
            them, with an editor reading every submission first. And because paper, envelopes, and
            stamps cost money, we started fundraising. Whatever is left after materials goes to
            cancer research.
          </p>
          <p>
            We are new, and we would rather say that plainly than pretend otherwise. What we can
            promise is how we work: handmade, open about where the money goes, and run by students
            who show up.
          </p>
        </div>

        <HeartRule className="mt-10" />
      </Section>
      <ScallopEdge color={sectionHex.cream} className="-mt-px bg-paper" />

      {/* ----------------------------------------------------------- milestones */}
      <Section tone="cream" width="narrow">
        <SectionHeading
          eyebrow="Milestones"
          title="How far we have come"
          subtitle="Short version: it is early days, and that is the fun part."
        />
        <Timeline />
      </Section>
      <TornEdge color={sectionHex.blush} className="-mt-px bg-cream" />

      {/* --------------------------------------------------------------- values */}
      <Section tone="blush">
        <SectionHeading
          eyebrow="What we believe"
          title="Four things we will not trade away"
        />
        <Values />
      </Section>
      <WaveEdge color={sectionHex.paper} className="-mt-px bg-blush" />

      {/* ----------------------------------------------------------------- team */}
      <Section tone="paper" id="team">
        <SectionHeading
          eyebrow="The team"
          title="Who is behind this"
          subtitle="Some of these seats are still empty. If one of them sounds like you, say so."
        />
        <Team />
      </Section>
      <ScallopEdge color={sectionHex.cream} className="-mt-px bg-paper" />

      {/* ------------------------------------------------------------- audience */}
      <Section tone="cream">
        <SectionHeading
          eyebrow="Who we are for"
          title="Three kinds of people keep this going"
        />
        <Audience />

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="font-hand text-lg text-brown-mid">
            Run a hospital program, a school club, or a company that wants to help?
          </p>
          <Button href="/contact" variant="outline">
            Partner with us
          </Button>
        </div>
      </Section>
      <TornEdge color={sectionHex.blush} from={sectionHex.cream} className="-mt-px" />

      {/* ----------------------------------------------------------- closing CTA
          Ends on a light tone so the footer's torn edge has paper-ish stock
          above it — see CLAUDE.md §11. */}
      <Section tone="blush" width="narrow" className="text-center">
        <h2 className="text-3xl sm:text-4xl">Two ways in</h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-brown">
          Make a card and log the hour, or send a few dollars toward paper and research. Both count.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/volunteer" size="lg">
            Volunteer with us
          </Button>
          <Button href="/donate" variant="outline" size="lg" alt>
            Donate
          </Button>
        </div>
      </Section>
    </>
  );
}
