"use client";

import { useActionState, useState } from "react";

import { completeProfile } from "@/app/actions/account";
import { idleState, valueOf } from "@/lib/action-state";
import { UNDER_13, ageGroups } from "@/lib/site";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input, Select } from "@/components/ui/Field";
import { SubmitButton, useFormAttempt } from "@/components/ui/FormBits";

/**
 * Shown in place of the dashboard when an account has no profile — see
 * `completeProfile`. Asks only what sign-up would have asked; credentials
 * already exist.
 */
export function CompleteProfileForm({ email }: { email: string | null }) {
  const [state, formAction] = useActionState(completeProfile, idleState);
  const attempt = useFormAttempt(state);
  const [ageGroup, setAgeGroup] = useState(() => valueOf(state, "ageGroup"));
  const isGuardian = ageGroup === UNDER_13;
  const errors = state.errors;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <Alert tone="note" title="One thing before you start">
        <p>
          This account was set up for you, so we&apos;re missing a couple of details. They go on
          your certificate, so they&apos;re worth getting right.
          {email ? (
            <>
              {" "}
              You&apos;re signed in as <strong className="font-display text-berry">{email}</strong>.
            </>
          ) : null}
        </p>
      </Alert>

      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Couldn't save that">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <Field
        label="Age of the volunteer"
        htmlFor="ageGroup"
        required
        hint="The person making the cards — not necessarily the person filling this in."
        error={errors?.ageGroup}
      >
        <Select
          key={`ageGroup-${attempt}`}
          id="ageGroup"
          name="ageGroup"
          required
          defaultValue={valueOf(state, "ageGroup")}
          onChange={(e) => setAgeGroup(e.target.value)}
          hint
          error={errors?.ageGroup}
        >
          <option value="">Choose one…</option>
          {ageGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
      </Field>

      {isGuardian ? (
        <Alert tone="info" title="A grown-up looks after this account">
          <p>
            Put the child&apos;s name below — that&apos;s who the certificate names. Everything we
            send still comes to this email address, and these accounts can&apos;t submit stories.
          </p>
        </Alert>
      ) : null}

      <Field
        label={isGuardian ? "The child's name" : "Your name"}
        htmlFor="fullName"
        required
        hint="This is the name that goes on the certificate."
        error={errors?.fullName}
      >
        <Input
          id="fullName"
          name="fullName"
          autoCapitalize="words"
          required
          defaultValue={valueOf(state, "fullName")}
          hint
          error={errors?.fullName}
        />
      </Field>

      <Field label="Country" htmlFor="country" required error={errors?.country}>
        <Input
          id="country"
          name="country"
          autoComplete="country-name"
          required
          defaultValue={valueOf(state, "country")}
          error={errors?.country}
        />
      </Field>

      <SubmitButton pendingLabel="Saving…">Save and continue</SubmitButton>
    </form>
  );
}
