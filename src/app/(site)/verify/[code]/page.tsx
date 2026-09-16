import type { Metadata } from "next";
import Link from "next/link";

import { verifyCertificate } from "@/lib/certificates";
import { contact, site } from "@/lib/site";
import { formatDate, formatNumber } from "@/lib/utils";
import { HeartRule } from "@/components/illustrations/Dividers";
import { AwardRibbon } from "@/components/illustrations/Objects";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { Section } from "@/components/ui/Section";

/**
 * Public certificate check.
 *
 * `noindex` is deliberate and matters more than it looks. A certificate names a
 * volunteer, and for a guardian-held account that name belongs to a child under
 * 13 (see CLAUDE.md §11). The code makes the URL unguessable, but somebody
 * pasting their certificate link into a public post shouldn't thereby put a
 * child's name into a search index. `robots.ts` disallows /verify too.
 */
export const metadata: Metadata = {
  title: "Check a certificate",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  // Next 16: params is a Promise. See CLAUDE.md §11.
  const { code } = await params;
  const cert = await verifyCertificate(decodeURIComponent(code));

  return (
    <Section tone="blush" width="narrow" className="min-h-[60vh]">
      <div className="flex flex-col items-center text-center">
        <AwardRibbon className="h-14 w-11" />
        <p className="mt-3 font-hand text-lg tracking-[0.16em] text-red-deep uppercase">
          Certificate check
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl">
          {cert ? (cert.revoked ? "This one has been withdrawn" : "This certificate is genuine") : "We don't recognise that code"}
        </h1>
      </div>

      {!cert ? (
        <div className="mt-8 flex flex-col items-center gap-5 text-center">
          <Alert tone="error" title="No match">
            <p>
              Nothing was issued under that code. Codes look like{" "}
              <strong className="font-display">H4H-7K2PQ-9XR4M</strong> — it&apos;s worth checking
              for a mistyped character, since we leave out letters that are easy to confuse.
            </p>
          </Alert>
          <p className="text-brown-mid">
            Still not working?{" "}
            <a
              className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
              href={`mailto:${contact.general}?subject=${encodeURIComponent("Certificate check")}`}
            >
              Email us
            </a>{" "}
            and we&apos;ll confirm it by hand.
          </p>
        </div>
      ) : (
        <>
          <Card seed={cert.code} tone="paper" className="mt-8 px-6 py-7 text-center">
            {cert.revoked ? (
              <Alert tone="error" title="Withdrawn by Hearts4Hands" className="mb-6 text-left">
                <p>
                  {cert.revoked_reason?.trim() ||
                    "This certificate was withdrawn. It should no longer be treated as valid."}
                </p>
              </Alert>
            ) : null}

            <p className="font-hand text-lg text-brown-mid">
              {cert.kind === "club" ? "This certifies that the members of" : "This certifies that"}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-brown sm:text-4xl">
              {cert.subject_name}
            </p>

            <p className="mt-4 text-lg text-brown">
              {cert.kind === "club" ? "together volunteered " : "has volunteered "}
              <strong className="font-display text-berry">
                {formatNumber(Number(cert.hours))} {Number(cert.hours) === 1 ? "hour" : "hours"}
              </strong>
              {cert.cards > 0 ? (
                <>
                  {" "}
                  and made{" "}
                  <strong className="font-display text-berry">
                    {formatNumber(cert.cards)} {cert.cards === 1 ? "card" : "cards"}
                  </strong>
                </>
              ) : null}{" "}
              for children in hospitals.
            </p>

            {cert.kind === "club" ? (
              <p className="mt-3 text-sm text-brown-mid">
                Across{" "}
                <strong className="font-display text-berry">
                  {formatNumber(cert.volunteer_count)}{" "}
                  {cert.volunteer_count === 1 ? "volunteer" : "volunteers"}
                </strong>
                . This is the club&apos;s combined total — its members also hold their own
                certificates for the same hours, so the two should not be added together.
              </p>
            ) : null}

            <HeartRule className="mt-6" />

            <dl className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              <div>
                <dt className="font-hand text-base text-brown-soft">Issued</dt>
                <dd className="font-display font-bold text-brown">
                  {formatDate(cert.issued_at)}
                </dd>
              </div>
              <div>
                <dt className="font-hand text-base text-brown-soft">Code</dt>
                <dd className="font-display font-bold text-brown">{cert.code}</dd>
              </div>
            </dl>
          </Card>

          {!cert.revoked ? (
            <p className="mt-6 text-center text-sm text-brown-mid">
              Hours are approved one at a time by a {site.name} admin before they can appear on a
              certificate. This page reflects the record as it stands today — if a certificate is
              ever withdrawn, this page says so.
            </p>
          ) : null}
        </>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="outline">
          About {site.name}
        </Button>
        <Button href="/volunteer" variant="outline" alt>
          Volunteer with us
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-brown-soft">
        Checking a certificate for a school or program?{" "}
        <Link
          className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
          href="/contact"
        >
          Get in touch
        </Link>
        .
      </p>
    </Section>
  );
}
