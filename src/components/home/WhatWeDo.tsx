import { CoinJar, GreetingCard, OpenBook } from "@/components/illustrations/Objects";
import { LinkCard } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";

const things = [
  {
    href: "/volunteer",
    title: "Cards for kids in hospitals",
    body: "Volunteers draw and write cards at home, then send us a photo. We get them to children who are in treatment.",
    linkLabel: "See how card-making works",
    art: <GreetingCard className="h-16 w-20" />,
  },
  {
    href: "/blog",
    title: "Stories worth telling",
    body: "Patients, siblings, and caregivers write about what it is actually like. An editor reads every submission before it goes up.",
    linkLabel: "Read the stories",
    art: <OpenBook className="h-16 w-22" />,
  },
  {
    href: "/donate",
    title: "Money for research",
    body: "Donations cover paper, envelopes, and postage, and the rest goes to cancer research. We show the split on the Donate page.",
    linkLabel: "See where the money goes",
    art: <CoinJar className="h-16 w-15" />,
  },
];

export function WhatWeDo() {
  return (
    <Section tone="cream">
      <SectionHeading
        eyebrow="What we do"
        title="Three things, done carefully"
        subtitle="Cards, stories, and research money. That is the whole list, and we would rather do three things well."
      />

      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {things.map((thing) => (
          <li key={thing.href} className="h-full">
            <LinkCard
              href={thing.href}
              label={thing.linkLabel}
              seed={thing.title}
              className="flex h-full flex-col items-start p-6 sm:p-7"
            >
              <div className="flex h-16 items-end">{thing.art}</div>
              <h3 className="mt-4 text-xl sm:text-2xl">{thing.title}</h3>
              <p className="mt-2 text-brown-mid">{thing.body}</p>
              <span
                aria-hidden="true"
                className="mt-auto pt-4 font-display font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4 group-hover:text-berry"
              >
                {thing.linkLabel} →
              </span>
            </LinkCard>
          </li>
        ))}
      </ul>
    </Section>
  );
}
