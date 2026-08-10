"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { submitContact } from "@/app/actions/public";
import { idleState, valueOf } from "@/lib/action-state";
import { contact } from "@/lib/site";
import { contactTopics } from "@/lib/validation";
import { Alert, SuccessPanel } from "@/components/ui/Feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import {
  AntiSpamFields,
  CharacterCount,
  SubmitButton,
  useFormAttempt,
} from "@/components/ui/FormBits";

/**
 * The contact form.
 *
 * Field names match `contactSchema` exactly — `name`, `email`, `topic`,
 * `subject`, `message` — so the action can parse FormData without a mapping
 * layer. On an error the whole message is echoed back into the textarea; on
 * this site somebody may have just typed something hard, and losing it would
 * be the worst possible outcome.
 */
export function ContactForm() {
  const [state, action] = useActionState(submitContact, idleState);
  const alertRef = useRef<HTMLDivElement>(null);
  // Keeps the chosen topic after a failed submit — see useFormAttempt.
  const attempt = useFormAttempt(state);

  // Send focus to the form-level error so a keyboard or screen-reader user
  // isn't left at the bottom of the form wondering what happened.
  useEffect(() => {
    if (state.status === "error") alertRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Off it goes!">
        <p>{state.message}</p>
        <p className="mt-2">
          Nothing else to do — we&apos;ll reply to the address you gave us. In the meantime, there
          are plenty of{" "}
          <Link
            href="/blog"
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
          >
            stories to read
          </Link>
          .
        </p>
      </SuccessPanel>
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-5" noValidate>
      <AntiSpamFields />

      {state.status === "error" && state.message ? (
        <div ref={alertRef} tabIndex={-1} className="outline-none">
          <Alert tone="error" title="That didn't send">
            <p>{state.message}</p>
          </Alert>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" error={state.errors?.name} required>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            defaultValue={valueOf(state, "name")}
            error={state.errors?.name}
            required
          />
        </Field>

        <Field label="Email" htmlFor="email" error={state.errors?.email} required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={valueOf(state, "email")}
            error={state.errors?.email}
            required
          />
        </Field>
      </div>

      <Field
        label="What's this about?"
        htmlFor="topic"
        hint="Helps your message reach the right person."
        error={state.errors?.topic}
        required
      >
        <Select
          key={`topic-${attempt}`}
          id="topic"
          name="topic"
          hint
          defaultValue={valueOf(state, "topic", "general")}
          error={state.errors?.topic}
        >
          {contactTopics.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Subject" htmlFor="subject" error={state.errors?.subject}>
        <Input
          id="subject"
          name="subject"
          maxLength={160}
          placeholder="A few words about your message"
          defaultValue={valueOf(state, "subject")}
          error={state.errors?.subject}
        />
      </Field>

      <Field label="Message" htmlFor="message" error={state.errors?.message} required>
        <Textarea
          id="message"
          name="message"
          rows={8}
          defaultValue={valueOf(state, "message")}
          error={state.errors?.message}
          placeholder="Tell us as much or as little as you like."
          required
        />
        <CharacterCount targetId="message" min={10} max={8000} />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
        <p className="text-sm text-brown-mid">
          Trouble with the form? Email{" "}
          <a
            href={`mailto:${contact.general}`}
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
          >
            {contact.general}
          </a>{" "}
          instead.
        </p>
      </div>
    </form>
  );
}
