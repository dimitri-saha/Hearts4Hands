import { revokeCertificate } from "@/app/actions/certificates";
import { getAllCertificates } from "@/lib/certificates";
import { formatDate, formatNumber } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";
import { Card, Tag } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";

export const dynamic = "force-dynamic";

export const metadata = { title: "Certificates" };

/**
 * Issued certificates, with revoke.
 *
 * There is no "issue on behalf of" here on purpose: certificates restate hours
 * that were already approved one by one, so issuing is the volunteer's to do.
 * What an admin needs is the ability to take one back.
 */
export default async function AdminCertificatesPage() {
  await requireAdmin("/admin/certificates");
  const certificates = await getAllCertificates();

  const live = certificates.filter((c) => !c.revoked_at);
  const revoked = certificates.filter((c) => c.revoked_at);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl">Certificates</h1>
        <p className="mt-2 text-brown-mid">
          {formatNumber(live.length)} live, {formatNumber(revoked.length)} withdrawn. Withdrawing
          one immediately stops it downloading and flips its public check page to “withdrawn”.
        </p>
      </header>

      {certificates.length === 0 ? (
        <EmptyState title="None issued yet.">
          <p>
            Volunteers issue their own from their dashboard, once they have hours you&apos;ve
            approved.
          </p>
        </EmptyState>
      ) : (
        <ul className="flex list-none flex-col gap-3">
          {certificates.map((cert) => {
            const isRevoked = Boolean(cert.revoked_at);
            return (
              <Card as="li" key={cert.id} seed={cert.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <p className="font-display text-lg font-bold text-berry">
                    {cert.subject_name}
                    {cert.kind === "club" ? (
                      <span className="ml-2 font-body text-sm font-normal text-brown-soft">
                        club
                      </span>
                    ) : null}
                  </p>
                  <Tag tone={isRevoked ? "red" : "leaf"}>
                    {isRevoked ? "Withdrawn" : "Live"}
                  </Tag>
                </div>

                <p className="mt-1 text-sm text-brown-mid">
                  {formatNumber(Number(cert.hours))} hours · {formatNumber(cert.cards)} cards ·
                  {cert.kind === "club"
                    ? ` ${formatNumber(cert.volunteer_count)} volunteers ·`
                    : ""}{" "}
                  issued {formatDate(cert.issued_at)} ·{" "}
                  <span className="font-display font-bold text-brown">{cert.code}</span> ·{" "}
                  {cert.entry_ids.length} entries counted
                </p>

                {isRevoked ? (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="rounded-lg border border-red/40 bg-red/5 px-3 py-2 text-sm text-brown">
                      <strong className="font-display text-berry">Reason: </strong>
                      {cert.revoked_reason?.trim() || "none recorded"}
                    </p>
                    <form action={revokeCertificate}>
                      <input type="hidden" name="id" value={cert.id} />
                      <input type="hidden" name="undo" value="1" />
                      <button
                        type="submit"
                        className="rough-pill border-2 border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid hover:border-leaf hover:text-brown"
                      >
                        Reinstate
                      </button>
                    </form>
                  </div>
                ) : (
                  <details className="mt-3">
                    <summary className="inline-block cursor-pointer list-none rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid marker:content-none hover:border-red hover:text-berry">
                      Withdraw this certificate
                    </summary>
                    <form
                      action={revokeCertificate}
                      className="mt-2 flex flex-col items-start gap-2 rounded-lg border border-red bg-red/5 p-3"
                    >
                      <input type="hidden" name="id" value={cert.id} />
                      <label
                        className="font-display text-sm font-bold text-brown"
                        htmlFor={`reason-${cert.id}`}
                      >
                        Why? (shown on the public check page)
                      </label>
                      <input
                        id={`reason-${cert.id}`}
                        name="reason"
                        maxLength={300}
                        placeholder="Hours were logged in error"
                        className="w-full max-w-md rounded-lg border-2 border-brown-faint bg-paper px-3 py-1.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-red bg-red/10 px-3 py-1.5 font-display text-sm font-bold text-berry hover:bg-red/20"
                      >
                        Withdraw it
                      </button>
                    </form>
                  </details>
                )}
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
