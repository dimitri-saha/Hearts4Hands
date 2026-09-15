"use client";

import { useActionState } from "react";

import { createGroup, joinGroup } from "@/app/actions/account";
import { idleState, valueOf } from "@/lib/action-state";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/FormBits";

export function JoinGroupForm() {
  const [state, formAction] = useActionState(joinGroup, idleState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Couldn't join">
          <p>{state.message}</p>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert tone="success" title="Joined">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <Field
        label="Invite code"
        htmlFor="code"
        required
        hint="Six characters, from whoever runs the club. Capitals and numbers only."
        error={state.errors?.code}
      >
        <Input
          id="code"
          name="code"
          required
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="ABC123"
          maxLength={12}
          className="font-mono tracking-[0.3em] uppercase"
          defaultValue={valueOf(state, "code")}
          hint
          error={state.errors?.code}
        />
      </Field>

      <SubmitButton pendingLabel="Joining…" size="md">
        Join the club
      </SubmitButton>
    </form>
  );
}

export function CreateGroupForm() {
  const [state, formAction] = useActionState(createGroup, idleState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Couldn't create it">
          <p>{state.message}</p>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert tone="success" title="Club created">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <Field label="Club name" htmlFor="name" required error={state.errors?.name}>
        <Input
          id="name"
          name="name"
          required
          placeholder="Lincoln High Card Club"
          defaultValue={valueOf(state, "name")}
          error={state.errors?.name}
        />
      </Field>

      <Field
        label="School or organisation"
        htmlFor="organisation"
        hint="Optional. Helps us tell two clubs with similar names apart."
        error={state.errors?.organisation}
      >
        <Input
          id="organisation"
          name="organisation"
          defaultValue={valueOf(state, "organisation")}
          hint
          error={state.errors?.organisation}
        />
      </Field>

      <SubmitButton pendingLabel="Creating…" size="md" variant="secondary">
        Start a club
      </SubmitButton>
    </form>
  );
}
