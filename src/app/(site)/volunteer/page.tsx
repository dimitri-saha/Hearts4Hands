import type { Metadata } from "next";
import type { ComponentType } from "react";

import { contact, volunteerActivities } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Card, LinkCard } from "@/components/ui/Card";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScallopEdge, TornEdge, WaveEdge } from "@/components/illustrations/Dividers";
import { CheckMark, Star } from "@/components/illustrations/Doodles";
import { Heart } from "@/components/illustrations/Hearts";
import {
  AwardRibbon,
  CoinJar,
  CrayonBundle,
  Envelope,
  GreetingCard,
  Megaphone,
  OpenBook,
} from "@/components/illustrations/Objects";
import type { IllustrationProps } from "@/components/illustrations/types";
import { CrossMark } from "@/components/volunteer/CrossMark";
import { FaqList, type FaqItem } from "@/components/volunteer/FaqList";
import { getVolunteer } from "@/lib/volunteer-auth";
import { SignInPrompt } from "@/components/account/SignInPrompt";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Make cards for kids in hospitals, fundraise, write, or bring Hearts4Hands to your school. Log your hours here — all you need is paper and something colorful.",
  alternates: { canonical: "/volunteer" },
};

/** Which drawing sits on which activity card. */
const activityArt: Record<string, ComponentType<IllustrationProps>> = {
  cards: GreetingCard,
  fundraising: CoinJar,
  writing: OpenBook,
  outreach: Megaphone,
};

const yesPlease = [
  "Lots of color. Fill the paper corner to corner — bright beats tidy.",
  "Something to look at twice: a joke, a maze, a tiny animal hiding in the corner.",
  "A short, warm note. Two sentences is plenty.",
  "Your first name at the bottom, and your age if you want to.",
];

const pleaseSkip = [
  "Glitter. Hospitals ask us not to send it, and it gets everywhere.",
  "“Get well soon.” Some kids are in treatment a long time, and it can land like a deadline.",
  "Anything naming a specific illness or treatment.",
  "Religious messages — we can't know what each family believes.",
  "Your address, phone number, email, or last name.",
];

const whatYouNeed = [
  "Paper or card stock — construction paper is great",
  "Crayons, markers, or colored pencils",
  "An envelope, once your cards are done",
];

const faqs: FaqItem[] = [
  {
    question: "Do I need to be a certain age?",
    answer: (
      <>
        <p>
          No. We have volunteers in elementary school and volunteers in college. If you&apos;re
          under 18, check with a parent or guardian before you sign up, and ask them to help with
          the mailing part.
        </p>
        <p className="mt-2">
          If the volunteer is <strong>under 13</strong>, a parent, guardian, or teacher fills the
          form in instead. We don&apos;t ask for a young child&apos;s name, email, or school at
          all — the grown-up is our contact, and the cards still count. Pick &ldquo;Under
          13&rdquo; in the form and it switches over on its own.
        </p>
      </>
    ),
  },
  {
    question: "Can I volunteer from outside the US?",
    answer: (
      <p>
        Yes. Our volunteers are students all over the world. Making cards, fundraising, writing,
        and outreach all work from anywhere. Volunteer awards have their own eligibility rules,
        though — email us at{" "}
        <a
          className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
          href={`mailto:${contact.general}`}
        >
          {contact.general}
        </a>{" "}
        and we&apos;ll walk through them with you before you count on one.
      </p>
    ),
  },
  {
    question: "How long until my hours are approved?",
    answer: (
      <p>
        A person reviews every submission, so it isn&apos;t instant. Give it a couple of weeks. If
        you have a school deadline coming up, say so in the notes and we&apos;ll try to get to
        yours first.
      </p>
    ),
  },
  {
    question: "What if I don't have a printer or scanner?",
    answer: (
      <p>
        A phone photo is perfect. Lay your cards out on a table, get them all in the frame, and
        upload that. Nothing needs to be printed to volunteer with us.
      </p>
    ),
  },
  {
    question: "Can my school club participate?",
    answer: (
      <p>
        Yes, and it&apos;s our favorite way to do this. One person can submit on behalf of the
        group, or everyone can log their own hours separately — whichever makes award tracking
        easier for you. Email us and we&apos;ll send a plan for running a card drive.
      </p>
    ),
  },
  {
    question: "What happens to my email address?",
    answer: (
      <p>
        We use it to confirm your submission, send you the mailing address, and answer questions
        about your hours. That&apos;s all. We don&apos;t sell it or sign you up for anything you
        didn&apos;t ask for.
      </p>
    ),
  },
];

