import type { Metadata } from "next";

import { Audience } from "@/components/about/Audience";
import { TeamPreview } from "@/components/about/TeamPreview";
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
    "How Hearts4Hands started, what we believe, and who is behind the cards. A student-led group making cards for patients in hospitals and raising money for cancer research.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="It started with paper and crayons"
        intro="Hearts4Hands is a student-led group. We make cards for patients in hospitals, publish stories written by volunteers, and raise money for cancer research."
        illustration={<HandsHeart className="h-36 w-40 sm:h-44 sm:w-48" />}
        nextTone="paper"
      />

      {/* ---------------------------------------------------------------- story */}
      <Section tone="paper" width="narrow">
        <SectionHeading eyebrow="Our story" title="Why We Started Hearts4Hands" />

        {/* A personal account in the founder's own words. Kept verbatim — this is
            not house copy to be edited for tone. */}
        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-lg text-brown">
          <p>
            In 2021, my grandfather passed away from cancer. But losing him wasn&apos;t what hurt
            the most.
          </p>
          <p>
            What hurt was watching him disappear years before that — in the summers I spent at his
            apartment in India. He was the man who sat with me at the dinner table while I drew,
            painted, and made bracelets, content just reading beside me. He taught me to ride a
            bike. He sat with me in silence on the nights my parents came home late from work, just
            so I wouldn&apos;t be alone. Cancer took all of that first. By the time I actually lost
            him, I had already lost the dada ji I remembered.
          </p>
          <p>
            Over the next five years, I watched family friends fight the same disease — receiving
            far better treatment here in the U.S. than my grandfather ever had in India. I watched
            my parents sit with them the way my grandfather once sat with me, listening as they
            relived experiences no one should have to go through alone.
          </p>

          <p className="border-l-4 border-pink-deep py-1 pl-5 font-display text-2xl leading-snug text-berry">
            A patient deserves support. So do the people who love them.
          </p>

          <p>
            Most of my creativity came from the quiet hours I spent with my grandfather.
            Hearts4Hands exists to send that same creativity back out — to patients who need
            someone in their corner, the way he was always in mine. But he wouldn&apos;t want us to
            stop at patients. He&apos;d want us supporting families too, which is why we built a
            blog where families can find what to expect, what to do, and proof that they&apos;re
            not alone.
          </p>
          <p className="font-display text-xl text-red-deep">
            Our creativity is our courage against cancer. It can be yours too.
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

      {/* ----------------------------------------------------------------- team
          The roster lives on /leadership, not here. `id="team"` stays because
          /about#team has been linked from the footer and may be bookmarked —
          the anchor now lands on the way through rather than a dead page. */}
      <Section tone="paper" id="team" width="narrow" className="text-center">
        <SectionHeading
          eyebrow="The team"
          title="Who is behind this"
          subtitle="The students who run Hearts4Hands — plus a few roles we are still trying to fill."
        />
        <TeamPreview />
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
