"use client";

import { useActionState } from "react";

import { requestCertificate } from "@/app/actions/certificates";
import { idleState } from "@/lib/action-state";
import { Alert } from "@/components/ui/Feedback";
import { SubmitButton } from "@/components/ui/FormBits";

/**
 * Asks for a certificate covering everything approved so far.
 *
 * No fields — the volunteer isn't choosing anything, they're asking us to write
 * down what we already approved. `useActionState` still earns its place for the
 * pending state and the error message.
 */
export function RequestCertificateForm({
  canRequest,
  label,
}: {
  canRequest: boolean;
  label: string;
}) {
  const [state, formAction] = useActionState(
    async () => requestCertificate(),
    idleState,
  );

  return (
    <div className="flex flex-col gap-4">
      {state.status === "error" && state.message ? (
        <Alert tone="error" title="We couldn't issue that">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      {state.status === "success" && state.message ? (
        <Alert tone="success" title="Done">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      {canRequest ? (
        <form action={formAction}>
          <SubmitButton pendingLabel="Writing it out…">{label}</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
