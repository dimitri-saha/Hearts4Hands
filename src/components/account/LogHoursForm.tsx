"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { logHours } from "@/app/actions/account";
import { idleState, valueOf, valuesOf } from "@/lib/action-state";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, volunteerActivities } from "@/lib/site";
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
  const checked = valuesOf(state, "activities");

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
            defaultChecked={checked.includes(activity.value)}
          />
        ))}
      </Fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
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

        <Field label="Cards made" htmlFor="cardsMade" error={errors?.cardsMade}>
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
        label="Photo of your cards"
        htmlFor="proof"
        hint="Photograph the cards, not people. It's how we check the work before certifying it."
        error={errors?.proof}
      >
        <FileField
          id="proof"
          name="proof"
          accept={acceptedTypes}
          maxBytes={MAX_UPLOAD_BYTES}
          error={errors?.proof}
          hint="Drag a photo here, or choose a file. Up to 8 MB."
        />
      </Field>

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
