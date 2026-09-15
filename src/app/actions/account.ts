"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { notifyTeam } from "@/lib/email";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { UNDER_13, site } from "@/lib/site";
import { getServiceClient, getSessionClient } from "@/lib/supabase/server";
import {
  fieldErrors,
  loginSchema,
  magicLinkSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validation";

/**
 * Volunteer account flows.
 *
 * Two rules run through all of it:
 *
 *   1. **No account enumeration.** Sign-up, magic link, and password reset all
 *      return the same message whether or not the address exists. Otherwise
 *      the forms become a tool for checking who has an account — and for a site
 *      whose users are largely minors, that matters more than the small
 *      convenience of a precise error.
 *   2. **The profile is written with the service role**, never by the new user.
 *      With email confirmation on, `signUp` returns a user but no session, so
 *      there is no authenticated context to write it from.
 */

const UNCONFIGURED =
  "Accounts aren't switched on yet. Please email us and we'll sort it out.";

const CHECK_INBOX =
  "Check your email. If that address has an account with us, a link is on its way — it expires in an hour.";

function redirectTarget(next: string | null | undefined) {
  // Only same-origin relative paths, so `?next=` can't become an open redirect.
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------

export async function signUpVolunteer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = rateLimit(await clientKey("signup"), { limit: 5, windowMs: 30 * 60 * 1000 });
  if (!limit.ok) {
    return errorState("That's a few attempts in a row. Please wait a little and try again.");
  }

  const parsed = signUpSchema.safeParse({
    website: formData.get("website") ?? "",
    elapsed: formData.get("elapsed") ?? 9999,
    fullName: formData.get("fullName") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    ageGroup: formData.get("ageGroup") ?? "",
    country: formData.get("country") ?? "",
    terms: formData.get("terms") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error));
  }

  const supabase = await getSessionClient();
  const admin = getServiceClient();
  if (!supabase || !admin) return errorState(UNCONFIGURED);

  const data = parsed.data;
  const isGuardian = data.ageGroup === UNDER_13;

  const { data: signUp, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { emailRedirectTo: `${site.url}/auth/callback?next=/account` },
  });

  if (error) {
    // Rate limits and genuinely malformed addresses are worth surfacing; the
    // rest is deliberately vague.
    console.error("[account] signUp failed:", error.message);
    return errorState(
      /rate|limit/i.test(error.message)
        ? "Too many sign-up emails have gone out just now. Please try again shortly."
        : "We couldn't create that account. Please check the address and try again.",
    );
  }

  // Supabase returns a user with an empty `identities` array when the address
  // is already registered, rather than erroring — that's how it avoids
  // enumeration. Only write a profile for a genuinely new account.
  const isNewAccount = (signUp.user?.identities?.length ?? 0) > 0;

  if (isNewAccount && signUp.user) {
    const { error: profileError } = await admin.from("profiles").insert({
      user_id: signUp.user.id,
      full_name: data.fullName,
      age_group: data.ageGroup,
      country: data.country,
      is_guardian_account: isGuardian,
      terms_accepted_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("[account] profile insert failed:", profileError.message);
      return errorState(
        "Your account was created but we couldn't finish setting it up. Please email us.",
      );
    }
  }

  return successState(
    isGuardian
      ? "Account created. Check the inbox for a confirmation link — as the parent or guardian, everything comes to you."
      : "Account created. Check your email for a confirmation link, then you can sign in.",
  );
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export async function signInWithPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = rateLimit(await clientKey("login"), { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return errorState("Too many attempts. Please wait a couple of minutes and try again.");
  }

  const parsed = loginSchema.safeParse({
    website: formData.get("website") ?? "",
    elapsed: formData.get("elapsed") ?? 9999,
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error));
  }

  const supabase = await getSessionClient();
  if (!supabase) return errorState(UNCONFIGURED);

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return errorState(
      /confirm/i.test(error.message)
        ? "That address hasn't been confirmed yet. Check your email for the confirmation link."
        : "That email and password didn't match. Please try again.",
    );
  }

  redirect(redirectTarget(String(formData.get("next") ?? "")));
}

