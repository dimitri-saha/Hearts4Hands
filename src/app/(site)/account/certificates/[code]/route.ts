import { buildCertificatePdf, certificateFilename } from "@/lib/pdf/certificate";
import { getCertificateByCode } from "@/lib/certificates";
import { getVolunteer } from "@/lib/volunteer-auth";
import { getAdminUser } from "@/lib/auth";

/**
 * Downloads one certificate as a PDF.
 *
 * Generated per request rather than served from storage, so a revoked
 * certificate cannot be re-downloaded from a file that outlived the decision.
 *
 * Dynamic by necessity: it reads the session to decide who is asking.
 */
export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ code: string }> }) {
  // Next 16: params is a Promise. See CLAUDE.md §11.
  const { code } = await ctx.params;

  const volunteer = await getVolunteer();
  if (!volunteer) {
    return new Response("Sign in to download your certificate.", { status: 401 });
  }

  const cert = await getCertificateByCode(code);
  if (!cert) {
    return new Response("No certificate with that code.", { status: 404 });
  }

  // RLS already restricts the read to the owner or an admin, but say it here
  // too — policies are OR'd, and this route must not become a way for one
  // admin's own account to pull another volunteer's document by guessing.
  const owned = cert.user_id === volunteer.id;
  if (!owned && !(await getAdminUser())) {
    return new Response("That isn't your certificate.", { status: 403 });
  }

  if (cert.revoked_at) {
    return new Response(
      "This certificate has been withdrawn, so it can't be downloaded. Email us if that's a surprise.",
      { status: 410 },
    );
  }

  const pdf = await buildCertificatePdf(cert);

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${certificateFilename(cert)}"`,
      // Personal, and cheap to regenerate — never let a proxy hold a copy.
      "Cache-Control": "private, no-store",
    },
  });
}
