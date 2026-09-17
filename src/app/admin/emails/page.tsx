import { emailSamples } from "@/lib/email/samples";
import { isEmailConfigured } from "@/lib/email";
import { requireOwner } from "@/lib/auth";
import { Card, Tag } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { SendSamplesForm } from "@/components/admin/SendSamplesForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Emails" };

/**
 * Every email the site sends, rendered as it will actually arrive.
 *
 * Each preview is a real iframe of the real template, not a screenshot — so it
 * cannot drift from what gets sent.
 */
export default async function AdminEmailsPage() {
  const admin = await requireOwner("/admin/emails");

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl">Emails</h1>
        <p className="mt-2 max-w-3xl text-brown-mid">
          The {emailSamples.length} emails this site sends, with stand-in names and numbers. The
          sign-in, sign-up and password-reset emails are <strong>not</strong> here — those are sent
          by Supabase from templates in its dashboard. The HTML for them is in{" "}
          <code className="rounded bg-cream px-1.5 py-0.5 text-sm">supabase/email-templates/</code>.
        </p>
      </header>

      {!isEmailConfigured ? (
        <Alert tone="note" title="Sending is off in this environment">
          <p>
            <code>RESEND_API_KEY</code> isn&apos;t set here, so nothing can actually send. Previews
            below still work. To post yourself a real set, open this page on the deployed site,
            where the key is configured.
          </p>
        </Alert>
      ) : null}

      <Card tone="cream" className="px-5 py-5">
        <h2 className="text-xl">Post yourself the whole set</h2>
        <p className="mt-1 mb-4 text-brown-mid">
          Sends one of each to a single address, with <strong>[SAMPLE]</strong> in the subject.
          Samples use stand-in data, so no volunteer&apos;s real hours or story can be mailed out
          by accident.
        </p>
        <SendSamplesForm defaultEmail={admin.email ?? ""} />
      </Card>

      <ul className="flex list-none flex-col gap-8">
        {emailSamples.map((sample) => {
          const built = sample.build();
          return (
            <li key={sample.id}>
              <Card seed={sample.id} className="overflow-hidden px-0 py-0">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b-2 border-dashed border-brown-faint px-5 py-4">
                  <div>
                    <h2 className="text-xl">{sample.label}</h2>
                    <p className="mt-1 text-sm text-brown-mid">{sample.when}</p>
                    <p className="mt-1 text-sm text-brown-soft">
                      Subject: <span className="font-display text-brown">{built.subject}</span>
                    </p>
                  </div>
                  <Tag tone={sample.audience === "The team" ? "brown" : "pink"}>
                    {sample.audience}
                  </Tag>
                </div>

                {/*
                  srcDoc, not src. The site sends `X-Frame-Options: DENY` and
                  CSP `frame-ancestors 'none'` on every route, which block
                  framing even from the same origin — a src iframe here shows
                  "refused to connect". srcDoc needs no fetch, so nothing is
                  framed: the HTML is handed straight to the iframe, which then
                  inherits this page's CSP and renders it.

                  `sandbox=""` keeps it inert — no scripts, opaque origin.
                */}
                <iframe
                  srcDoc={built.html}
                  title={`${sample.label} preview`}
                  sandbox=""
                  className="h-[620px] w-full border-0 bg-blush"
                />

                <div className="border-t-2 border-dashed border-brown-faint px-5 py-3">
                  {/* A top-level navigation isn't framing, so X-Frame-Options
                      doesn't apply — this opens full size just fine. */}
                  <a
                    href={`/admin/emails/preview/${sample.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-sm font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4 hover:text-berry"
                  >
                    Open full size in a new tab
                  </a>
                </div>

                <details className="border-t-2 border-dashed border-brown-faint px-5 py-3">
                  <summary className="cursor-pointer list-none font-display text-sm font-bold text-brown-mid marker:content-none hover:text-berry">
                    Show the plain-text version
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-cream p-4 text-xs leading-relaxed whitespace-pre-wrap text-brown">
                    {built.text}
                  </pre>
                </details>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
