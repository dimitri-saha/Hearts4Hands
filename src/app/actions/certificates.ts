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
    subjectName: name,
    hours: eligibility.hours,
    cards: eligibility.cards,
    entryIds: eligibility.entryIds,
  });

  if (!cert) return errorState(UNCONFIGURED);

  if (volunteer.email) {
    const { sendBuilt } = await import("@/lib/email");
    const { certificateIssued } = await import("@/lib/email/templates");
    await sendBuilt(
      volunteer.email,
      certificateIssued(name, cert.code, Number(cert.hours), cert.cards),
    );
  }

  revalidatePath("/account/certificates");
  revalidatePath("/account");

  return successState(
    `Certificate ${cert.code} is ready. It's below, and you can download it as a PDF.`,
  );
}

/**
 * Issues a certificate for a whole club.
 *
 * Leaders only, re-checked against the database rather than trusted from the
 * form — a member could otherwise post a group id and mint a document for a
 * club they do not run.
 */
export async function requestClubCertificate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { requireVolunteer } = await import("@/lib/volunteer-auth");
  const { checkClubEligibility, issueCertificate } = await import("@/lib/certificates");
  const { getServiceClient } = await import("@/lib/supabase/server");

  const volunteer = await requireVolunteer("/account/certificates");
  const groupId = String(formData.get("groupId") ?? "").trim();
  if (!groupId) return errorState("We couldn't tell which club that was.");

  const limit = rateLimit(`clubcert:${volunteer.id}`, { limit: 6, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return errorState("That's a few requests in a row — give it an hour and try again.");
  }

  const admin = getServiceClient();
  if (!admin) return errorState(UNCONFIGURED);

  const { data: membership } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", volunteer.id)
    .maybeSingle();

  if (!membership) return errorState("You're not in that club.");
  if (membership.role !== "leader") {
    return errorState(
      "Only the club's leader can issue its certificate. Your own hours are still yours to certify above.",
    );
  }

  const { data: group } = await admin
    .from("groups")
    .select("name")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) return errorState("We couldn't find that club.");

  const eligibility = await checkClubEligibility(groupId);
  if (!eligibility.ok) {
    if (eligibility.reason === "nothing-new") {
      return errorState(
        "Your club's latest certificate already covers every hour we've approved for it.",
      );
    }
    return errorState(
      "No approved hours for this club yet. Once members log hours under the club and we check them, the certificate is one click away.",
    );
  }

  const cert = await issueCertificate({
    userId: volunteer.id,
    subjectName: group.name,
    kind: "club",
    groupId,
    volunteerCount: eligibility.totals.volunteers,
    hours: eligibility.totals.hours,
    cards: eligibility.totals.cards,
    entryIds: eligibility.entryIds,
  });

  if (!cert) return errorState(UNCONFIGURED);

  revalidatePath("/account/certificates");
  revalidatePath("/account/groups");

  return successState(`Certificate ${cert.code} is ready for ${group.name}.`);
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
