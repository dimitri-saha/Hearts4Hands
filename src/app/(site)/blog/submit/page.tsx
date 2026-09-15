import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { SubmitForm } from "@/components/blog/SubmitForm";
import { SignInPrompt } from "@/components/account/SignInPrompt";
import { getVolunteer, isGuardianAccount } from "@/lib/volunteer-auth";
import { HeartRule, TornEdge } from "@/components/illustrations/Dividers";
import { CheckMark, Squiggle } from "@/components/illustrations/Doodles";
import { Crayon, Envelope, OpenBook, PaperPlane } from "@/components/illustrations/Objects";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";
import { blogCategories, contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Share your story",
  description:
    "Send us a story about cancer, caregiving, or something you learned along the way. An editor reads every submission, and nothing is published without your OK.",
  alternates: { canonical: "/blog/submit" },
};

/**
 * Editorial guidelines.
 *
 * PRD §9 leaves these open; CLAUDE.md §10 puts the answer here rather than in
 * a policy doc, so this list is the site's working guidance. The hard limits
 * (200 characters minimum, 40,000 maximum) come from `blogSubmissionSchema`.
 */
const guidelines: { title: string; body: ReactNode }[] = [
  {
    title: "Write in your own voice",
    body: "Say it the way you'd say it out loud. We'd rather read something plain and true than something polished.",
  },
  {
    title: "Around 300 to 1,200 words",
    body: "That's the sweet spot — long enough to say something, short enough to finish. Shorter is fine; the form just needs 200 characters to start.",
  },
  {
    title: "Change or leave out other people's names",
    body: "Your story is yours to tell. Other people's is theirs. Initials, a nickname, or just \"my brother\" all work.",
  },
  {
    title: "No medical advice",
    body: "Describe what happened to you as much as you like. Please don't tell readers what treatment to seek or skip — everyone's situation is different.",
  },
  {
    title: "We may lightly copy-edit",
    body: "Mostly typos, clarity, and headings. If we change anything that matters, we send it back to you first.",
  },
  {
    title: "Nothing goes live without your OK",
    body: "You get the final read. You can also ask to publish under a first name only, or pull your story later.",
  },
];

const steps = [
  {
    n: "1",
    title: "You send it",
    body: "Fill in the form below. Your draft saves in your browser as you type, so you can stop and come back.",
    art: <PaperPlane className="h-16 w-20" />,
  },
  {
    n: "2",
    title: "A real person reads it",
    body: "Right now that's one of our founders, until we've recruited volunteer editors. Usually within a couple of weeks.",
    art: <OpenBook className="h-16 w-22" />,
  },
  {
    n: "3",
    title: "We email you first",
    body: "You'll see any suggested edits and the publish date before anything appears on the site.",
    art: <Envelope className="h-16 w-20" />,
  },
];

export default async function SubmitStoryPage() {
  const volunteer = await getVolunteer();
  const guardian = isGuardianAccount(volunteer);

  return (
    <>
      <PageHeader
        eyebrow="Share your story"
        title="You don't have to be a writer"
        intro="If something happened to you — or to someone you love — and you'd like other people to read about it, we'd like to publish it. Bad spelling welcome."
        illustration={<Crayon className="h-36 w-12 animate-wiggle-slow sm:h-44 sm:w-14" />}
        tone="blush"
        nextTone="cream"
      >
        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
          <Button href="#write" size="lg">
            Start writing
          </Button>
          <Button href="/blog" variant="outline" size="lg" alt>
            Read other stories
          </Button>
        </div>
      </PageHeader>

      {/* --- Before you write ------------------------------------------------ */}
      <Section tone="cream" id="guidelines">
        <SectionHeading
          eyebrow="Before you write"
          title="A few gentle guidelines"
          subtitle="Not rules so much as what tends to work. If you're unsure about any of it, send it anyway and we'll talk it through."
          level={2}
        />

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {guidelines.map((item) => (
            <li key={item.title} className="flex">
              <Card seed={item.title} className="flex w-full items-start gap-3.5 p-5">
                <CheckMark className="mt-1 h-6 w-6 shrink-0" />
                <div>
                  <p className="font-display text-lg font-bold text-berry">{item.title}</p>
                  <p className="mt-1 text-brown-mid">{item.body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <HeartRule className="mt-12" />

        <h3 className="mt-10 text-center text-2xl">The three kinds of story we publish</h3>
        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {blogCategories.map((category) => (
            <li key={category.value} className="flex">
              <Card
                seed={`cat-${category.value}`}
                tone="blush"
                className="flex w-full flex-col gap-2 p-5"
              >
                <Squiggle className="h-4 w-14" />
                <p className="font-display text-lg font-bold text-berry">{category.label}</p>
                <p className="text-brown-mid">{category.blurb}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <TornEdge color={sectionHex.paper} className="-mt-px" />

      {/* --- What happens next ----------------------------------------------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="What happens next"
          title="Three steps, no surprises"
          level={2}
        />

        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="flex">
              <Card
                seed={`step-${step.n}`}
                tone="cream"
                className="flex w-full flex-col items-center gap-3 p-6 text-center"
              >
                <span className="flex h-11 w-11 items-center justify-center rough-pill border-[2.5px] border-brown bg-red font-display text-xl font-bold text-paper">
                  {step.n}
                </span>
                <div aria-hidden="true">{step.art}</div>
                <p className="font-display text-lg font-bold text-berry">{step.title}</p>
                <p className="text-brown-mid">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-brown-mid">
          Questions before you send anything? Email{" "}
          <a
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href={`mailto:${contact.editor}`}
          >
            {contact.editor}
          </a>
          .
        </p>
      </Section>

      <TornEdge color={sectionHex.blush} className="-mt-px" />

      {/* --- The form ---------------------------------------------------------- */}
      <Section tone="blush" width="narrow" id="write">
        <SectionHeading
          eyebrow="Your story"
          title="Send it over"
          subtitle="Everything except your location is required. Your email is only used to talk with you about your story."
          level={2}
        />

        {volunteer ? (
          guardian ? (
            <Alert tone="note" title="Not from this account" className="mt-10">
              <p>
                This account is looked after by a parent or guardian for a volunteer under 13.
                Publishing a child&apos;s writing under their name needs a different kind of
                permission than an account can carry, so we don&apos;t take story submissions here.
              </p>
              <p className="mt-2">
                Card-making hours are very welcome —{" "}
                <Link
                  className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
                  href="/account/hours"
                >
                  log them here
                </Link>
                .
              </p>
            </Alert>
          ) : (
            <Card tone="paper" seed="story-form" className="mt-10 p-6 sm:p-9">
              <SubmitForm />
            </Card>
          )
        ) : (
          <div className="mt-10">
            <SignInPrompt
              signedIn={false}
              title="Sending a story needs an account"
              reason="So we can email you about edits, so nothing is published without your say-so, and so you can withdraw it later if you change your mind."
              href="/blog/submit"
              cta="Write your story"
            />
          </div>
        )}
      </Section>
    </>
  );
}
