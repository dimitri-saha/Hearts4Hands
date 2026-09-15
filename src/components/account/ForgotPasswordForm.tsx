"use client";

import { useActionState } from "react";

import { requestPasswordReset } from "@/app/actions/account";
import { idleState, valueOf } from "@/lib/action-state";
import { Alert, SuccessPanel } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Field";
import { AntiSpamFields, SubmitButton } from "@/components/ui/FormBits";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, idleState);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Check your email">
        <p>{state.message}</p>
      </SuccessPanel>
    );
  }

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-4">
      <AntiSpamFields />

      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Couldn't send that">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <Field
        label="Email"
        htmlFor="email"
        required
        hint="For an under-13's account, this is the parent or guardian's address."
        error={state.errors?.email}
      >
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={valueOf(state, "email")}
          hint
          error={state.errors?.email}
        />
      </Field>

      <SubmitButton pendingLabel="Sending…">Send me a reset link</SubmitButton>
    </form>
  );
}
