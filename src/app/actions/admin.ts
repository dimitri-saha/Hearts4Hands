"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin, requireOwner } from "@/lib/auth";
import { excerptFrom, slugify } from "@/lib/utils";
import { getServiceClient, getSessionClient } from "@/lib/supabase/server";
import { PROOF_BUCKET } from "@/lib/supabase/types";
import { fieldErrors, publishSchema, statsSchema } from "@/lib/validation";

/**
 * Admin-only mutations.
 *
 * Every function here starts with a guard. `requireAdmin()` allows editors,
 * and is used only by the story-queue actions they were recruited for.
 * `requireOwner()` is everything else — volunteer hours, proof photos, the
 * impact numbers, contact messages — which redirects to the
 * login page when the caller isn't on the `admins` allow-list. Server actions
 * are POST endpoints reachable by anyone who knows the action id, so the guard
 * has to live in the action, not only in the page that renders the form.
 */

const NO_DB = "Supabase isn't configured, so there's nothing to save to yet.";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return errorState("Enter your email and password.");
  }

  const supabase = await getSessionClient();
  if (!supabase) return errorState(NO_DB);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    // Deliberately vague: don't confirm which accounts exist.
    return errorState("That email and password didn't match. Please try again.");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return errorState(
      "That account isn't set up as an editor yet. Ask an existing admin to add you.",
    );
  }

  // Only allow same-origin relative paths as a redirect target.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  redirect(safeNext);
}

