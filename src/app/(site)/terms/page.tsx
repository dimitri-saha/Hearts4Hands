import type { Metadata } from "next";
import Link from "next/link";

import { contact, privacyUpdated } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Alert } from "@/components/ui/Feedback";
import { OpenBook } from "@/components/illustrations/Objects";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The short, plain-language rules for using Hearts4Hands: what an account is for, who owns the stories you send, and when we'd close an account.",
};

const link =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4";

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Terms of use"
        title="The rules, in plain words"
        intro="Short, because there isn't much to say. Be honest about your hours, own what you write, and we'll do the same."
        illustration={<OpenBook className="h-28 w-36" />}
        nextTone="paper"
      />

      <Section tone="paper" width="narrow">
        <Alert tone="note" title="The short version">
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
            <li>Log hours you actually did. We check before they count.</li>
            <li>Your writing stays yours. You decide if it&apos;s published, and you can withdraw it.</li>
            <li>One account per volunteer. Under-13s are set up by a grown-up.</li>
            <li>This is a volunteer project, not a paid service — please read the last section.</li>
          </ul>
        </Alert>

        <div className="mt-10 flex flex-col gap-10">
          <section>
            <h2 className="text-2xl sm:text-3xl">Your account</h2>
            <p className="mt-3 text-brown">
              An account exists so your hours can be tied to you, which is what lets us put your
              name on a certificate. Keep your password to yourself, use a real email address you
              can open, and don&apos;t create an account pretending to be someone else.
            </p>
            <p className="mt-3 text-brown-mid">
              If the volunteer is under 13, a parent, guardian, or teacher creates and holds the
              account. The child&apos;s name goes on it because they did the volunteering — the
              login belongs to the adult.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Logging hours honestly</h2>
            <p className="mt-3 text-brown">
              Log time you actually spent and cards you actually made. Don&apos;t round up. A real
              person reviews every entry, and we&apos;ll ask about anything that looks off before
              deciding.
            </p>
            <p className="mt-3 text-brown-mid">
              We can decline an entry, and we&apos;ll say why. A certificate is our own statement
              that we checked the work and believe it — so we only issue one for hours we&apos;ve
              approved. We&apos;re not a government awards body and don&apos;t claim to be.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Stories you send us</h2>
            <p className="mt-3 text-brown">
              <strong className="font-display text-berry">Your writing stays yours.</strong> By
              sending it you give us permission to publish it on this site and to make light edits
              for clarity, spelling, and privacy — nothing that changes what you meant.
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-brown">
              <li>We&apos;ll show you any edits before it goes live. Nothing is published without your OK.</li>
              <li>You can ask to appear under a first name only.</li>
              <li>You can ask us to take it down at any time, and we will.</li>
              <li>Write about your own experience. Change or leave out other people&apos;s names.</li>
              <li>No medical advice, and nothing that identifies a patient other than yourself.</li>
            </ul>
            <p className="mt-3 text-brown-mid">
              Accounts held by a parent or guardian for an under-13 can&apos;t submit stories. See
              the{" "}
              <Link className={link} href="/privacy">
                privacy policy
              </Link>{" "}
              for why.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Clubs</h2>
            <p className="mt-3 text-brown">
              Whoever starts a club can see members&apos; names and their approved hours and card
              counts — nothing else. Don&apos;t share an invite code more widely than you mean to;
              you can generate a fresh one whenever you like, which stops the old one working.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Closing an account</h2>
            <p className="mt-3 text-brown">
              Email{" "}
              <a className={link} href={`mailto:${contact.general}`}>
                {contact.general}
              </a>{" "}
              and we&apos;ll close it. Your hour records are anonymised rather than deleted, so the
              totals we publish stay accurate — they stop being connected to you. Published stories
              stay up unless you ask us to remove them, which you can do separately at any time.
            </p>
            <p className="mt-3 text-brown-mid">
              We&apos;d only close an account ourselves for repeatedly logging hours that
              didn&apos;t happen, submitting someone else&apos;s writing as your own, or using the
              site to harass anyone. We&apos;d tell you why first.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">What we can and can&apos;t promise</h2>
            <p className="mt-3 text-brown">
              Hearts4Hands is run by volunteers. We&apos;ll do our best to review hours promptly,
              keep the site up, and get cards where they&apos;re going — but we can&apos;t
              guarantee timing, and we can&apos;t promise a hospital will accept a particular
              delivery. Card deliveries follow each hospital&apos;s own rules, which change.
            </p>
            <p className="mt-3 text-brown-mid">
              The site is provided as-is, without warranties. Nothing here is medical, legal, or
              financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl">Changes</h2>
            <p className="mt-3 text-brown">
              If these change, we&apos;ll update this page and the date below. Last updated{" "}
              <strong className="font-display text-berry">{formatDate(privacyUpdated)}</strong>.
              Questions go to{" "}
              <a className={link} href={`mailto:${contact.general}`}>
                {contact.general}
              </a>
              .
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
