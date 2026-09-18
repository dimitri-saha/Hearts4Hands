import type { Metadata } from "next";
import Link from "next/link";

import { contact, site } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { GreetingCard, Envelope, Megaphone, OpenBook } from "@/components/illustrations/Objects";
import { HandsHeart, PawHeart } from "@/components/illustrations/Hearts";
import { ScallopEdge, TornEdge } from "@/components/illustrations/Dividers";
import { CheckMark } from "@/components/illustrations/Doodles";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions, story ideas, or a hospital that would like cards? Here's how to reach Hearts4Hands — and the fastest answers to the things people usually write in about.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact · ${site.name}`,
    description: "Say hello, pitch a story, or start a partnership.",
    url: `${site.url}/contact`,
  },
};

const inboxes = [
  {
    key: "general",
    title: "Anything at all",
    email: contact.general,
    blurb:
      "Questions about volunteering, a school club, or just saying hello. If you're not sure who to write to, write here.",
    art: <PawHeart className="h-14 w-14" />,
  },
  {
    key: "editor",
    title: "Stories & the blog",
    email: contact.editor,
    blurb:
      "Pitches, drafts, edits, and questions for our editors. Already finished a piece? The submission form is quicker.",
    art: <OpenBook className="h-14 w-16" />,
  },
  {
    key: "partnerships",
    title: "Hospitals & partners",
    email: contact.partnerships,
    blurb:
      "Child life teams, hospital volunteer offices, schools, and anyone who wants to work together.",
    art: <HandsHeart className="h-16 w-16" />,
  },
] as const;

const quickAnswers = [
  {
    href: "/volunteer",
    question: "I want to volunteer.",
    answer: "Everything you need is on the volunteer page — no email needed.",
  },
  {
    href: "/volunteer#log-hours",
    question: "I made cards and want to log my hours.",
    answer: "Use the hour log. Add a photo of your cards and we'll review it.",
  },
  {
    href: "/blog/submit",
    question: "I'd like to submit a story.",
    answer: "Send it straight to our editors through the submission form.",
  },
  {
    href: "/donate",
    question: "I want to donate.",
    answer: "All the ways to give, plus where the money goes, are on the donate page.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Come say hello"
        intro="We read every message. We're volunteers and mostly students, so give us a few days to write back — we promise we will."
        illustration={<Envelope className="h-32 w-40 sm:h-40 sm:w-52" />}
        nextTone="paper"
      />

      {/* --- Who to reach ---------------------------------------------------- */}
      <Section tone="paper" id="who-to-reach">
        <SectionHeading
          eyebrow="Who to reach"
          title="Three inboxes, all of them ours"
          subtitle="Pick whichever fits. If you get it wrong, we'll pass it along — nothing gets lost."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {inboxes.map((inbox) => (
            <Card
              key={inbox.key}
              as="article"
              tone="paper"
              seed={inbox.key}
              className="flex flex-col items-start gap-3 p-6"
            >
              <div className="flex h-16 items-end">{inbox.art}</div>
              <h3 className="text-xl">{inbox.title}</h3>
              <p className="text-brown-mid">{inbox.blurb}</p>
              <a
                href={`mailto:${inbox.email}`}
                className="mt-auto pt-2 font-display font-bold break-all text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4 hover:text-berry"
              >
                {inbox.email}
              </a>
            </Card>
          ))}
        </div>

        <Card
          tone="blush"
          seed="instagram"
          className="mt-8 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left"
        >
          <Megaphone className="h-12 w-16 shrink-0" />
          <p className="flex-1 text-brown">
            <span className="font-display font-bold text-berry">Somewhere less formal?</span> We
            post cards, calls for volunteers, and fundraiser news on Instagram — a DM is a perfectly
            good way to reach us.
          </p>
          <Button href={contact.instagram} variant="paper" size="sm" className="shrink-0">
            Find us on Instagram
          </Button>
        </Card>
      </Section>

      <ScallopEdge color={sectionHex.cream} />

      {/* --- Quick answers ---------------------------------------------------- */}
      <Section tone="cream" width="narrow">
        <SectionHeading
          eyebrow="Before you write"
          title="Quick answers"
          subtitle="Four things people email us about that already have a page — you'll get there faster than we can reply."
        />

        <ul className="mt-10 flex list-none flex-col gap-4">
          {quickAnswers.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-start gap-4 rough-2 border-[2.5px] border-brown/45 bg-paper p-5 no-underline transition-colors hover:border-red hover:bg-blush/60"
              >
                <CheckMark className="mt-1 h-6 w-6 shrink-0" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-display text-lg font-bold text-berry">{item.question}</span>
                  <span className="text-brown-mid">{item.answer}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="ml-auto self-center font-display text-2xl text-pink-deep transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <TornEdge color={sectionHex.paper} />

      {/* --- The form --------------------------------------------------------- */}
      {/* Not `id="message"` — the textarea inside already owns that id, and a
          duplicate would make getElementById return this section instead. */}
      <Section tone="paper" width="narrow" id="send-a-message">
        <SectionHeading
          eyebrow="Send a message"
          title="Write to us here"
          subtitle="Everything goes to a real person. Expect a reply within a few days."
        />

        <div className="mt-10">
          <ContactForm />
        </div>
      </Section>

      <TornEdge color={sectionHex.kraft} />

      {/* --- Hospitals & partners ---------------------------------------------- */}
      <Section tone="kraft" id="partners" width="narrow">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <GreetingCard className="h-24 w-28 shrink-0" />
          <div>
            <SectionHeading
              align="left"
              eyebrow="For hospitals & partner organizations"
              title="What working together looks like"
            />
            <div className="mt-6 flex flex-col gap-4 text-brown">
              <p>
                The short version: our volunteers make handmade cards, and you tell us what your
                unit needs. Every hospital has its own rules about what can come through the door —
                materials, sealed packaging, no glitter, no food, nothing with a patient&apos;s name
                on it, drop-off versus mail. Send us yours and we&apos;ll brief our volunteers on
                them before a single card is made.
              </p>
              <p>
                We can also talk about how many cards you&apos;d like and how often, whether they
                should suit a particular age range or season, and who on your side we should send
                them to.
              </p>
              <p>
                We&apos;re a small student-led group, so we&apos;d rather start with something we
                can keep up than promise more than we can deliver.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={`mailto:${contact.partnerships}`} variant="primary">
                Email our partnerships inbox
              </Button>
              <p className="text-sm text-brown-mid">
                or write to{" "}
                <a
                  href={`mailto:${contact.partnerships}`}
                  className="font-bold break-all text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
                >
                  {contact.partnerships}
                </a>
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
