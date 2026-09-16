"use server";

import { revalidatePath } from "next/cache";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { rateLimit } from "@/lib/rate-limit";

const UNCONFIGURED =
  "Certificates aren't switched on yet. Email us and we'll sort it out by hand.";

/**
 * Issues a certificate for the signed-in volunteer's approved work.
 *
 * No admin step: the hours on it have already been approved one by one at
 * /admin/volunteers, so making somebody wait again for a document that only
 * restates those decisions would be a second queue for no extra safety.
 */
export async function requestCertificate(): Promise<ActionState> {
  const { requireVolunteer, volunteerName } = await import("@/lib/volunteer-auth");
  const { checkEligibility, issueCertificate } = await import("@/lib/certificates");

  const volunteer = await requireVolunteer("/account/certificates");

  const limit = rateLimit(`cert:${volunteer.id}`, { limit: 6, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return errorState("That's a few requests in a row — give it an hour and try again.");
  }

  const name = volunteerName(volunteer).trim();
  if (!name || name.toLowerCase() === "unknown") {
    return errorState(
      "We need your name before we can put it on a certificate. Add it to your profile first.",
    );
  }

  const eligibility = await checkEligibility(volunteer.id);

  if (!eligibility.ok) {
    if (eligibility.reason === "nothing-new") {
      return errorState(
        "Your latest certificate already covers everything that's been approved. Log more hours, and once they're approved you can get an updated one.",
      );
    }
    return errorState(
      "No approved hours yet. Once an admin has checked something you've logged, your certificate is one click away.",
    );
  }

  const cert = await issueCertificate({
    userId: volunteer.id,
    fullName: name,
    hours: eligibility.hours,
    cards: eligibility.cards,
    entryIds: eligibility.entryIds,
  });

  if (!cert) return errorState(UNCONFIGURED);

  revalidatePath("/account/certificates");
  revalidatePath("/account");

  return successState(
    `Certificate ${cert.code} is ready. It's below, and you can download it as a PDF.`,
  );
}

/**
 * Revokes a certificate.
 *
 * The counterpart to being able to reject already-approved hours: without this,
 * a certificate issued off hours later found to be wrong would stand forever,
 * and /verify would keep confirming it.
 */
export async function revokeCertificate(formData: FormData): Promise<void> {
  const { requireAdmin } = await import("@/lib/auth");
  const { getServiceClient } = await import("@/lib/supabase/server");

  const admin = await requireAdmin();
  const client = getServiceClient();
  if (!client) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  const undo = String(formData.get("undo") ?? "") === "1";

  const { error } = await client
    .from("certificates")
    .update(
      undo
        ? { revoked_at: null, revoked_reason: null, revoked_by: null }
        : {
            revoked_at: new Date().toISOString(),
            revoked_reason: reason || null,
            revoked_by: admin.id,
          },
    )
    .eq("id", id);

  if (error) {
    console.error("[certificates] revoke failed:", error.message);
    return;
  }

  revalidatePath("/admin/certificates");
  revalidatePath("/account/certificates");
}
