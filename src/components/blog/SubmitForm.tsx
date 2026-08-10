"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { submitBlogPost } from "@/app/actions/public";
import { idleState, valueOf } from "@/lib/action-state";
import { blogCategories, contact } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { CheckboxRow, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Alert, SuccessPanel } from "@/components/ui/Feedback";
import {
  AntiSpamFields,
  CharacterCount,
  SubmitButton,
  useFormAttempt,
} from "@/components/ui/FormBits";

/**
 * The story submission form.
 *
 * The one thing this form must never do is lose someone's writing. So:
 * the server action echoes every value back after a validation error, and the
 * title + body are mirrored into localStorage as you type, restored on the
 * next visit, and cleared only once the submission actually lands.
 */

const DRAFT_KEY = "hearts4hands:story-draft";
const SAVE_DELAY_MS = 700;

type Draft = { title: string; body: string; savedAt: number };

function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (typeof parsed?.title !== "string" || typeof parsed?.body !== "string") return null;
    return { title: parsed.title, body: parsed.body, savedAt: Number(parsed.savedAt) || Date.now() };
  } catch {
    return null;
  }
}

function forgetDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* private browsing / storage disabled — nothing to clean up */
  }
}

const titleEl = () => document.getElementById("title") as HTMLInputElement | null;
const bodyEl = () => document.getElementById("body") as HTMLTextAreaElement | null;