export default async function VolunteerPage() {
  const signedIn = Boolean(await getVolunteer());
  return (
    <>
      <PageHeader
        eyebrow="Volunteer"
        title="All you need is paper and something colorful."
        intro="Anyone can help. Draw a card at your kitchen table, run a bake sale, write a story, or start a chapter at your school. Log what you do and we'll keep track of your hours."
        illustration={<CrayonBundle className="h-40 w-52 sm:h-48 sm:w-64" />}
        tone="blush"
        nextTone="paper"
      >
        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
          <Button href="#log-hours" size="lg">
            Log your hours
          </Button>
          <Button href="#how-to-make-a-card" variant="outline" size="lg" alt>
            How to make a card
          </Button>
        </div>
      </PageHeader>

      {/* --- Ways to help ------------------------------------------------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="Ways to help"
          title="Four ways in"
          subtitle="Pick one, pick all of them, or start with whichever is closest to your kitchen table."
        />

        {/* Each one drops you at the log-hours form further down the page —
            whichever way you helped, the next step is telling us about it.
            `LinkCard` can't be an <li> itself, so it sits inside one. */}
        <ul className="mt-12 grid list-none gap-6 sm:grid-cols-2">
          {volunteerActivities.map((activity) => {
            const Art = activityArt[activity.value] ?? Heart;
            return (
              <li key={activity.value} className="h-full">
                <LinkCard
                  href="#log-hours"
                  label={`${activity.label} — log your hours`}
                  seed={activity.value}
                  tone="cream"
                  className="group flex h-full flex-col items-start gap-3 px-6 py-7"
                >
                  <Art className="h-20 w-24" />
                  <h3 className="text-2xl">{activity.label}</h3>
                  <p className="text-brown-mid">{activity.blurb}</p>

                  {/* A span, not a second link: a nested <Link> to the same href
                      would give the card two tab stops for one destination. */}
                  <span
                    aria-hidden="true"
                    className="mt-auto pt-2 font-display font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4 group-hover:decoration-red"
                  >
                    Log your hours →
                  </span>
                </LinkCard>
              </li>
            );
          })}
        </ul>
      </Section>

      <div className="bg-paper">
        <WaveEdge color={sectionHex.cream} />
      </div>

      {/* --- How to make a card ------------------------------------------- */}
      <Section tone="cream" id="how-to-make-a-card">
        <SectionHeading
          eyebrow="The main event"
          title="How to make a card"
          subtitle="There's no wrong way to do this. But a few small things make a card much better to open from a hospital bed."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card tone="paper" seed="yes-please" className="px-6 py-7">
            <h3 className="flex items-center gap-2 text-2xl">
              <CheckMark className="h-7 w-7" />
              Yes please
            </h3>
            <ul className="mt-5 flex list-none flex-col gap-4">
              {yesPlease.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckMark className="mt-1 h-5 w-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card tone="blush" seed="please-skip" className="px-6 py-7">
            <h3 className="flex items-center gap-2 text-2xl">
              <CrossMark className="h-7 w-7" />
              Please skip
            </h3>
            <ul className="mt-5 flex list-none flex-col gap-4">
              {pleaseSkip.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CrossMark className="mt-1 h-5 w-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 font-hand text-base text-brown-mid">
              None of these are rules to trip you up. They&apos;re just what hospitals have asked
              us for.
            </p>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card tone="kraft" seed="what-you-need" className="px-6 py-7">
            <h3 className="text-2xl">What you need</h3>
            <ul className="mt-4 flex list-none flex-col gap-3">
              {whatYouNeed.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Star className="mt-1 h-5 w-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-brown-mid">
              That&apos;s the whole list. If you don&apos;t have card stock, folded printer paper
              works fine.
            </p>
          </Card>

          <Card tone="paper" seed="how-to-send" className="px-6 py-7">
            <Envelope className="h-16 w-20" />
            <h3 className="mt-3 text-2xl">How to send it</h3>
            <ol className="mt-4 flex list-none flex-col gap-3">
              <li>
                <strong className="font-display text-berry">1.</strong> Photograph your finished
                cards. A phone photo on a table is perfect.
              </li>
              <li>
                <strong className="font-display text-berry">2.</strong> Upload the photo with your
                hours in the form below.
              </li>
              <li>
                <strong className="font-display text-berry">3.</strong> We&apos;ll email you the
                current mailing address, and you pop them in the post.
              </li>
            </ol>
            <p className="mt-5 text-brown-mid">
              Please wait for that email before mailing anything — the address changes depending on
              which hospital we&apos;re delivering to next.
            </p>
          </Card>
        </div>
      </Section>

      <div className="bg-cream">
        <TornEdge color={sectionHex.paper} />
      </div>

      {/* --- Volunteer awards --------------------------------------------- */}
      <Section tone="paper">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-14">
          <AwardRibbon className="h-36 w-28 shrink-0 animate-float" />

          <div className="w-full">
            <SectionHeading
              eyebrow="Recognition"
              title="We send you a certificate"
              align="left"
              subtitle="Plenty of students volunteer with us for a school service requirement. Here's the record you can hand in."
            />

            <div className="mt-6 flex flex-col gap-4 text-brown-mid">
              <p>
                Here&apos;s how it works. You log your hours honestly and upload a photo of what you
                made. An adult on our team checks it. Approved hours go into a running total on your
                account, and whenever you need it, you can ask us for a certificate.
              </p>
              <p>
                The certificate names you, the hours you volunteered, and the dates they cover — so
                a teacher or an admissions office can see exactly what it&apos;s for. Each hour is
                only ever counted on one certificate, so nothing can be claimed twice.
              </p>
              <p>
                It comes from us, Hearts4Hands. We&apos;re not a government awards body and
                don&apos;t claim to be — this is our own record of work we actually saw and checked.
              </p>
            </div>

            <ul className="mt-6 grid list-none gap-4 sm:grid-cols-3">
              {[
                { step: "1", title: "Log it", body: "Hours, cards, and a photo, from your account." },
                { step: "2", title: "We check it", body: "A real person reviews every entry." },
                { step: "3", title: "Ask for it", body: "Request a certificate whenever you need one." },
              ].map((item) => (
                <Card
                  as="li"
                  key={item.step}
                  seed={item.title}
                  tone="cream"
                  className="flex flex-col items-center gap-1 px-4 py-6 text-center"
                >
                  <p className="font-display text-4xl leading-none font-bold text-red-deep">
                    {item.step}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-berry">{item.title}</p>
                  <p className="mt-1 text-sm text-brown-mid">{item.body}</p>
                </Card>
              ))}
            </ul>

          </div>
        </div>
      </Section>

      <div className="bg-paper">
        <ScallopEdge color={sectionHex.blush} />
      </div>

      {/* --- The form ------------------------------------------------------ */}
      <Section tone="blush" id="log-hours" width="narrow">
        <SectionHeading
          eyebrow="Sign up · log hours"
          title="Tell us what you did"
          subtitle="Hours are logged from your account, so we know whose they are and can put your name on a certificate."
        />

        <div className="mt-10">
          <SignInPrompt
            signedIn={signedIn}
            title="Logging hours needs an account"
            reason="We can only certify hours we can tie to a person — that's what lets us put your name, your hours and the dates on a certificate you can hand to a school."
            href="/account/hours"
            cta="Log your hours"
          />
        </div>

        <p className="mt-6 text-center text-sm text-brown-mid">
          Trouble with the form? Email us at{" "}
          <a
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href={`mailto:${contact.general}`}
          >
            {contact.general}
          </a>{" "}
          and we&apos;ll log it by hand.
        </p>
      </Section>

      <div className="bg-blush">
        <TornEdge color={sectionHex.paper} />
      </div>

      {/* --- Questions ----------------------------------------------------- */}
      <Section tone="paper" width="narrow">
        <SectionHeading eyebrow="Questions" title="Things people ask" />
        <FaqList items={faqs} />

        <div className="mt-10 text-center">
          <p className="text-brown-mid">Still wondering something?</p>
          <Button href="/contact" variant="secondary" className="mt-3">
            Ask us anything
          </Button>
        </div>
      </Section>
    </>
  );
}
