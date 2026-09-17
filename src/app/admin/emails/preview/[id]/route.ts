import { findSample } from "@/lib/email/samples";
import { requireOwner } from "@/lib/auth";

/** Serves one sample's raw HTML, so the preview page can show it in an iframe. */
export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireOwner("/admin/emails");
  const { id } = await ctx.params;

  const sample = findSample(id);
  if (!sample) return new Response("No such email.", { status: 404 });

  return new Response(sample.build().html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