/** Let CharacterCount (which listens for `input`) see a programmatic change. */
function setValue(el: HTMLInputElement | HTMLTextAreaElement | null, value: string) {
  if (!el) return;
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

export function SubmitForm() {
  const [state, formAction] = useActionState(submitBlogPost, idleState);
  const [category, setCategory] = useState(() => valueOf(state, "category"));
  // Remounts <select>/checkboxes after a failed submit so they keep their
  // values — see useFormAttempt.
  const attempt = useFormAttempt(state);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);

  const selected = blogCategories.find((c) => c.value === category);

  // Restore a saved draft once, on mount, and only into empty fields so we
  // never overwrite what the server just echoed back after an error.
  useEffect(() => {
    const draft = readDraft();
    if (!draft) return;

    let restored = false;
    const title = titleEl();
    const body = bodyEl();
    if (title && !title.value && draft.title) {
      setValue(title, draft.title);
      restored = true;
    }
    if (body && !body.value && draft.body) {
      setValue(body, draft.body);
      restored = true;
    }
    // Reading localStorage is a one-shot external read that can only happen
    // after mount (there is no such thing on the server), so this genuinely
    // belongs in an effect. It runs exactly once and cannot cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (restored) setRestoredAt(draft.savedAt);
  }, []);

  useEffect(() => {
    if (state.status === "success") forgetDraft();
  }, [state.status]);

  // Send focus to the form-level error so a failed submit is never silent.
  useEffect(() => {
    if (state.status === "error") alertRef.current?.focus();
  }, [state]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const draft: Draft = {
        title: titleEl()?.value ?? "",
        body: bodyEl()?.value ?? "",
        savedAt: Date.now(),
      };
      if (!draft.title.trim() && !draft.body.trim()) {
        forgetDraft();
        return;
      }
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        /* storage full or blocked — the form still works, we just can't back it up */
      }
    }, SAVE_DELAY_MS);
  }, []);

  const clearDraft = useCallback(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    forgetDraft();
    setValue(titleEl(), "");
    setValue(bodyEl(), "");
    setRestoredAt(null);
    titleEl()?.focus();
  }, []);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Your story is on its way">
        <p>{state.message}</p>
        {/* No unconditional "you'll get an email" — sending depends on
            RESEND_API_KEY, so the action puts that line in `state.message`
            only when the confirmation actually went out. */}
        <p className="mt-3">
          When an editor has read it, we&apos;ll write back with any suggested edits — and we
          won&apos;t publish anything until you say yes.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/blog" variant="primary">
            Read other stories
          </Button>
          <Button href="/volunteer" variant="outline" alt>
            Find another way to help
          </Button>
        </div>
      </SuccessPanel>
    );
  }

  return (
    <form action={formAction} className="relative flex flex-col gap-7" noValidate>
      <AntiSpamFields />

      {state.status === "error" && state.message ? (
        <div ref={alertRef} tabIndex={-1} className="outline-none">
          <Alert tone="error" title="We couldn't send that just yet">
            <p>{state.message}</p>
            <p className="mt-2">
              Your writing is still here, and it&apos;s saved in this browser. If it keeps failing,
              email it to{" "}
              <a
                className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
                href={`mailto:${contact.editor}`}
              >
                {contact.editor}
              </a>{" "}
              so it isn&apos;t lost.
            </p>
          </Alert>
        </div>
      ) : null}

      {restoredAt ? (
        <Alert tone="note" title="We brought your draft back">
          <p>
            This browser had a story you started{" "}
            {new Date(restoredAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            . You can keep going, or start fresh.
          </p>
          <button
            type="button"
            onClick={clearDraft}
            className="mt-2 font-display font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
          >
            Clear the saved draft
          </button>
        </Alert>
      ) : null}

      <Field
        label="Title"
        htmlFor="title"
        required
        error={state.errors?.title}
        hint="A plain, honest title is better than a clever one."
      >
        <Input
          id="title"
          name="title"
          type="text"
          maxLength={160}
          autoComplete="off"
          defaultValue={valueOf(state, "title")}
          onChange={scheduleSave}
          error={state.errors?.title}
          hint
          placeholder="Notes for the sibling in the waiting room"
        />
      </Field>

      <Field
        label="Category"
        htmlFor="category"
        required
        error={state.errors?.category}
        hint={selected ? selected.blurb : "Pick the one that fits best — we can change it later."}
      >
        <Select
          key={`category-${attempt}`}
          id="category"
          name="category"
          defaultValue={valueOf(state, "category")}
          onChange={(event) => setCategory(event.target.value)}
          error={state.errors?.category}
          hint
        >
          <option value="">Choose a category…</option>
          {blogCategories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          label="Your name"
          htmlFor="authorName"
          required
          error={state.errors?.authorName}
          hint="A first name on its own is fine — just tell us in your story if that's what you'd like."
        >
          <Input
            id="authorName"
            name="authorName"
            type="text"
            maxLength={120}
            autoComplete="name"
            defaultValue={valueOf(state, "authorName")}
            error={state.errors?.authorName}
            hint
          />
        </Field>

        <Field
          label="Your email"
          htmlFor="authorEmail"
          required
          error={state.errors?.authorEmail}
          hint="Only used to talk with you about your story. Never published."
        >
          <Input
            id="authorEmail"
            name="authorEmail"
            type="email"
            maxLength={200}
            autoComplete="email"
            defaultValue={valueOf(state, "authorEmail")}
            error={state.errors?.authorEmail}
            hint
          />
        </Field>
      </div>

      <Field
        label="Where you're writing from"
        htmlFor="authorLocation"
        error={state.errors?.authorLocation}
        hint="City, state, or country — whatever you're comfortable sharing."
      >
        <Input
          id="authorLocation"
          name="authorLocation"
          type="text"
          maxLength={120}
          autoComplete="off"
          defaultValue={valueOf(state, "authorLocation")}
          error={state.errors?.authorLocation}
          hint
          placeholder="Toronto, Canada"
        />
      </Field>

      <Field
        label="Your story"
        htmlFor="body"
        required
        error={state.errors?.body}
        hint="Around 300 to 1,200 words works well. Start wherever it feels natural — you can wander."
      >
        <Textarea
          id="body"
          name="body"
          rows={16}
          maxLength={40000}
          defaultValue={valueOf(state, "body")}
          onChange={scheduleSave}
          error={state.errors?.body}
          hint
        />
        <CharacterCount targetId="body" min={200} max={40000} />
        <p className="text-sm text-brown-mid">
          Basic Markdown works if you want it: <code className="font-hand text-berry">**bold**</code>
          , <code className="font-hand text-berry">## a heading</code>,{" "}
          <code className="font-hand text-berry">- a list</code>, and{" "}
          <code className="font-hand text-berry">[links](https://example.com)</code>. Plain
          paragraphs are completely fine too.
        </p>
        <p className="text-sm text-brown-soft">
          Your draft is saved in this browser as you type.{" "}
          <button
            type="button"
            onClick={clearDraft}
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
          >
            Clear draft
          </button>
        </p>
      </Field>

      <CheckboxRow
        key={`consent-${attempt}`}
        id="consent"
        name="consent"
        value="on"
        defaultChecked={valueOf(state, "consent") === "on"}
        label="Yes — send this to an editor"
        hint="This is my own writing. I'm OK with an editor reading it and lightly editing it for clarity, and I understand nothing gets published until I say yes."
        error={state.errors?.consent}
      />

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <SubmitButton pendingLabel="Sending your story…">Send my story</SubmitButton>
        <p className="font-hand text-base text-brown-mid">
          A real person reads every one of these.
        </p>
      </div>
    </form>
  );
}
