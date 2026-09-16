"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";

/**
 * Sends one of every email to a single address, so they can be read in a real
 * client rather than an iframe.
 *
 * Deliberately not a live-data preview: the samples carry stand-in names and
 * numbers, so nobody's real hours or story can be mailed to an admin by
 * accident while checking a layout.
 */
export async function sendSampleEmails(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { requireAdmin } = await import("@/lib/auth");
  const { isEmailConfigured, sendBuilt } = await import("@/lib/email");
  const { emailSamples } = await import("@/lib/email/samples");
  const { rateLimit } = await import("@/lib/rate-limit");

  const admin = await requireAdmin("/admin/emails");

  const to = String(formData.get("to") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
    return errorState("That doesn't look like an email address.");
  }

  if (!isEmailConfigured) {
    return errorState(
      "RESEND_API_KEY isn't set in this environment, so nothing can send from here. It is set on Vercel — run this from the deployed site instead.",
    );
  }

  const limit = rateLimit(`samples:${admin.id}`, { limit: 4, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return errorState("That's several batches in a row. Give it an hour.");
  }

  const results = await Promise.allSettled(
    emailSamples.map((s) => sendBuilt(to, { ...s.build(), subject: `[SAMPLE] ${s.build().subject}` })),
  );
  const sent = results.filter((r) => r.status === "fulfilled" && r.value).length;

  if (sent === 0) {
    return errorState("None of them sent. Check the Resend dashboard for the reason.");
  }
  if (sent < emailSamples.length) {
    return successState(
      `Sent ${sent} of ${emailSamples.length} to ${to}. The rest failed — check the Resend dashboard.`,
    );
  }
  return successState(`All ${sent} sent to ${to}. They'll arrive with [SAMPLE] in the subject.`);
}
