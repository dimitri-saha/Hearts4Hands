"use server";

import {
  echoValues,
  errorState,
  successState,
  type ActionState,
} from "@/lib/action-state";
import { notifyTeam, sendBuilt } from "@/lib/email";
import { messageReceived, storyReceived } from "@/lib/email/templates";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { contact as contactInfo, site } from "@/lib/site";
import { getServiceClient } from "@/lib/supabase/server";
import { getVolunteer, isGuardianAccount } from "@/lib/volunteer-auth";
import { isSupabaseWritable } from "@/lib/supabase/env";
import {
  MIN_FILL_MS,
  blogSubmissionSchema,
  contactSchema,
  fieldErrors,
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

  // Story submission is account-only, and never from a guardian-held under-13
  // account. The form hides it and a trigger in migration 0004 refuses it —
  // this is the middle layer, and the one that returns a decent message.
  const volunteer = await getVolunteer();
  if (!volunteer) {
    return errorState("Please sign in first — stories are sent from your account.", undefined, echoed);
  }
  if (isGuardianAccount(volunteer)) {
    return errorState(
      "This account is looked after by a parent or guardian for a volunteer under 13, so it can't send stories. Card-making hours are very welcome though.",
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
    // The by-line stays editable — we promise authors they can publish under a
    // first name only — but the contact address comes from the session, so an
    // editor is always writing to the person who actually submitted it.
    author_name: data.authorName,
    author_email: volunteer.email ?? data.authorEmail,
    author_location: data.authorLocation,
    body: data.body,
    user_id: volunteer.id,
  });

  if (error) {
    console.error("[blog] insert failed:", error.message);
    return errorState(
      "Something went wrong saving that. Please try again — and if it keeps failing, email your story to us so it isn't lost.",
      undefined,
      echoed,
    );
  }

  const [confirmation] = await Promise.allSettled([
    sendBuilt(
      data.authorEmail,
      storyReceived(data.authorName, data.title),
      contactInfo.editor,
    ),
    notifyTeam(
      "New story submission",
      [
        ["Title", data.title],
        ["Category", data.category],
        ["From", `${data.authorName} <${data.authorEmail}>`],
        ["Length", `${data.body.length.toLocaleString()} characters`],
      ],
      `${site.url}/admin/stories`,
      data.authorEmail,
    ),
  ]);

  // Same reasoning as the volunteer action: only mention the email if one sent.
  const emailed = confirmation.status === "fulfilled" && confirmation.value;

  return successState(
    [
      "Your story is with our editors. Thank you for trusting us with it.",
      emailed ? "A confirmation is on its way to your inbox." : null,
    ]
      .filter(Boolean)
      .join(" "),
  );
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
    sendBuilt(data.email, messageReceived(data.name)),
    notifyTeam(
      `New message: ${data.subject || data.topic}`,
      [
        ["From", `${data.name} <${data.email}>`],
        ["Topic", data.topic],
        ["Message", data.message.slice(0, 400)],
      ],
      `${site.url}/admin/messages`,
      data.email,
    ),
  ]);

  return successState("Message sent! We usually reply within a few days.");
}
