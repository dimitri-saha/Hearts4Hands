"use client";

import { useActionState } from "react";

import { requestClubCertificate } from "@/app/actions/certificates";
import { idleState } from "@/lib/action-state";
import { Alert } from "@/components/ui/Feedback";
import { SubmitButton } from "@/components/ui/FormBits";

/**
 * Issues the club's certificate.
 *
 * The group id rides in a hidden field, but the action re-checks leadership
 * against the database rather than trusting it — a member could otherwise post
 * the id of a club they don't run.
 */
export function RequestClubCertificateForm({
  groupId,
  canRequest,
  label,
}: {
  groupId: string;
  canRequest: boolean;
  label: string;
}) {
  const [state, formAction] = useActionState(requestClubCertificate, idleState);

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
          <input type="hidden" name="groupId" value={groupId} />
          <SubmitButton pendingLabel="Writing it out…">{label}</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
