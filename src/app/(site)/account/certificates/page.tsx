import type { Metadata } from "next";
import Link from "next/link";

import {
  checkClubEligibility,
  checkEligibility,
  getClubCertificates,
  getMyCertificates,
} from "@/lib/certificates";
import { getMyGroups } from "@/lib/account-data";
import { contact, site } from "@/lib/site";
import { formatDate, formatNumber } from "@/lib/utils";
import { requireVolunteer, volunteerName } from "@/lib/volunteer-auth";
import { RequestCertificateForm } from "@/components/account/RequestCertificateForm";
import { RequestClubCertificateForm } from "@/components/account/RequestClubCertificateForm";
import { Button } from "@/components/ui/Button";
import { Card, Tag } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/Feedback";
import { AwardRibbon } from "@/components/illustrations/Objects";

export const metadata: Metadata = {
  title: "My certificates",
  robots: { index: false, follow: false },
};

const linkClass =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4";

export default async function CertificatesPage() {
  const volunteer = await requireVolunteer("/account/certificates");

  const [certificates, eligibility, groups] = await Promise.all([
    getMyCertificates(volunteer.id),
    checkEligibility(volunteer.id),
    getMyGroups(volunteer.id),
  ]);

  // Only a leader can issue a club's certificate, so only a leader is offered one.
  const ledClubs = groups.filter((g) => g.role === "leader");
  const clubs = await Promise.all(
    ledClubs.map(async (m) => ({
      group: m.group,
      certificates: await getClubCertificates(m.group.id),
      eligibility: await checkClubEligibility(m.group.id),
    })),
  );

  const name = volunteerName(volunteer);
  const hasAny = certificates.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="font-hand text-lg tracking-[0.14em] text-red-deep uppercase">Certificates</p>
        <h1 className="text-3xl sm:text-4xl">
          Proof of what you&apos;ve done
          <AwardRibbon className="ml-3 inline-block h-9 w-7 align-middle" />
        </h1>
        <p className="max-w-2xl text-brown-mid">
          A certificate records the hours we&apos;ve already checked and approved, in{" "}
          <strong className="font-display text-berry">{name}</strong>&apos;s name. Each one carries
          a code anyone can check at{" "}
          <span className="font-display text-berry">{site.url.replace(/^https?:\/\//, "")}/verify</span>{" "}
          — so a school or a program can confirm it without having to take your word for it.
        </p>
      </header>

      {/* ------------------------------------------------------ request one */}
      <section aria-labelledby="request-heading" className="flex flex-col gap-4">
        <h2 id="request-heading" className="text-2xl">
          {hasAny ? "Get an updated one" : "Get your first one"}
        </h2>

        {eligibility.ok ? (
          <Alert tone="info">
            <p>
              Ready to certify:{" "}
              <strong className="font-display text-berry">
                {formatNumber(eligibility.hours)}{" "}
                {eligibility.hours === 1 ? "hour" : "hours"}
              </strong>
              {eligibility.cards > 0 ? (
                <>
                  {" "}
                  and{" "}
                  <strong className="font-display text-berry">
                    {formatNumber(eligibility.cards)}{" "}
                    {eligibility.cards === 1 ? "card" : "cards"}
                  </strong>
                </>
              ) : null}
              . Certificates are cumulative, so this one covers everything approved so far — you
              don&apos;t need to keep the old ones.
            </p>
          </Alert>
        ) : eligibility.reason === "nothing-new" ? (
          <Alert tone="note">
            <p>
              Your latest certificate already covers every hour we&apos;ve approved.{" "}
              <Link className={linkClass} href="/account/hours">
                Log more hours
              </Link>{" "}
              and come back once they&apos;re checked.
            </p>
          </Alert>
        ) : (
          <Alert tone="note">
            <p>
              Nothing approved yet, so there&apos;s nothing to certify.{" "}
              <Link className={linkClass} href="/account/hours">
                Log the hours you&apos;ve done
              </Link>{" "}
              — a real person checks every entry, so give it a couple of weeks.
            </p>
          </Alert>
        )}

        <RequestCertificateForm
          canRequest={eligibility.ok}
          label={hasAny ? "Issue an updated certificate" : "Issue my certificate"}
        />
      </section>


      {/* ------------------------------------------------------------- clubs */}
      {clubs.length > 0 ? (
        <section aria-labelledby="club-heading" className="flex flex-col gap-4">
          <h2 id="club-heading" className="text-2xl">
            {clubs.length === 1 ? "Your club's certificate" : "Your clubs' certificates"}
          </h2>

          <p className="text-brown-mid">
            A club certificate names the club and adds up every approved hour logged under it. The
            hours on it are the same ones your members hold personally, counted once for the club
            — so the two shouldn&apos;t be added together.
          </p>

          {clubs.map(({ group, certificates: clubCerts, eligibility: clubEligibility }) => {
            const current = clubCerts.find((c) => !c.revoked_at);
            return (
              <Card key={group.id} seed={group.id} tone="cream" className="flex flex-col gap-4 px-5 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-display text-lg font-bold text-berry">{group.name}</p>
                  {group.organisation ? (
                    <p className="text-sm text-brown-soft">{group.organisation}</p>
                  ) : null}
                </div>

                {clubEligibility.ok ? (
                  <Alert tone="info">
                    <p>
                      Ready to certify:{" "}
                      <strong className="font-display text-berry">
                        {formatNumber(clubEligibility.totals.hours)}{" "}
                        {clubEligibility.totals.hours === 1 ? "hour" : "hours"}
                      </strong>{" "}
                      across{" "}
                      <strong className="font-display text-berry">
                        {formatNumber(clubEligibility.totals.volunteers)}{" "}
                        {clubEligibility.totals.volunteers === 1 ? "volunteer" : "volunteers"}
                      </strong>
                      .
                    </p>
                  </Alert>
                ) : clubEligibility.reason === "nothing-new" ? (
                  <Alert tone="note">
                    <p>This club&apos;s latest certificate already covers everything approved.</p>
                  </Alert>
                ) : (
                  <Alert tone="note">
                    <p>
                      Nothing approved under this club yet. Members need to pick the club when they
                      log hours, and an admin has to check them first.
                    </p>
                  </Alert>
                )}

                <RequestClubCertificateForm
                  groupId={group.id}
                  canRequest={clubEligibility.ok}
                  label={current ? "Issue an updated club certificate" : "Issue the club certificate"}
                />

                {clubCerts.length > 0 ? (
                  <ul className="flex list-none flex-col gap-2">
                    {clubCerts.map((cert, index) => {
                      const revoked = Boolean(cert.revoked_at);
                      return (
                        <li
                          key={cert.id}
                          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-brown-faint bg-paper px-4 py-3"
                        >
                          <span className="text-sm text-brown">
                            <strong className="font-display text-berry">
                              {formatNumber(Number(cert.hours))} hours
                            </strong>{" "}
                            · {formatNumber(cert.volunteer_count)} volunteers · issued{" "}
                            {formatDate(cert.issued_at)} ·{" "}
                            <span className="font-display font-bold">{cert.code}</span>
                          </span>
                          {revoked ? (
                            <Tag tone="red">Withdrawn</Tag>
                          ) : index === 0 ? (
                            <Button href={`/account/certificates/${cert.code}`} size="sm">
                              Download PDF
                            </Button>
                          ) : (
                            <Tag tone="cream">Superseded</Tag>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </Card>
            );
          })}
        </section>
      ) : null}

      {/* ------------------------------------------------------------- list */}
      <section aria-labelledby="list-heading" className="flex flex-col gap-4">
        <h2 id="list-heading" className="text-2xl">
          Your certificates
        </h2>

        {!hasAny ? (
          <EmptyState title="None yet.">
            <p>
              Once you have approved hours, issuing one takes a click and the PDF is yours to
              keep, print, or send on.
            </p>
          </EmptyState>
        ) : (
          <ul className="flex list-none flex-col gap-3">
            {certificates.map((cert, index) => {
              const revoked = Boolean(cert.revoked_at);
              // Cumulative certificates supersede each other — only the newest
              // still describes the volunteer's full record.
              const superseded = !revoked && index > 0;

              return (
                <Card as="li" key={cert.id} seed={cert.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <p className="font-display text-lg font-bold text-berry">
                      {formatNumber(Number(cert.hours))}{" "}
                      {Number(cert.hours) === 1 ? "hour" : "hours"}
                      {cert.cards > 0 ? (
                        <span className="font-body text-base font-normal text-brown">
                          {" "}
                          · {formatNumber(cert.cards)} {cert.cards === 1 ? "card" : "cards"}
                        </span>
                      ) : null}
                    </p>
                    {revoked ? (
                      <Tag tone="red">Withdrawn</Tag>
                    ) : superseded ? (
                      <Tag tone="cream">Superseded</Tag>
                    ) : (
                      <Tag tone="leaf">Current</Tag>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-brown-mid">
                    Issued {formatDate(cert.issued_at)} · code{" "}
                    <span className="font-display font-bold text-brown">{cert.code}</span>
                  </p>

                  {revoked ? (
                    <p className="mt-3 rounded-lg border border-red/40 bg-red/5 px-3 py-2 text-sm text-brown">
                      <strong className="font-display text-berry">Withdrawn: </strong>
                      {cert.revoked_reason?.trim() ||
                        "No reason was recorded. Email us and we'll explain."}
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Button href={`/account/certificates/${cert.code}`} size="sm">
                        Download PDF
                      </Button>
                      <Link className={linkClass} href={`/verify/${cert.code}`}>
                        See what a checker sees
                      </Link>
                    </div>
                  )}
                </Card>
              );
            })}
          </ul>
        )}

        <p className="text-sm text-brown-soft">
          Something wrong on a certificate?{" "}
          <a
            className={linkClass}
            href={`mailto:${contact.general}?subject=${encodeURIComponent("About my certificate")}`}
          >
            Email us
          </a>{" "}
          and we&apos;ll fix it and reissue.
        </p>
      </section>
    </div>
  );
}