/** Passwordless sign-in for an account that already exists. */
export async function sendMagicLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = rateLimit(await clientKey("magiclink"), { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return errorState("A few links have gone out already. Please wait a little before asking again.");
  }

  const parsed = magicLinkSchema.safeParse({
    website: formData.get("website") ?? "",
    elapsed: formData.get("elapsed") ?? 9999,
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error));
  }

  const supabase = await getSessionClient();
  if (!supabase) return errorState(UNCONFIGURED);

  const next = redirectTarget(String(formData.get("next") ?? ""));
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      // Never create an account from a login form: sign-up collects a name and
      // age bracket, and an account without those has no profile.
      shouldCreateUser: false,
      emailRedirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) console.error("[account] magic link failed:", error.message);

  // Same answer either way — see the enumeration note at the top.
  return successState(CHECK_INBOX);
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = rateLimit(await clientKey("reset"), { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return errorState("A few reset emails have gone out already. Please wait a little.");
  }

  const parsed = magicLinkSchema.safeParse({
    website: formData.get("website") ?? "",
    elapsed: formData.get("elapsed") ?? 9999,
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error));
  }

  const supabase = await getSessionClient();
  if (!supabase) return errorState(UNCONFIGURED);

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${site.url}/auth/callback?next=/reset-password`,
  });

  if (error) console.error("[account] password reset failed:", error.message);

  return successState(CHECK_INBOX);
}

/** Runs on `/reset-password`, where the recovery link has already signed them in. */
export async function updatePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error));
  }

  const supabase = await getSessionClient();
  if (!supabase) return errorState(UNCONFIGURED);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorState(
      "That reset link has expired. Please request a new one — they only last an hour.",
    );
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error("[account] updateUser failed:", error.message);
    return errorState("We couldn't change that password. Please request a fresh link.");
  }

  return successState("Password changed. You're signed in.");
}

// ---------------------------------------------------------------------------

export async function signOutVolunteer() {
  const supabase = await getSessionClient();
  await supabase?.auth.signOut();
  redirect("/");
}

// ---------------------------------------------------------------------------
// Logging hours from inside an account
// ---------------------------------------------------------------------------

/**
 * The volunteer's identity comes from the session, never from the form.
 *
 * That's the whole reason hour logging moved behind a login: an anonymous form
 * can claim to be anyone, so hours couldn't be trusted enough to certify. Here
 * `user_id`, the name and the email are read off the server-side session and
 * profile, so a crafted request can only ever log hours against itself.
 */
export async function logHours(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { requireVolunteer, isGuardianAccount } = await import("@/lib/volunteer-auth");
  const { logHoursSchema, validateProofFile } = await import("@/lib/validation");
  const { PROOF_BUCKET } = await import("@/lib/supabase/types");
  const { randomUUID } = await import("node:crypto");
  const { echoValues } = await import("@/lib/action-state");

  const volunteer = await requireVolunteer("/account/hours");
  const echoed = echoValues(formData, ["activities"]);

  const limit = rateLimit(`hours:${volunteer.id}`, { limit: 12, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return errorState("That's a lot of entries at once. Please wait a little.", undefined, echoed);
  }

  const parsed = logHoursSchema.safeParse({
    website: formData.get("website") ?? "",
    elapsed: formData.get("elapsed") ?? 9999,
    activities: formData.getAll("activities").map(String),
    hours: formData.get("hours") || 0,
    cardsMade: formData.get("cardsMade") || 0,
    activityDate: formData.get("activityDate") ?? "",
    notes: formData.get("notes") ?? "",
    groupId: formData.get("groupId") ?? "",
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

  const admin = getServiceClient();
  if (!admin) return errorState(UNCONFIGURED, undefined, echoed);

  const data = parsed.data;

  // Only accept a group this volunteer actually belongs to — otherwise anyone
  // could inflate another club's total by posting its id.
  let groupId: string | null = null;
  if (data.groupId) {
    const { data: membership } = await admin
      .from("group_members")
      .select("group_id")
      .eq("group_id", data.groupId)
      .eq("user_id", volunteer.id)
      .maybeSingle();
    groupId = membership?.group_id ?? null;
  }

  let proofPath: string | null = null;
  if (proofFile) {
    const ext = proofFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from(PROOF_BUCKET)
      .upload(path, proofFile, { contentType: proofFile.type, upsert: false });

    if (uploadError) {
      console.error("[account] proof upload failed:", uploadError.message);
      return errorState(
        "We couldn't upload that photo. You can save without it and email it to us instead.",
        { proof: "Upload failed — try a smaller file, or save without a photo." },
        echoed,
      );
    }
    proofPath = path;
  }

  const profile = volunteer.profile;
  const { error } = await admin.from("volunteer_signups").insert({
    user_id: volunteer.id,
    group_id: groupId,
    full_name: profile?.full_name ?? "Unknown",
    email: volunteer.email ?? "",
    age_group: profile?.age_group ?? null,
    country: profile?.country ?? "Not given",
    state: null,
    city: null,
    // Never stored for a guardian-held account: a school plus a town narrows
    // down a specific child.
    school: null,
    activities: data.activities,
    hours: data.hours,
    cards_made: data.cardsMade,
    activity_date: data.activityDate,
    notes: data.notes,
    proof_path: proofPath,
  });

  if (error) {
    console.error("[account] logHours insert failed:", error.message);
    return errorState("Something went wrong saving that. Please try again.", undefined, echoed);
  }

  await notifyTeam(
    "New hours logged",
    `${profile?.full_name ?? "A volunteer"} (${volunteer.email})\n` +
      `Hours: ${data.hours} · Cards: ${data.cardsMade}\n` +
      `Guardian account: ${isGuardianAccount(volunteer) ? "yes" : "no"}\n` +
      `Proof: ${proofPath ? "attached" : "none"}\n\n` +
      `Review at ${site.url}/admin/volunteers`,
    volunteer.email ?? undefined,
  );

  revalidatePath("/account");
  return successState(
    "Logged. A real person checks every entry — it'll count toward your certificate once approved.",
  );
}
