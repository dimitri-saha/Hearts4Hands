import type { Metadata } from "next";
import Link from "next/link";

import {
  clearRejectedSubmissions,
  deletePost,
  setSubmissionStatus,
  updatePost,
} from "@/app/actions/admin";
import {
  AdminAlert,
  AdminEmpty,
  AdminList,
  AdminListItem,
  AdminPageHeader,
  AdminTable,
  FilterTabs,
  StatusBadge,
  type AdminColumn,
} from "@/components/admin";
import { requireAdmin } from "@/lib/auth";
import { categoryLabel } from "@/lib/site";
import { getServiceClient } from "@/lib/supabase/server";
import type { BlogSubmission, Post, SubmissionStatus } from "@/lib/supabase/types";
import { excerptFrom, formatDate, formatNumber, slugify } from "@/lib/utils";

import { PublishForm } from "./PublishForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories",
  robots: { index: false, follow: false },
};

const SUBMISSION_LIMIT = 100;
const POST_LIMIT = 200;

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Not approved" },
  { value: "all", label: "All" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

function parseFilter(value: string | undefined): Filter {
  return FILTERS.some((f) => f.value === value) ? (value as Filter) : "pending";
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin("/admin/stories");

  const filter = parseFilter((await searchParams).status);
  const supabase = getServiceClient();

  if (!supabase) {
    return (
      <div className="flex flex-col gap-5">
        <AdminPageHeader
          title="Stories"
          description="Read what volunteers have sent in, edit it, and publish it to the blog."
        />
        <AdminAlert tone="note" title="No database connected yet">
          <p>
            Submissions and posts live in Supabase. This page needs{" "}
            <code className="font-body font-bold">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-body font-bold">SUPABASE_SERVICE_ROLE_KEY</code> set in the
            environment before it can read or publish anything.
          </p>
          <p className="mt-2">
            Meanwhile the public blog is still up — it falls back to the starter posts in{" "}
            <code className="font-body font-bold">src/content/starter-posts.ts</code>.
          </p>
        </AdminAlert>
      </div>
    );
  }

  const countFor = (status: SubmissionStatus) =>
    supabase
      .from("blog_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", status);

  const submissionQuery = supabase
    .from("blog_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(SUBMISSION_LIMIT);

  const [
    pendingCount,
    approvedCount,
    rejectedCount,
    submissionResult,
    postResult,
    rejectedIdResult,
  ] = await Promise.all([
    countFor("pending"),
    countFor("approved"),
    countFor("rejected"),
    filter === "all" ? submissionQuery : submissionQuery.eq("status", filter),
    supabase
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(POST_LIMIT),
    // Ids only, and unfiltered by the tab: a post's source submission may not
    // be in the visible page of submissions above, but we still need to know
    // it was turned down before offering to publish the post again.
    supabase.from("blog_submissions").select("id").eq("status", "rejected"),
  ]);

  const loadError = submissionResult.error ?? postResult.error;
  const submissions = (submissionResult.data ?? []) as BlogSubmission[];
  const posts = (postResult.data ?? []) as Post[];
  const rejectedTotal = rejectedCount.count ?? 0;
  const rejectedSubmissionIds = new Set((rejectedIdResult.data ?? []).map((row) => row.id));
  /** True when this post came from a submission that was later not approved. */
  const fromRejected = (post: Post) =>
    post.submission_id !== null && rejectedSubmissionIds.has(post.submission_id);
  const totalSubmissions =
    (pendingCount.count ?? 0) + (approvedCount.count ?? 0) + rejectedTotal;

  const postColumns: AdminColumn<Post>[] = [
    {
      key: "title",
      header: "Title",
      cell: (post) => (
        <div className="min-w-0">
          <p className="font-display font-bold text-berry">{post.title}</p>
          <p className="mt-0.5 text-sm">
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
            >
              /blog/{post.slug} ↗
            </Link>
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (post) => categoryLabel(post.category),
    },
    {
      key: "author",
      header: "Author",
      cell: (post) => (
        <>
          {post.author_name}
          {post.author_location ? (
            <span className="block text-sm text-brown-mid">{post.author_location}</span>
          ) : null}
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      hideLabelOnMobile: true,
      cell: (post) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={post.status} />
          {post.featured ? <StatusBadge status="published" label="★ Featured" /> : null}
          {fromRejected(post) ? (
            <StatusBadge status="rejected" label="× Story not approved" />
          ) : null}
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      cell: (post) => (
        <span className="text-sm text-brown-mid">
          {post.published_at ? `Published ${formatDate(post.published_at)}` : "Never published"}
          <span className="block">Updated {formatDate(post.updated_at)}</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      hideLabelOnMobile: true,
      cell: (post) =>
        // A post whose source submission was turned down must not be
        // re-publishable or featurable from here — that is how a rejected
        // story ends up back on the blog. Unpublish stays available so a live
        // one can still be taken down.
        fromRejected(post) ? (
          <div className="flex flex-col items-end gap-1.5">
            {post.status === "published" ? (
              <PostAction id={post.id} intent="unpublish" label="Unpublish" tone="quiet" />
            ) : (
              <DeletePostButton id={post.id} title={post.title} />
            )}
            <span className="max-w-56 text-right text-sm text-brown-mid">
              Its story was not approved. Reset that submission to pending to publish again.
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-1.5">
            <PostAction
              id={post.id}
              intent={post.status === "published" ? "unpublish" : "publish"}
              label={post.status === "published" ? "Unpublish" : "Publish"}
              tone={post.status === "published" ? "quiet" : "go"}
            />
            <PostAction
              id={post.id}
              intent={post.featured ? "unfeature" : "feature"}
              label={post.featured ? "Un-feature" : "Feature"}
              tone="quiet"
            />
            {post.status === "draft" ? (
              <DeletePostButton id={post.id} title={post.title} />
            ) : null}
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Stories"
        description="Read a submission all the way through, edit it for clarity and privacy, then publish it or send it back with a note."
        count={submissions.length}
      >
        <Link
          href="/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid no-underline hover:bg-cream"
        >
          View the blog ↗
        </Link>
        <Link
          href="/blog/submit"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid no-underline hover:bg-cream"
        >
          The submission form ↗
        </Link>
      </AdminPageHeader>

      {loadError ? (
        <AdminAlert tone="error" title="Couldn't load everything">
          <p>The database returned an error: {loadError.message}.</p>
        </AdminAlert>
      ) : null}

      {/* ================= A. Submissions queue ============================= */}
      <section aria-labelledby="queue-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 id="queue-heading" className="font-display text-2xl font-bold text-berry">
            Submissions
          </h2>
          <FilterTabs
            basePath="/admin/stories"
            active={filter}
            label="Filter story submissions by review status"
            options={[
              { value: "pending", label: "Pending", count: pendingCount.count ?? 0 },
              { value: "approved", label: "Approved", count: approvedCount.count ?? 0 },
              { value: "rejected", label: "Not approved", count: rejectedCount.count ?? 0 },
              { value: "all", label: "All", count: totalSubmissions },
            ]}
          />

          {/* Two-step confirmation, done with <details> so it still works
              without JavaScript — this deletes rows and cannot be undone. */}
          {rejectedTotal > 0 ? (
            <details className="rounded-xl border border-brown-faint bg-cream/50 open:bg-paper">
              <summary className="cursor-pointer list-none px-4 py-2.5 font-display text-sm font-bold text-brown-mid marker:content-none hover:bg-cream">
                🗑 Clear not-approved stories ({formatNumber(rejectedTotal)})
              </summary>
              <div className="flex flex-col gap-3 border-t border-brown-faint px-4 py-4">
                <p className="text-sm text-brown-mid">
                  Permanently deletes{" "}
                  <strong className="font-display text-berry">
                    {formatNumber(rejectedTotal)} not-approved{" "}
                    {rejectedTotal === 1 ? "story" : "stories"}
                  </strong>{" "}
                  and cannot be undone, along with any unpublished draft posts made from them.
                  Anything still live on the blog is left alone.
                  Not-approved stories are also removed automatically 30 days after the decision.
                </p>
                <form action={clearRejectedSubmissions}>
                  <button
                    type="submit"
                    className="rounded-lg border border-red bg-red/10 px-3 py-1.5 font-display text-sm font-bold text-berry hover:bg-red/20"
                  >
                    Yes, delete {rejectedTotal === 1 ? "it" : "them"} permanently
                  </button>
                </form>
              </div>
            </details>
          ) : null}
        </div>

        {submissions.length === 0 ? (
          <AdminEmpty
            title={
              filter === "pending" ? "The reading queue is empty." : "Nothing matches this filter."
            }
            description={
              filter === "pending"
                ? "Every submission has been read and decided on."
                : "Try another tab."
            }
          />
        ) : (
          <AdminList>
            {submissions.map((sub) => {
              const noteId = `sub-note-${sub.id}`;
              const words = wordCount(sub.body);

              return (
                <AdminListItem
                  key={sub.id}
                  title={sub.title}
                  badge={<StatusBadge status={sub.status} />}
                  meta={
                    <>
                      {categoryLabel(sub.category)} · {sub.author_name} ·{" "}
                      <a
                        href={`mailto:${sub.author_email}?subject=${encodeURIComponent(
                          `Your Hearts4Hands story: ${sub.title}`,
                        )}`}
                        className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
                      >
                        {sub.author_email}
                      </a>
                      {sub.author_location ? ` · ${sub.author_location}` : null} · submitted{" "}
                      {formatDate(sub.created_at)} · {formatNumber(sub.body.length)} characters,
                      about {formatNumber(words)} words
                    </>
                  }
                  actions={
                    <div className="flex w-full flex-col gap-3">
                      <form
                        action={setSubmissionStatus}
                        className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
                      >
                        <input type="hidden" name="id" value={sub.id} />
                        <label htmlFor={noteId} className="sr-only">
                          Note to record with this decision for {sub.title}
                        </label>
                        <input
                          id={noteId}
                          name="reviewerNote"
                          type="text"
                          maxLength={500}
                          defaultValue={sub.reviewer_note ?? ""}
                          placeholder="Optional note (saved with the decision, not emailed)"
                          className="min-w-0 flex-1 rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-body text-sm text-brown placeholder:text-brown-soft focus:border-red focus:outline-none"
                        />
                        <div className="flex shrink-0 flex-wrap gap-2">
                          {sub.status !== "rejected" ? (
                            <button
                              type="submit"
                              name="status"
                              value="rejected"
                              className="rounded-lg border border-red bg-red/10 px-3 py-1.5 font-display text-sm font-bold text-berry hover:bg-red/20"
                            >
                              × Reject
                            </button>
                          ) : null}
                          {sub.status !== "pending" ? (
                            <button
                              type="submit"
                              name="status"
                              value="pending"
                              className="rounded-lg border border-brown-faint bg-cream px-3 py-1.5 font-display text-sm font-bold text-brown-mid hover:bg-kraft"
                            >
                              ↩ Reset to pending
                            </button>
                          ) : null}
                        </div>
                      </form>

                      {/* A not-approved story is not publishable. Leaving the
                          publish form here made rejection decorative — you could
                          still set a status, feature it, and put it live. */}
                      {sub.status === "rejected" ? (
                        <p className="w-full rounded-xl border border-brown-faint bg-cream/50 px-4 py-3 text-sm text-brown-mid">
                          <strong className="font-display text-berry">Not approved.</strong>{" "}
                          Publishing is turned off for this story. Reset it to pending above if
                          you change your mind.
                          {sub.published_post_id
                            ? " It had been published, so the post was taken off the blog and kept as a draft below."
                            : null}
                        </p>
                      ) : (
                      <details className="w-full rounded-xl border border-brown-faint bg-cream/50 open:bg-paper">
                        <summary className="cursor-pointer list-none px-4 py-2.5 font-display font-bold text-berry marker:content-none hover:bg-cream">
                          ✎ Edit &amp; publish this story
                          <span className="ml-2 font-body text-sm font-normal text-brown-mid">
                            {sub.published_post_id
                              ? "already published once — publishing again makes a second post"
                              : "creates the public post and marks this approved"}
                          </span>
                        </summary>
                        <div className="border-t border-brown-faint px-4 py-4">
                          <PublishForm
                            submissionId={sub.id}
                            defaultTitle={sub.title}
                            defaultSlug={slugify(sub.title)}
                            defaultCategory={sub.category}
                            defaultAuthorName={sub.author_name}
                            defaultAuthorLocation={sub.author_location ?? ""}
                            defaultExcerpt={excerptFrom(sub.body)}
                            defaultBody={sub.body}
                          />
                        </div>
                      </details>
                      )}
                    </div>
                  }
                >
                  {sub.reviewed_at || sub.reviewer_note ? (
                    <p className="mb-3 rounded-lg border border-brown-faint bg-cream px-3 py-2 text-sm text-brown-mid">
                      {sub.reviewed_at ? <>Reviewed {formatDate(sub.reviewed_at)}. </> : null}
                      {sub.reviewer_note ? (
                        <span className="whitespace-pre-wrap">
                          Note: &ldquo;{sub.reviewer_note}&rdquo;
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  {/* Plain text on purpose. Nothing here has been reviewed yet, so
                      it is never rendered as HTML or Markdown. */}
                  <div className="max-h-96 overflow-y-auto rounded-lg border border-brown-faint bg-paper px-4 py-3">
                    <p className="max-w-[68ch] font-body text-[0.98rem] leading-relaxed whitespace-pre-wrap text-brown">
                      {sub.body}
                    </p>
                  </div>
                  <p className="mt-1.5 text-sm text-brown-soft">
                    Shown as plain text, exactly as it was submitted. Scroll inside the box to read
                    it all.
                  </p>
                </AdminListItem>
              );
            })}
          </AdminList>
        )}
      </section>

      {/* ================= B. Published posts =============================== */}
      <section aria-labelledby="posts-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="posts-heading" className="font-display text-2xl font-bold text-berry">
            Posts on the site
          </h2>
          <p className="mt-1 max-w-2xl text-[0.95rem] text-brown-mid">
            Everything that exists as a post, published or draft. Unpublishing hides a post from the
            blog without deleting it. Featuring one automatically un-features whichever post holds
            the spot now — there is only ever one.
          </p>
        </div>

        <AdminTable
          rows={posts}
          columns={postColumns}
          getKey={(post) => post.id}
          caption="Blog posts, newest published first"
          empty={
            <AdminEmpty
              title="No posts yet."
              description="Publish a submission above and it will show up here."
            />
          }
        />

        <AdminAlert tone="note" title="Writing an original post">
          <p>
            There is no &ldquo;new post from scratch&rdquo; screen yet — the workflow is
            submission-first by design (PRD §5.4): someone submits, an editor reviews, an editor
            publishes. If you want to publish something you wrote yourself, send it through{" "}
            <Link
              href="/blog/submit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
            >
              /blog/submit ↗
            </Link>{" "}
            and it will land in the queue above like any other story.
          </p>
        </AdminAlert>
      </section>
    </div>
  );
}

/**
 * Delete a draft post. Two-step via <details> so it can't be a stray click,
 * and works without JavaScript. Only offered for drafts — see `deletePost`.
 */
function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <details className="inline-block text-right">
      <summary className="cursor-pointer list-none rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid marker:content-none hover:border-red hover:bg-blush hover:text-berry">
        Delete
      </summary>
      <div className="mt-1.5 flex flex-col items-end gap-1.5 rounded-lg border border-red bg-red/5 p-2.5">
        <p className="max-w-56 text-right text-sm text-brown-mid">
          Permanently delete “{title}”? This can&apos;t be undone.
        </p>
        <form action={deletePost}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded-lg border border-red bg-red/10 px-3 py-1.5 font-display text-sm font-bold text-berry hover:bg-red/20"
          >
            Yes, delete it
          </button>
        </form>
      </div>
    </details>
  );
}

/** One-button form for a `updatePost` intent. */
function PostAction({
  id,
  intent,
  label,
  tone,
}: {
  id: string;
  intent: "publish" | "unpublish" | "feature" | "unfeature";
  label: string;
  tone: "go" | "quiet";
}) {
  return (
    <form action={updatePost} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="intent" value={intent} />
      <button
        type="submit"
        className={
          tone === "go"
            ? "rounded-lg border border-leaf bg-leaf/18 px-3 py-1.5 font-display text-sm font-bold text-brown hover:bg-leaf/30"
            : "rounded-lg border border-brown-faint bg-cream px-3 py-1.5 font-display text-sm font-bold text-brown-mid hover:bg-kraft"
        }
      >
        {label}
      </button>
    </form>
  );
}
