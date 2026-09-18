"use client";

import Link from "next/link";
import { useActionState } from "react";

import { updatePassword } from "@/app/actions/account";
import { idleState } from "@/lib/action-state";
import { Alert, SuccessPanel } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/FormBits";

export function ResetPasswordForm({ next = "/account" }: { next?: string }) {
  const [state, formAction] = useActionState(updatePassword, idleState);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Done">
        <p>{state.message}</p>
        <p className="mt-4">
          <Link
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href={next}
          >
            {next.startsWith("/admin") ? "Go to the admin area" : "Go to your account"}
          </Link>
        </p>
      </SuccessPanel>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Couldn't change it">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <Field
        label="New password"
        htmlFor="password"
        required
        hint="At least 10 characters."
        error={state.errors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          hint
          error={state.errors?.password}
        />
      </Field>

      <Field label="Type it again" htmlFor="confirm" required error={state.errors?.confirm}>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          error={state.errors?.confirm}
        />
      </Field>

      <SubmitButton pendingLabel="Saving…">Set my new password</SubmitButton>
    </form>
  );
}
