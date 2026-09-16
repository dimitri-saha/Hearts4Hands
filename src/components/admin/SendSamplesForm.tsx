"use client";

import { useActionState } from "react";

import { sendSampleEmails } from "@/app/actions/email-samples";
import { idleState, valueOf } from "@/lib/action-state";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/FormBits";

export function SendSamplesForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction] = useActionState(sendSampleEmails, idleState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Nothing sent">
          <p>{state.message}</p>
        </Alert>
      ) : null}
      {state.status === "success" && state.message ? (
        <Alert tone="success" title="On their way">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <Field label="Send them to" htmlFor="to" required error={state.errors?.to}>
        <Input
          id="to"
          name="to"
          type="email"
          autoComplete="email"
          required
          defaultValue={valueOf(state, "to", defaultEmail)}
          error={state.errors?.to}
        />
      </Field>

      <div>
        <SubmitButton pendingLabel="Sending…" size="md">
          Send me one of each
        </SubmitButton>
      </div>
    </form>
  );
}
