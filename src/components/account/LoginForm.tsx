"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { sendMagicLink, signInWithPassword } from "@/app/actions/account";
import { idleState, valueOf } from "@/lib/action-state";
import { cn } from "@/lib/utils";
import { Alert, SuccessPanel } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Field";
import { AntiSpamFields, SubmitButton } from "@/components/ui/FormBits";

const linkClass =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2";

/**
 * Two ways in, as chosen: a password, or a one-time link.
 *
 * Rendered as two tabs over two separate `<form>`s rather than one form with a
 * mode flag — each has its own action and its own `useActionState`, so an error
 * in one can't blank the other.
 */
export function LoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [mode, setMode] = useState<"password" | "magic">("password");

  return (
    <div className="flex flex-col gap-5">
      {linkError ? (
        <Alert tone="error" title="That link didn't work">
          <p>
            Email links expire after an hour and can only be used once. Ask for a fresh one below.
          </p>
        </Alert>
      ) : null}

      <div
        role="tablist"
        aria-label="How would you like to sign in?"
        className="grid grid-cols-2 gap-2"
      >
        {(
          [
            ["password", "With a password"],
            ["magic", "Email me a link"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={cn(
              "rough-pill border-[2.5px] px-4 py-2 font-display text-sm font-bold transition-colors",
              mode === value
                ? "border-brown bg-red text-paper"
                : "border-brown/40 bg-paper text-brown hover:border-red hover:bg-blush",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "password" ? <PasswordForm next={next} /> : <MagicLinkForm next={next} />}
    </div>
  );
}

function PasswordForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInWithPassword, idleState);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error" && state.message) alertRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-4">
      <AntiSpamFields />
      <input type="hidden" name="next" value={next ?? ""} />

      {state.status === "error" && state.message ? (
        <div ref={alertRef} tabIndex={-1}>
          <Alert tone="error" title="Couldn't sign you in">
            <p>{state.message}</p>
          </Alert>
        </div>
      ) : null}

      <Field label="Email" htmlFor="email" required error={state.errors?.email}>
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
          error={state.errors?.email}
        />
      </Field>

      <Field label="Password" htmlFor="password" required error={state.errors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state.errors?.password}
        />
      </Field>

      <div className="flex flex-col items-start gap-3">
        <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
        <p className="text-sm text-brown-mid">
          <Link className={linkClass} href="/forgot-password">
            Forgotten your password?
          </Link>
        </p>
      </div>
    </form>
  );
}

function MagicLinkForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(sendMagicLink, idleState);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Link sent">
        <p>{state.message}</p>
        <p className="mt-3 text-sm">
          Open it on this device if you can — that way you land straight in your account.
        </p>
      </SuccessPanel>
    );
  }

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-4">
      <AntiSpamFields />
      <input type="hidden" name="next" value={next ?? ""} />

      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Couldn't send that">
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <Field
        label="Email"
        htmlFor="magic-email"
        required
        hint="We'll send a link that signs you in — no password needed."
        error={state.errors?.email}
      >
        <Input
          id="magic-email"
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

      <SubmitButton pendingLabel="Sending…">Email me a link</SubmitButton>
    </form>
  );
}
