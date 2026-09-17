"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { logHours } from "@/app/actions/account";
import { idleState, valueOf, valuesOf } from "@/lib/action-state";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  deliveryMethods,
  volunteerActivities,
} from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Alert, SuccessPanel } from "@/components/ui/Feedback";
import { CheckboxRow, Field, Fieldset, Input, Select, Textarea } from "@/components/ui/Field";
import {
  AntiSpamFields,
  FileField,
  SubmitButton,
  useFormAttempt,
} from "@/components/ui/FormBits";

const acceptedTypes = ACCEPTED_IMAGE_TYPES.join(",");

const linkClass =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4";

export type GroupOption = { id: string; name: string };

/**
 * Deliberately shorter than the old public form.
 *
 * Name, email and country come from the profile, so they aren't asked again —
 * that's the payoff for putting this behind a login, and it removes any chance
 * of the two records disagreeing about who logged what.
 */
export function LogHoursForm({ groups }: { groups: GroupOption[] }) {
  const [state, formAction] = useActionState(logHours, idleState);
  const alertRef = useRef<HTMLDivElement>(null);
  const attempt = useFormAttempt(state);

  // Which activities are ticked, tracked in React rather than read off the DOM:
  // three later fields appear, disappear or change wording based on this, and
  // "cards made" makes no sense to ask somebody who only ran a bake sale.
  const [picked, setPicked] = useState<string[]>(() => valuesOf(state, "activities"));
  const madeCards = picked.includes("cards");
  const isWriting = picked.includes("writing");

  const toggle = (value: string, on: boolean) =>
    setPicked((prev) => (on ? [...new Set([...prev, value])] : prev.filter((v) => v !== value)));

  useEffect(() => {
    if (state.status === "error" && state.message) alertRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Logged — thank you.">
        <p>{state.message}</p>
        <p className="mt-4">
          <Link className={linkClass} href="/account">
            Back to your account
          </Link>
        </p>
      </SuccessPanel>
    );
  }

  const errors = state.errors;

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-6">
      <AntiSpamFields />

      {state.status === "error" && state.message ? (
        <div ref={alertRef} tabIndex={-1}>
          <Alert tone="error" title="Couldn't save that">
            <p>{state.message}</p>
          </Alert>
        </div>
      ) : null}

      <Fieldset
        legend="What did you do?"
        hint="Tick everything that applies."
        error={errors?.activities}
      >
        {volunteerActivities.map((activity) => (
          <CheckboxRow
            key={`${activity.value}-${attempt}`}
            id={`activity-${activity.value}`}
            name="activities"
            value={activity.value}
            label={activity.label}
            defaultChecked={picked.includes(activity.value)}
            onChange={(on) => toggle(activity.value, on)}
          />
        ))}
      </Fieldset>

      {isWriting ? (
        <Alert tone="info" title="Stories go somewhere else">
          <p>
            Writing for the blog runs through its own form — an editor reads every submission and
            works with you on edits before anything goes live. This page only records hours.
          </p>
          <p className="mt-2">
            You can still log the hours you spent writing here. Send the story itself over there.
          </p>
          <div className="mt-4">
            <Button href="/blog/submit" size="sm">
              Go to the story form
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className={madeCards ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
        <Field
          label="Hours"
          htmlFor="hours"
          required
          hint="Please don't round up — a person reads every entry."
          error={errors?.hours}
        >
          <Input
            id="hours"
            name="hours"
            type="number"
            inputMode="decimal"
            min={0}
            max={2000}
            step="0.25"
            placeholder="0"
            defaultValue={valueOf(state, "hours")}
            hint
            error={errors?.hours}
          />
        </Field>

        {/* Only asked of people who made cards. Everyone else was being shown a
            box that could only ever be zero. */}
        {madeCards ? (
          <Field label="Cards made" htmlFor="cardsMade" required error={errors?.cardsMade}>
            <Input
              id="cardsMade"
              name="cardsMade"
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              placeholder="0"
              defaultValue={valueOf(state, "cardsMade")}
              error={errors?.cardsMade}
            />
          </Field>
        ) : null}
      </div>

      <Field
        label="When did you do it?"
        htmlFor="activityDate"
        hint="Roughly is fine. It's what the dates on your certificate come from."
        error={errors?.activityDate}
      >
        <Input
          id="activityDate"
          name="activityDate"
          type="date"
          defaultValue={valueOf(state, "activityDate")}
          hint
          error={errors?.activityDate}
        />
      </Field>

      {groups.length > 0 ? (
        <Field
          label="Count this toward a club?"
          htmlFor="groupId"
          hint="Your hours always count for you. This also adds them to the club's total."
          error={errors?.groupId}
        >
          <Select
            key={`groupId-${attempt}`}
            id="groupId"
            name="groupId"
            defaultValue={valueOf(state, "groupId")}
            hint
            error={errors?.groupId}
          >
            <option value="">Just me</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <Field
        label="Proof of volunteering"
        htmlFor="proof"
        required
        hint={
          madeCards
            ? "Photograph the cards, not people — a clear shot where we can count them. If you're mailing them yourself, add a photo of the envelope with Hearts4Hands written on it."
            : "A photo of the bake sale table, the event, a screenshot of the post — whatever shows the work. Photograph the work, not people."
        }
        error={errors?.proof}
      >
        <FileField
          id="proof"
          name="proof"
          accept={acceptedTypes}
          maxBytes={MAX_UPLOAD_BYTES}
          required
          error={errors?.proof}
          hint="Drag a photo here, or choose a file. Up to 8 MB."
        />
      </Field>

      {/* Only cards need posting anywhere, so only card entries get asked. */}
      {madeCards ? (
        <Fieldset
          legend="How are the cards getting there?"
          hint="Either is fine — we just need to know what to expect."
          error={errors?.deliveryMethod}
        >
          {deliveryMethods.map((method) => (
            <label
              key={`${method.value}-${attempt}`}
              htmlFor={`delivery-${method.value}`}
              className="group flex cursor-pointer items-start gap-3 rough-3 border-2 border-brown/45 bg-paper p-3.5 transition-colors duration-150 hover:border-red hover:bg-blush/60 has-checked:border-red has-checked:bg-blush"
            >
              <input
                type="radio"
                id={`delivery-${method.value}`}
                name="deliveryMethod"
                value={method.value}
                defaultChecked={valueOf(state, "deliveryMethod") === method.value}
                className="mt-1 h-5 w-5 shrink-0 accent-red"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-display font-bold text-brown">{method.label}</span>
                <span className="text-sm text-brown-mid">{method.blurb}</span>
              </span>
            </label>
          ))}
        </Fieldset>
      ) : null}

      <Field label="Anything else?" htmlFor="notes" error={errors?.notes}>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Where the cards went, who helped, anything we should know."
          defaultValue={valueOf(state, "notes")}
          error={errors?.notes}
        />
      </Field>

      <SubmitButton pendingLabel="Saving…">Log it</SubmitButton>
    </form>
  );
}
