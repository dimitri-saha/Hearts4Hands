"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { signUpVolunteer } from "@/app/actions/account";
import { idleState, valueOf } from "@/lib/action-state";
import { MINOR_13_TO_17, UNDER_13, ageGroups } from "@/lib/site";
import { Alert, SuccessPanel } from "@/components/ui/Feedback";
import { CheckboxRow, Field, Input, Select } from "@/components/ui/Field";
import { AntiSpamFields, SubmitButton, useFormAttempt } from "@/components/ui/FormBits";

const linkClass =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpVolunteer, idleState);
  const alertRef = useRef<HTMLDivElement>(null);
  const attempt = useFormAttempt(state);
  const [ageGroup, setAgeGroup] = useState(() => valueOf(state, "ageGroup"));
  const isGuardian = ageGroup === UNDER_13;
  // Shown only to 13-17s. Previously every adult saw this too, because the
  // form had no way to tell who was a minor.
  const isMinor = ageGroup === MINOR_13_TO_17;

  useEffect(() => {
    if (state.status === "error" && state.message) alertRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Nearly there">
        <p>{state.message}</p>
        <p className="mt-3 text-sm">
          Nothing happens until that link is clicked — it&apos;s how we know the address is real.
          If it doesn&apos;t arrive in a few minutes, check the spam folder.
        </p>
      </SuccessPanel>
    );
  }

  const errors = state.errors;

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-5">
      <AntiSpamFields />

      {state.status === "error" && state.message ? (
        <div ref={alertRef} tabIndex={-1}>
          <Alert tone="error" title="We couldn't create that account">
            <p>{state.message}</p>
          </Alert>
        </div>
      ) : null}

      {/* Age first: it decides whose details the rest of the form collects. */}
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
          {ageGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </Select>
      </Field>

      {isGuardian ? (
        <Alert tone="info" title="A grown-up sets this up">
          <p>
            For under-13s, a parent, guardian, or teacher creates the account and signs in. Put the
            child&apos;s name below — that&apos;s who the certificate names — but use{" "}
            <strong>your own</strong> email and password.
          </p>
          <p className="mt-2">
            These accounts can log hours and cards. They can&apos;t submit stories, because
            publishing a child&apos;s writing needs a different kind of permission than an account
            can carry.
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
          autoComplete={isGuardian ? "off" : "name"}
          autoCapitalize="words"
          required
          defaultValue={valueOf(state, "fullName")}
          hint
          error={errors?.fullName}
        />
      </Field>

      <Field
        label={isGuardian ? "Your email (parent, guardian, or teacher)" : "Email"}
        htmlFor="email"
        required
        hint={isGuardian ? "Every email comes to you, not to the child." : undefined}
        error={errors?.email}
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
          hint={isGuardian || undefined}
          error={errors?.email}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        required
        hint="At least 10 characters. A few words strung together beats one clever word."
        error={errors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          hint
          error={errors?.password}
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

      <CheckboxRow
        key={`terms-${attempt}`}
        id="terms"
        name="terms"
        value="on"
        label={isGuardian ? "I'm the parent, guardian, or teacher, and I agree" : "I agree"}
        hint={
          <>
            {isMinor ? "Please check with a parent or guardian first. " : null}
            I&apos;ve read the{" "}
            <Link className={linkClass} href="/terms">
              terms of use
            </Link>{" "}
            and the{" "}
            <Link className={linkClass} href="/privacy">
              privacy policy
            </Link>
            .
          </>
        }
        defaultChecked={valueOf(state, "terms") === "on"}
        error={errors?.terms}
      />

      <div className="flex flex-col items-start gap-3">
        <SubmitButton pendingLabel="Creating…">Create my account</SubmitButton>
        <p className="text-sm text-brown-mid">
          Already have one?{" "}
          <Link className={linkClass} href="/login">
            Sign in instead
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
