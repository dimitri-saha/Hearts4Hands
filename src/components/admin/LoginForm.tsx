"use client";

import { useActionState } from "react";

import { signIn } from "@/app/actions/admin";
import { idleState } from "@/lib/action-state";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/FormBits";

/**
 * Admin sign-in.
 *
 * `signIn` redirects on success, so this form only ever renders the error
 * path — the message is intentionally vague about whether the account exists.
 * `next` is carried through as a hidden input and re-validated server-side.
 */
export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, idleState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label="Email" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <SubmitButton pendingLabel="Signing in…" size="md" className="mt-1 w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
