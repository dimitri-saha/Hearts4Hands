"use server";

import { randomUUID } from "node:crypto";

import {
  echoValues,
  errorState,
  successState,
  type ActionState,
} from "@/lib/action-state";
import { emailTemplates, notifyTeam, sendEmail } from "@/lib/email";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { contact as contactInfo, site } from "@/lib/site";
import { getServiceClient } from "@/lib/supabase/server";
import { isSupabaseWritable } from "@/lib/supabase/env";
import { PROOF_BUCKET } from "@/lib/supabase/types";
import {
  MIN_FILL_MS,
  blogSubmissionSchema,
  contactSchema,
  fieldErrors,
  validateProofFile,
  volunteerSchema,
} from "@/lib/validation";

const SPAM_MESSAGE = "Something went wrong sending that. Please try again in a moment.";
const UNCONFIGURED_MESSAGE =
  "Our forms aren't switched on quite yet. Please email us and we'll take it from there.";

/** Honeypot + minimum-fill-time gate, shared by all three public forms. */
function looksAutomated(formData: FormData) {
  const honeypot = String(formData.get("website") ?? "");
  if (honeypot.trim().length > 0) return true;
  const elapsed = Number(formData.get("elapsed") ?? 0);
  return Number.isFinite(elapsed) && elapsed > 0 && elapsed < MIN_FILL_MS;
}

// ---------------------------------------------------------------------------
// Volunteer sign-up / hour log — PRD §5.2
// ---------------------------------------------------------------------------

export async function submitVolunteer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const echoed = echoValues(formData, ["activities"]);

  if (looksAutomated(formData)) {
    return errorState(SPAM_MESSAGE, undefined, echoed);
  }

  const limit = rateLimit(await clientKey("volunteer"), { limit: 6, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return errorState(
      "That's a few submissions in a row! Please wait a couple of minutes and try again.",
      undefined,
      echoed,
    );
  }

  const parsed = volunteerSchema.safeParse({
    website: formData.get("website") ?? "",
    elapsed: formData.get("elapsed") ?? 9999,
    fullName: formData.get("fullName") ?? "",
    email: formData.get("email") ?? "",
    ageGroup: formData.get("ageGroup") ?? "",
    country: formData.get("country") ?? "",
    state: formData.get("state") ?? "",
    city: formData.get("city") ?? "",
    school: formData.get("school") ?? "",
    activities: formData.getAll("activities").map(String),
    hours: formData.get("hours") || 0,
    cardsMade: formData.get("cardsMade") || 0,
    activityDate: formData.get("activityDate") ?? "",
    notes: formData.get("notes") ?? "",
    consent: formData.get("consent") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error), echoed);
  }

  const proof = formData.get("proof");
  const proofFile = proof instanceof File && proof.size > 0 ? proof : null;
  const proofError = validateProofFile(proofFile);
  if (proofError) {
    return errorState("Please check the highlighted fields.", { proof: proofError }, echoed);
  }

  const supabase = getServiceClient();
  if (!supabase || !isSupabaseWritable) {
    console.warn("[volunteer] Supabase not configured; submission dropped.");
    return errorState(UNCONFIGURED_MESSAGE, undefined, echoed);
  }

  const data = parsed.data;

  // Upload the proof photo first — if storage fails we'd rather tell the
  // volunteer than silently record a submission with a missing attachment.
  let proofPath: string | null = null;
  if (proofFile) {
    const ext = proofFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(PROOF_BUCKET)
      .upload(path, proofFile, { contentType: proofFile.type, upsert: false });

    if (uploadError) {
      console.error("[volunteer] proof upload failed:", uploadError.message);
      return errorState(
        "We couldn't upload that photo. You can submit without it and email it to us instead.",
        { proof: "Upload failed — try a smaller file, or submit without a photo." },
        echoed,
      );
    }
    proofPath = path;
  }

  const { error } = await supabase.from("volunteer_signups").insert({
    full_name: data.fullName,
    email: data.email,
    age_group: data.ageGroup,
    country: data.country,
    state: data.state,
    city: data.city,
    school: data.school,
    activities: data.activities,
    hours: data.hours,
    cards_made: data.cardsMade,
    activity_date: data.activityDate,
    notes: data.notes,
    proof_path: proofPath,
  });

  if (error) {
    console.error("[volunteer] insert failed:", error.message);
    return errorState(
      "Something went wrong saving that. Please try again, or email us directly.",
      undefined,
      echoed,
    );
  }

  await Promise.allSettled([
    sendEmail({
      to: data.email,
      subject: `Thanks for volunteering with ${site.name}!`,
      text: emailTemplates.volunteerConfirmation(data.fullName, data.hours),
    }),
    notifyTeam(
      "New volunteer submission",
      `${data.fullName} (${data.email})\n` +
        `${[data.city, data.state, data.country].filter(Boolean).join(", ")}\n` +
        `Hours: ${data.hours} · Cards: ${data.cardsMade}\n` +
        `Activities: ${data.activities.join(", ")}\n` +
        `Proof: ${proofPath ? "attached" : "none"}\n\n` +
        `Review at ${site.url}/admin/volunteers`,
      data.email,
    ),
  ]);

  return successState(
    data.hours > 0
      ? "Your hours are logged and a real person will review them soon."
      : "You're signed up! Check your inbox for what happens next.",
  );
}

