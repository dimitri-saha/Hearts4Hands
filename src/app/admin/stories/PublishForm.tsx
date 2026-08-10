"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { publishStory } from "@/app/actions/admin";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/FormBits";
import { idleState } from "@/lib/action-state";
import { blogCategories } from "@/lib/site";
import { slugify } from "@/lib/utils";

/**
 * Edit-and-publish form for one submission.
 *
 * `publishStory` returns an ActionState, so this is one of only two client
 * components in the admin area. Everything it needs is passed in as plain
 * strings — no server imports cross the boundary.
 */
export function PublishForm({
  submissionId,
  defaultTitle,
  defaultSlug,
  defaultCategory,
  defaultAuthorName,
  defaultAuthorLocation,
  defaultExcerpt,
  defaultBody,
}: {
  submissionId: string;
  defaultTitle: string;
  defaultSlug: string;
  defaultCategory: string;
  defaultAuthorName: string;
  defaultAuthorLocation: string;
  defaultExcerpt: string;
  defaultBody: string;
}) {
  const [state, action] = useActionState(publishStory, idleState);
  const [slug, setSlug] = useState(defaultSlug);
  const [title, setTitle] = useState(defaultTitle);

  const id = (field: string) => `publish-${submissionId}-${field}`;
  const errors = state.errors ?? {};

  // The action uniquifies colliding slugs, so trust the slug it reports back
  // over the one that was typed.
  const publishedSlug =
    state.status === "success" ? (state.message?.match(/\/blog\/([a-z0-9-]+)/)?.[1] ?? null) : null;

  if (state.status === "success") {
    return (
      <Alert tone="success" title="Done">
        <p>{state.message}</p>
        {publishedSlug ? (
          <p className="mt-2">
            <Link
              href={`/blog/${publishedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            >
              View the post →
            </Link>
          </p>
        ) : null}
        <p className="mt-2 text-sm text-brown-mid">
          Reload the page to see it move into the published list below.
        </p>
      </Alert>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="submissionId" value={submissionId} />

      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Not published">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" htmlFor={id("title")} required error={errors.title}>
          <Input
            id={id("title")}
            name="title"
            error={errors.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            required
          />
        </Field>

        <Field
          label="Slug"
          htmlFor={id("slug")}
          required
          error={errors.slug}
          hint={
            <span className="font-hand text-base">
              Public URL: <span className="text-berry">/blog/{slug || "…"}</span>
            </span>
          }
        >
          <div className="flex gap-2">
            <Input
              id={id("slug")}
              name="slug"
              error={errors.slug}
              hint
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
            />
            <button
              type="button"
              onClick={() => setSlug(slugify(title))}
              className="shrink-0 rough-pill border-2 border-brown bg-cream px-3 py-1.5 font-display text-sm font-bold text-berry hover:bg-blush"
            >
              From title
            </button>
          </div>
        </Field>

        <Field label="Category" htmlFor={id("category")} required error={errors.category}>
          <Select
            id={id("category")}
            name="category"
            error={errors.category}
            defaultValue={defaultCategory}
          >
            {blogCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status" htmlFor={id("status")} required error={errors.status}>
          <Select id={id("status")} name="status" error={errors.status} defaultValue="published">
            <option value="published">Publish now — visible on /blog</option>
            <option value="draft">Save as draft — hidden from the site</option>
          </Select>
        </Field>

        <Field label="Author name" htmlFor={id("authorName")} required error={errors.authorName}>
          <Input
            id={id("authorName")}
            name="authorName"
            error={errors.authorName}
            defaultValue={defaultAuthorName}
            maxLength={120}
            required
          />
        </Field>

        <Field
          label="Author location"
          htmlFor={id("authorLocation")}
          error={errors.authorLocation}
          hint="Shown under the byline. Leave blank if they'd rather not say."
        >
          <Input
            id={id("authorLocation")}
            name="authorLocation"
            error={errors.authorLocation}
            hint
            defaultValue={defaultAuthorLocation}
            maxLength={120}
          />
        </Field>
      </div>

      <Field
        label="Excerpt"
        htmlFor={id("excerpt")}
        error={errors.excerpt}
        hint="The teaser on the blog list and in search results. Left blank, we'll cut the first ~180 characters of the body."
      >
        <Textarea
          id={id("excerpt")}
          name="excerpt"
          error={errors.excerpt}
          hint
          rows={2}
          maxLength={400}
          defaultValue={defaultExcerpt}
          className="min-h-0"
        />
      </Field>

      <Field
        label="Body"
        htmlFor={id("body")}
        required
        error={errors.body}
        hint="Markdown is supported and sanitized before it renders. Edit for clarity, typos, and anything that identifies a patient."
      >
        <Textarea
          id={id("body")}
          name="body"
          error={errors.body}
          hint
          rows={16}
          defaultValue={defaultBody}
          className="font-body text-[0.95rem] leading-relaxed"
          required
        />
      </Field>

      <label
        htmlFor={id("featured")}
        className="flex cursor-pointer items-start gap-3 rough-3 border-2 border-brown/45 bg-paper p-3.5 hover:border-red hover:bg-blush/60 has-checked:border-red has-checked:bg-blush"
      >
        <input
          type="checkbox"
          id={id("featured")}
          name="featured"
          className="mt-0.5 h-5 w-5 shrink-0 accent-red"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-display font-bold text-berry">Feature this post</span>
          <span className="text-sm text-brown-mid">
            Pins it to the top of the blog and the home page. Only one post can be featured — this
            un-features whichever one holds the spot now.
          </span>
        </span>
      </label>

      <p className="text-sm text-brown-mid">
        Publishing creates the public post <em>and</em> marks this submission approved. It does not
        email the author — send them a note yourself.
      </p>

      <div>
        <SubmitButton pendingLabel="Publishing…" size="md">
          Publish this story
        </SubmitButton>
      </div>
    </form>
  );
}
