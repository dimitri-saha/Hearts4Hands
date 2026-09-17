"use client";

import { useActionState } from "react";

import { inviteAdmin } from "@/app/actions/admin-team";
import { idleState, valueOf } from "@/lib/action-state";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input, Select } from "@/components/ui/Field";
import { SubmitButton, useFormAttempt } from "@/components/ui/FormBits";

export function InviteAdminForm() {
  const [state, formAction] = useActionState(inviteAdmin, idleState);
  const attempt = useFormAttempt(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Couldn't do that">
          <p>{state.message}</p>
        </Alert>
      ) : null}
      {state.status === "success" && state.message ? (
        <Alert tone="success" title="Done">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Field label="Email address" htmlFor="email" required error={state.errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            defaultValue={valueOf(state, "email")}
            error={state.errors?.email}
          />
        </Field>

        <Field label="Role" htmlFor="role" error={state.errors?.role}>
          <Select
            key={`role-${attempt}`}
            id="role"
            name="role"
            defaultValue={valueOf(state, "role", "editor")}
            error={state.errors?.role}
          >
            <option value="editor">Editor — stories only</option>
            <option value="owner">Owner — everything</option>
          </Select>
        </Field>
      </div>

      <div>
        <SubmitButton pendingLabel="Sending…" size="md">
          Give access
        </SubmitButton>
      </div>
    </form>
  );
}