// ---------------------------------------------------------------------------
// Blog submission — PRD §5.4
// ---------------------------------------------------------------------------

export async function submitBlogPost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const echoed = echoValues(formData);

  if (looksAutomated(formData)) {
    return errorState(SPAM_MESSAGE, undefined, echoed);
  }

  const limit = rateLimit(await clientKey("blog"), { limit: 4, windowMs: 30 * 60 * 1000 });
  if (!limit.ok) {
    return errorState(
      "You've sent a few submissions already. Give it a little while before sending another.",
      undefined,
      echoed,
    );
  }

  const parsed = blogSubmissionSchema.safeParse({
    website: formData.get("website") ?? "",
    elapsed: formData.get("elapsed") ?? 9999,
    title: formData.get("title") ?? "",
    category: formData.get("category") ?? "",
    authorName: formData.get("authorName") ?? "",
    authorEmail: formData.get("authorEmail") ?? "",
    authorLocation: formData.get("authorLocation") ?? "",
    body: formData.get("body") ?? "",
    consent: formData.get("consent") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error), echoed);
  }

  const supabase = getServiceClient();
  if (!supabase || !isSupabaseWritable) {
    console.warn("[blog] Supabase not configured; submission dropped.");
    return errorState(UNCONFIGURED_MESSAGE, undefined, echoed);
  }

  const data = parsed.data;
  const { error } = await supabase.from("blog_submissions").insert({
    title: data.title,
    category: data.category,
    author_name: data.authorName,
    author_email: data.authorEmail,
    author_location: data.authorLocation,
    body: data.body,
  });

  if (error) {
    console.error("[blog] insert failed:", error.message);
    return errorState(
      "Something went wrong saving that. Please try again — and if it keeps failing, email your story to us so it isn't lost.",
      undefined,
      echoed,
    );
  }

  await Promise.allSettled([
    sendEmail({
      to: data.authorEmail,
      subject: `We received your story: ${data.title}`,
      text: emailTemplates.blogConfirmation(data.authorName, data.title),
      replyTo: contactInfo.editor,
    }),
    notifyTeam(
      "New story submission",
      `"${data.title}" (${data.category})\n` +
        `By ${data.authorName} <${data.authorEmail}>\n` +
        `${data.body.length.toLocaleString()} characters\n\n` +
        `Review at ${site.url}/admin/stories`,
      data.authorEmail,
    ),
  ]);

  return successState("Your story is with our editors. Thank you for trusting us with it.");
}

// ---------------------------------------------------------------------------
// Contact — PRD §5.1
// ---------------------------------------------------------------------------

export async function submitContact(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const echoed = echoValues(formData);

  if (looksAutomated(formData)) {
    return errorState(SPAM_MESSAGE, undefined, echoed);
  }

  const limit = rateLimit(await clientKey("contact"), { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return errorState(
      "That's a few messages in a row! Please wait a couple of minutes and try again.",
      undefined,
      echoed,
    );
  }

  const parsed = contactSchema.safeParse({
    website: formData.get("website") ?? "",
    elapsed: formData.get("elapsed") ?? 9999,
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    topic: formData.get("topic") || "general",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error), echoed);
  }

  const supabase = getServiceClient();
  if (!supabase || !isSupabaseWritable) {
    console.warn("[contact] Supabase not configured; message dropped.");
    return errorState(UNCONFIGURED_MESSAGE, undefined, echoed);
  }

  const data = parsed.data;
  const { error } = await supabase.from("contact_messages").insert({
    name: data.name,
    email: data.email,
    topic: data.topic,
    subject: data.subject,
    message: data.message,
  });

  if (error) {
    console.error("[contact] insert failed:", error.message);
    return errorState(
      "Something went wrong sending that. Please email us directly instead.",
      undefined,
      echoed,
    );
  }

  await Promise.allSettled([
    sendEmail({
      to: data.email,
      subject: `We got your message — ${site.name}`,
      text: emailTemplates.contactConfirmation(data.name),
    }),
    notifyTeam(
      `New message: ${data.subject || data.topic}`,
      `From ${data.name} <${data.email}>\nTopic: ${data.topic}\n\n${data.message}`,
      data.email,
    ),
  ]);

  return successState("Message sent! We usually reply within a few days.");
}