export async function signOut() {
  const supabase = await getSessionClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Volunteer submissions
// ---------------------------------------------------------------------------

export async function reviewVolunteer(formData: FormData): Promise<void> {
  await requireOwner("/admin/volunteers");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("reviewerNote") ?? "").trim();

  if (!id || !["pending", "approved", "rejected"].includes(status)) return;

  const supabase = getServiceClient();
  if (!supabase) return;

  // Read the row first: the volunteer needs telling what was decided, and after
  // the update we would no longer know whose entry it was or how big it was.
  const { data: entry } = await supabase
    .from("volunteer_signups")
    .select("user_id, full_name, email, hours")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("volunteer_signups")
    .update({
      status: status as "pending" | "approved" | "rejected",
      reviewer_note: note || null,
      reviewed_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) console.error("[admin] reviewVolunteer failed:", error.message);

  // Tell the volunteer. Before this, an entry could sit approved or rejected
  // indefinitely with nobody outside the admin screen any the wiser.
  if (!error && entry?.email && status !== "pending") {
    const { sendBuilt } = await import("@/lib/email");
    const { hoursApproved, hoursRejected } = await import("@/lib/email/templates");
    const hours = Number(entry.hours) || 0;
    const name = entry.full_name?.trim() || "there";

    if (status === "approved") {
      let total = hours;
      if (entry.user_id) {
        const { data: all } = await supabase
          .from("volunteer_signups")
          .select("hours")
          .eq("user_id", entry.user_id)
          .eq("status", "approved");
        total = Math.round((all ?? []).reduce((n, r) => n + (Number(r.hours) || 0), 0) * 10) / 10;
      }
      await sendBuilt(entry.email, hoursApproved(name, hours, total));
    } else {
      await sendBuilt(
        entry.email,
        hoursRejected(name, hours, note || "No reason was recorded — reply and we'll explain."),
      );
    }
  }

  revalidatePath("/admin/volunteers");
  revalidatePath("/admin");
  // The public impact numbers are counted from approved entries, so a decision
  // here changes them. Without these the home and donate pages would keep
  // serving stale figures until their ISR window expired.
  revalidatePath("/");
  revalidatePath("/donate");
  revalidatePath("/about");
}

/**
 * Short-lived signed URL for a private proof upload.
 *
 * Minted fresh on every render of the volunteers page, so the expiry is never
 * a deadline for reviewing — it only bounds how long one particular link stays
 * usable if it's copied elsewhere or the tab is left open. Two hours is long
 * enough that a reviewer never meets it in practice, and short enough that a
 * leaked URL stops working the same afternoon.
 */
export async function getProofUrl(path: string): Promise<string | null> {
  await requireOwner("/admin/volunteers");

  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(path, 60 * 120);

  if (error) {
    console.error("[admin] signed URL failed:", error.message);
    return null;
  }
  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// Story submissions & posts
// ---------------------------------------------------------------------------

export async function setSubmissionStatus(formData: FormData): Promise<void> {
  await requireAdmin("/admin/stories");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("reviewerNote") ?? "").trim();

  if (!id || !["pending", "approved", "rejected"].includes(status)) return;

  const supabase = getServiceClient();
  if (!supabase) return;

  const { data: updated, error } = await supabase
    .from("blog_submissions")
    .update({
      status: status as "pending" | "approved" | "rejected",
      reviewer_note: note || null,
      reviewed_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", id)
    .select("published_post_id")
    .maybeSingle();

  if (error) {
    console.error("[admin] setSubmissionStatus failed:", error.message);
  }

  // Turning a story down has to take it off the public blog too. Without this,
  // a story that was published and later rejected stays live, and the only
  // sign anything changed is a badge on an admin page nobody is looking at.
  // Unpublishing (rather than deleting) keeps it recoverable.
  if (!error && status === "rejected" && updated?.published_post_id) {
    const { error: unpublishError } = await supabase
      .from("posts")
      .update({ status: "draft", featured: false })
      .eq("id", updated.published_post_id);

    if (unpublishError) {
      console.error("[admin] unpublishing a rejected story failed:", unpublishError.message);
    } else {
      revalidatePath("/blog");
      revalidatePath("/");
    }
  }

  revalidatePath("/admin/stories");
  revalidatePath("/admin");
}

/**
 * Permanently delete every not-approved story submission, plus the unpublished
 * posts made from them.
 *
 * Deliberately hard-deletes rather than archiving: these are unpublished
 * drafts of other people's personal writing, and holding onto rejected copies
 * indefinitely is the wrong default.
 *
 * The derived posts have to go in the same sweep. `posts.submission_id` is
 * ON DELETE SET NULL, so deleting only the submission leaves an orphaned draft
 * sitting in the posts table — and once its `submission_id` is null, nothing
 * marks it as coming from a rejected story, so the Publish and Feature buttons
 * come back. A post that is currently published is left alone rather than
 * yanked out from under readers; rejecting already unpublishes, so that only
 * happens if someone re-published it by hand.
 */
export async function clearRejectedSubmissions(): Promise<void> {
  await requireAdmin("/admin/stories");

  const supabase = getServiceClient();
  if (!supabase) return;

  const { data: rejected, error: lookupError } = await supabase
    .from("blog_submissions")
    .select("id")
    .eq("status", "rejected");

  if (lookupError) {
    console.error("[admin] clearRejectedSubmissions lookup failed:", lookupError.message);
    return;
  }

  const ids = (rejected ?? []).map((row) => row.id);
  if (ids.length === 0) return;

  // Drafts first: once the submissions are gone we can no longer tell which
  // posts came from them.
  const { error: postError } = await supabase
    .from("posts")
    .delete()
    .in("submission_id", ids)
    .eq("status", "draft");

  if (postError) {
    console.error("[admin] clearing derived draft posts failed:", postError.message);
    return;
  }

  const { error } = await supabase.from("blog_submissions").delete().eq("status", "rejected");
  if (error) console.error("[admin] clearRejectedSubmissions failed:", error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath("/");
}

/**
 * Delete a single post outright, along with the submission it came from.
 *
 * Without this there is no way to remove a post from the admin panel at all —
 * only to unpublish it — so a draft nobody wants sits in the table forever.
 * Guarded to drafts: taking down something live should be a deliberate
 * Unpublish first, so it can't happen in one click.
 *
 * The source submission goes too. Deleting a post but leaving its submission
 * behind strands an "Approved" row in the queue for a story that no longer
 * exists, which is exactly the clutter this is meant to clear. The
 * confirmation says so.
 */
export async function deletePost(formData: FormData): Promise<void> {
  await requireAdmin("/admin/stories");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getServiceClient();
  if (!supabase) return;

  const { data: deleted, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("status", "draft")
    .select("submission_id")
    .maybeSingle();

  if (error) {
    console.error("[admin] deletePost failed:", error.message);
    return;
  }

  if (deleted?.submission_id) {
    const { error: subError } = await supabase
      .from("blog_submissions")
      .delete()
      .eq("id", deleted.submission_id);

    if (subError) {
      console.error("[admin] deleting the source submission failed:", subError.message);
    }
  }

  revalidatePath("/admin/stories");
  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath("/");
}

/**
 * Delete one story submission, whatever its status.
 *
 * The bulk clear only covers not-approved ones; this is how an approved or
 * pending submission gets removed from the queue. Any post already built from
 * it is left alone — that post may well be live, and it stands on its own once
 * published.
 */
export async function deleteSubmission(formData: FormData): Promise<void> {
  await requireAdmin("/admin/stories");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getServiceClient();
  if (!supabase) return;

  const { error } = await supabase.from("blog_submissions").delete().eq("id", id);
  if (error) console.error("[admin] deleteSubmission failed:", error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/admin");
}

/**
 * Publish (or save as draft) an edited submission. Slugs are uniquified with a
 * numeric suffix rather than failing, so an editor never loses their edits to
 * a collision on the way out.
 */
export async function publishStory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin("/admin/stories");

  const parsed = publishSchema.safeParse({
    submissionId: formData.get("submissionId") || undefined,
    slug: formData.get("slug") ?? "",
    title: formData.get("title") ?? "",
    category: formData.get("category") ?? "",
    authorName: formData.get("authorName") ?? "",
    authorLocation: formData.get("authorLocation") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    body: formData.get("body") ?? "",
    featured: formData.get("featured") ?? "",
    status: formData.get("status") ?? "published",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error));
  }

  const supabase = getServiceClient();
  if (!supabase) return errorState(NO_DB);

  const data = parsed.data;
  const baseSlug = slugify(data.slug || data.title) || "story";

  const { data: taken } = await supabase
    .from("posts")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  let slug = baseSlug;
  const existing = new Set((taken ?? []).map((r) => r.slug));
  for (let i = 2; existing.has(slug); i++) slug = `${baseSlug}-${i}`;

  const { data: inserted, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title: data.title,
      category: data.category,
      author_name: data.authorName,
      author_location: data.authorLocation,
      excerpt: data.excerpt || excerptFrom(data.body),
      body: data.body,
      status: data.status,
      featured: data.featured === "on",
      published_at: data.status === "published" ? new Date().toISOString() : null,
      submission_id: data.submissionId ?? null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[admin] publishStory failed:", error?.message);
    return errorState("Couldn't save that post. Please try again.");
  }

  if (data.submissionId) {
    await supabase
      .from("blog_submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        published_post_id: inserted.id,
      })
      .eq("id", data.submissionId);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/stories");
  revalidatePath("/");

  return successState(
    data.status === "published"
      ? `Published — it's live at /blog/${slug}.`
      : "Saved as a draft. It won't appear on the site until you publish it.",
  );
}

/** Toggle a published post's visibility or featured flag. */
export async function updatePost(formData: FormData): Promise<void> {
  await requireAdmin("/admin/stories");

  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  if (!id) return;

  const supabase = getServiceClient();
  if (!supabase) return;

  const patch =
    intent === "publish"
      ? { status: "published" as const, published_at: new Date().toISOString() }
      : intent === "unpublish"
        ? { status: "draft" as const }
        : intent === "feature"
          ? { featured: true }
          : intent === "unfeature"
            ? { featured: false }
            : null;

  if (!patch) return;

  // Only one post carries the featured flag at a time.
  if (intent === "feature") {
    await supabase.from("posts").update({ featured: false }).eq("featured", true);
  }

  const { error } = await supabase.from("posts").update(patch).eq("id", id);
  if (error) console.error("[admin] updatePost failed:", error.message);

  revalidatePath("/blog");
  revalidatePath("/admin/stories");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Impact numbers — PRD §5.3, manually maintained
// ---------------------------------------------------------------------------

export async function updateStats(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireOwner("/admin/stats");

  const parsed = statsSchema.safeParse({
    totalRaised: formData.get("totalRaised") || 0,
    materials: formData.get("materials") || 0,
    research: formData.get("research") || 0,
    goal: formData.get("goal") || 0,
    cardsMade: formData.get("cardsMade") || 0,
    volunteers: formData.get("volunteers") || 0,
    hoursLogged: formData.get("hoursLogged") || 0,
    hospitalsServed: formData.get("hospitalsServed") || 0,
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return errorState("Please check the highlighted fields.", fieldErrors(parsed.error));
  }

  const supabase = getServiceClient();
  if (!supabase) return errorState(NO_DB);

  const d = parsed.data;
  const toCents = (dollars: number) => Math.round(dollars * 100);

  const { error } = await supabase
    .from("site_stats")
    .update({
      total_raised_cents: toCents(d.totalRaised),
      materials_cents: toCents(d.materials),
      research_cents: toCents(d.research),
      goal_cents: toCents(d.goal),
      cards_made: d.cardsMade,
      volunteers: d.volunteers,
      hours_logged: d.hoursLogged,
      hospitals_served: d.hospitalsServed,
      note: d.note || null,
    })
    .eq("id", 1);

  if (error) {
    console.error("[admin] updateStats failed:", error.message);
    return errorState("Couldn't save those numbers. Please try again.");
  }

  revalidatePath("/");
  revalidatePath("/donate");
  revalidatePath("/about");
  revalidatePath("/admin/stats");

  const allocated = d.materials + d.research;
  const mismatch = Math.abs(allocated - d.totalRaised) > 0.01;

  return successState(
    mismatch
      ? `Saved. Heads up: materials + research is $${allocated.toLocaleString()}, but the total says $${d.totalRaised.toLocaleString()}.`
      : "Saved — the new numbers are live on the site.",
  );
}

// ---------------------------------------------------------------------------
// Contact messages
// ---------------------------------------------------------------------------

export async function setMessageHandled(formData: FormData): Promise<void> {
  await requireOwner("/admin/messages");

  const id = String(formData.get("id") ?? "");
  const handled = String(formData.get("handled") ?? "") === "true";
  if (!id) return;

  const supabase = getServiceClient();
  if (!supabase) return;

  const { error } = await supabase.from("contact_messages").update({ handled }).eq("id", id);
  if (error) console.error("[admin] setMessageHandled failed:", error.message);

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
