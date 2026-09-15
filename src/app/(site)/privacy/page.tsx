import type { Metadata } from "next";
import Link from "next/link";

import { contact, privacyUpdated } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { TornEdge } from "@/components/illustrations/Dividers";
import { Envelope } from "@/components/illustrations/Objects";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Hearts4Hands collects, why, how long we keep it, and how to ask us to delete it. In plain language.",
};

/**
 * Privacy policy.
 *
 * Written to describe what the site *actually does* rather than generic
 * boilerplate — every retention period here matches real behaviour in the
 * code and the SQL purge jobs, so the two must be updated together.
 */
const link =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="What we collect, and what we do with it"
        intro="Short version: we only ask for what we need to send cards, credit your hours, and reply to you. We don't sell anything to anyone, ever."
        illustration={<Envelope className="h-28 w-36" />}
        nextTone="paper"
      />

      <Section tone="paper" width="narrow">
        <Alert tone="note" title="The short version">
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
            <li>We collect what you type into our three forms, and nothing else about you.</li>
            <li>Only our volunteer editors can see it. We never sell or share it for marketing.</li>
            <li>We delete things on a schedule, automatically — the details are below.</li>
            <li>
              Email{" "}
              <a className={link} href={`mailto:${contact.general}`}>
                {contact.general}
              </a>{" "}
              any time to see, correct, or delete what we hold about you.
            </li>
          </ul>
        </Alert>

        <div className="mt-10 flex flex-col gap-10">
          <section>
            <h2 className="text-2xl sm:text-3xl">What we collect, and why</h2>
            <p className="mt-3 text-brown-mid">
              Three forms on this site collect information. Nothing else on the site asks you for
              anything.
            </p>

            <div className="mt-6 flex flex-col gap-5">
              <Card tone="cream" seed="volunteer" className="p-5">
                <h3 className="text-xl">Volunteering and logging hours</h3>
                <p className="mt-2 text-brown">
                  Your name, email, country, and optionally your state, city, school, age range,
                  what you&apos;d like to help with, the hours you logged, how many cards you made,
                  when you made them, any notes you add, and a photo of your cards if you upload
                  one.
                </p>
                <p className="mt-2 text-brown-mid">
                  We need this to confirm your hours are yours, to certify them if you&apos;re
                  working toward a service award, and to email you the current hospital mailing
                  address. Your school and age range are optional and only help us group volunteers
                  sensibly.
                </p>
              </Card>

              <Card tone="cream" seed="story" className="p-5">
                <h3 className="text-xl">Sending us a story</h3>
                <p className="mt-2 text-brown">
                  Your name, email, optionally where you live, and the story itself.
                </p>
                <p className="mt-2 text-brown-mid">
                  An editor reads every submission. We&apos;ll email you before anything is
                  published, and nothing goes up without your say-so. You can ask to be published
                  under a first name only, or to withdraw your story at any point — before or after
                  it&apos;s live.
                </p>
              </Card>

              <Card tone="cream" seed="contact" className="p-5">
                <h3 className="text-xl">Contacting us</h3>
                <p className="mt-2 text-brown">
                  Your name, email, the topic you pick, and your message.
                </p>
                <p className="mt-2 text-brown-mid">
                  Only so we can reply. We don&apos;t add you to any mailing list — we don&apos;t
                  have one.
                </p>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Photos of cards</h2>
            <p className="mt-3 text-brown">
              If you upload a photo to prove the cards you made, it goes into private storage that
              the public cannot reach. Only a signed-in editor can open it, through a link that
              expires after 30 minutes.
            </p>
            <p className="mt-3 text-brown-mid">
              Please photograph the cards themselves — not people. If a photo you send includes
              someone&apos;s face, or a name and address on an envelope, tell us and we&apos;ll
              delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">How long we keep things</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-[0.97rem]">
                <thead>
                  <tr className="border-b-2 border-brown-faint">
                    <th className="py-2 pr-4 font-display text-berry">What</th>
                    <th className="py-2 font-display text-berry">How long</th>
                  </tr>
                </thead>
                <tbody className="text-brown">
                  <tr className="border-b border-brown-faint/60">
                    <td className="py-2.5 pr-4">Stories we decide not to publish</td>
                    <td className="py-2.5">Deleted automatically 30 days after the decision</td>
                  </tr>
                  <tr className="border-b border-brown-faint/60">
                    <td className="py-2.5 pr-4">Messages you send us, once we&apos;ve replied</td>
                    <td className="py-2.5">Deleted automatically 7 days after being marked done</td>
                  </tr>
                  <tr className="border-b border-brown-faint/60">
                    <td className="py-2.5 pr-4">Volunteer hour records</td>
                    <td className="py-2.5">
                      Kept while you&apos;re volunteering with us, so awards can be verified. Ask
                      us and we&apos;ll delete them.
                    </td>
                  </tr>
                  <tr className="border-b border-brown-faint/60">
                    <td className="py-2.5 pr-4">Photos of cards</td>
                    <td className="py-2.5">Deleted with the hour record they belong to</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4">Published stories</td>
                    <td className="py-2.5">
                      Stay up until you ask us to take yours down, then it comes down
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Who can see it</h2>
            <p className="mt-3 text-brown">
              Only Hearts4Hands editors, who sign in to a private admin area. Accounts are created
              by hand — nobody can register themselves. Submissions are never public until an
              editor publishes a story you approved.
            </p>
            <p className="mt-3 text-brown-mid">
              We use a few companies to run the site, and your information passes through them:
              <strong className="font-display text-berry"> Supabase</strong> stores the database and
              photo uploads, <strong className="font-display text-berry">Vercel</strong> hosts the
              site, and if we&apos;ve switched on confirmation emails,{" "}
              <strong className="font-display text-berry">Resend</strong> sends them. They process
              it on our behalf and don&apos;t get to use it for anything else. We don&apos;t sell or
              rent your information to anyone, and we don&apos;t run advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Cookies and site statistics</h2>
            <p className="mt-3 text-brown">
              We don&apos;t use advertising or tracking cookies, and we don&apos;t follow you around
              other websites. The only cookie we set is the one that keeps an editor signed in to
              the admin area — if you&apos;re not an editor, you never get one.
            </p>
            <p className="mt-3 text-brown-mid">
              We count page views to see which pages are useful — how many people opened the
              volunteer page, which stories get read. These are totals only. They aren&apos;t tied
              to you, no cookie is used, and we can&apos;t tell who read what.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Young volunteers</h2>
            <p className="mt-3 text-brown">
              <strong className="font-display text-berry">Under 13:</strong> we don&apos;t collect
              anything about the child. A parent, guardian, or teacher fills in the form and
              becomes our only contact — we never ask for the child&apos;s name, email, or school,
              and the form stops asking for a school entirely. Choosing &ldquo;Under 13&rdquo; on
              the volunteer form switches this on automatically. Kids that age are very welcome to
              make cards; we just don&apos;t keep records about them.
            </p>
            <p className="mt-3 text-brown">
              <strong className="font-display text-berry">13 to 17:</strong> you can sign up
              yourself. Please check with a parent or guardian first — the form asks you to
              confirm you have.
            </p>
            <p className="mt-3 text-brown-mid">
              A parent or guardian can email us at any time to see what we hold about their child,
              correct it, or have it deleted, and we&apos;ll do it without asking for a reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Asking us to delete something</h2>
            <p className="mt-3 text-brown">
              Email{" "}
              <a className={link} href={`mailto:${contact.general}`}>
                {contact.general}
              </a>{" "}
              from the address you signed up with, or tell us enough to find your entry. You can
              ask us to:
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-brown">
              <li>send you a copy of everything we hold about you</li>
              <li>correct anything that&apos;s wrong</li>
              <li>delete your hour records and any photos you sent</li>
              <li>take a published story down, or republish it under a different name</li>
            </ul>
            <p className="mt-3 text-brown-mid">
              We&apos;ll do it within 30 days, usually much sooner. We won&apos;t ask you to justify
              it, and it won&apos;t affect your ability to keep volunteering.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Changes</h2>
            <p className="mt-3 text-brown">
              If we change how any of this works, we&apos;ll update this page and change the date
              below. This policy was last updated on{" "}
              <strong className="font-display text-berry">{formatDate(privacyUpdated)}</strong>.
            </p>
            <p className="mt-3 text-brown-mid">
              Questions about any of it? Email{" "}
              <a className={link} href={`mailto:${contact.general}`}>
                {contact.general}
              </a>
              . A real person reads it.
            </p>
          </section>
        </div>
      </Section>

      <TornEdge color={sectionHex.blush} from={sectionHex.paper} className="-mt-px" />

      <Section tone="blush" width="narrow" className="text-center">
        <SectionHeading
          title="Still want to help?"
          subtitle="Now you know exactly what we'd be asking for."
        />
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/volunteer"
            className="rough-pill border-[3px] border-brown bg-red px-8 py-3.5 font-display text-lg font-bold text-paper sticker-shadow"
          >
            Volunteer with us
          </Link>
          <Link
            href="/contact"
            className="rough-pill-alt border-[3px] border-brown bg-paper px-8 py-3.5 font-display text-lg font-bold text-berry sticker-shadow"
          >
            Ask us something
          </Link>
        </div>
      </Section>
    </>
  );
}

export const dynamic = "force-static";
export const revalidate = false;
