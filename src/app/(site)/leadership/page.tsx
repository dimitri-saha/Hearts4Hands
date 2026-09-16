import type { Metadata } from "next";

import { HeartRule, ScallopEdge, TornEdge } from "@/components/illustrations/Dividers";
import { Megaphone } from "@/components/illustrations/Objects";
import { LeadershipRoster } from "@/components/leadership/LeadershipRoster";
import { OpenRoles } from "@/components/leadership/OpenRoles";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "Apply to lead a Hearts4Hands chapter, edit stories, run social media, or plan fundraising — and meet the students already doing it.",
  alternates: { canonical: "/leadership" },
};

export default function LeadershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Leadership"
        title="Run this with us"
        intro="Hearts4Hands is student-led, which means these jobs belong to students. If one of them sounds like you, the form takes a few minutes."
        illustration={<Megaphone className="h-32 w-36 sm:h-40 sm:w-44" />}
        nextTone="paper"
      >
        <Button href="#current" variant="outline">
          Meet the current team
        </Button>
      </PageHeader>

      {/* ------------------------------------------------------------ apply */}
      <Section tone="paper" id="apply">
        <SectionHeading
          eyebrow="Open positions"
          title="Pick the one that sounds like you"
          subtitle="Every application is read by a person. You do not need experience — you need to be someone who shows up."
        />
        <OpenRoles />

        <p className="mx-auto mt-8 max-w-xl text-center font-hand text-lg text-brown-mid">
          Not sure which one fits? Apply for the Vice President Intern role and say so in the
          form — it is the one built for that.
        </p>

        <HeartRule className="mt-10" />
      </Section>
      <ScallopEdge color={sectionHex.cream} className="-mt-px bg-paper" />

      {/* -------------------------------------------------------- the roster */}
      <Section tone="cream" id="current">
        <SectionHeading
          eyebrow="Current leadership"
          title="The people already doing it"
          subtitle="Students in different cities, all of whom started by making one card."
        />
        <LeadershipRoster />
      </Section>
      <TornEdge color={sectionHex.blush} from={sectionHex.cream} className="-mt-px" />

      {/* --------------------------------------------------------- closing */}
      <Section tone="blush" width="narrow" className="text-center">
        <h2 className="text-3xl sm:text-4xl">Not ready to lead yet?</h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-brown">
          That is completely fine. Make a card, log the hour, and see how it feels. Most of the
          people above started exactly there.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/volunteer" size="lg">
            Volunteer with us
          </Button>
          <Button href="/contact" variant="outline" size="lg" alt>
            Ask us a question
          </Button>
        </div>
      </Section>
    </>
  );
}
