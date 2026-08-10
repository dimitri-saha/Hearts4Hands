"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";

import { submitVolunteer } from "@/app/actions/public";
import { idleState, valueOf, valuesOf } from "@/lib/action-state";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  pvsaTiers,
  volunteerActivities,
} from "@/lib/site";
import { Alert, SuccessPanel } from "@/components/ui/Feedback";
import {
  CheckboxRow,
  Field,
  Fieldset,
  Input,
  Select,
  Textarea,
} from "@/components/ui/Field";
import {
  AntiSpamFields,
  FileField,
  SubmitButton,
  useFormAttempt,
} from "@/components/ui/FormBits";
import { Squiggle } from "@/components/illustrations/Doodles";

const ageGroups = [
  "Under 13",
  "13 to 15",
  "16 to 17",
  "18 to 24",
  "25 or older",
] as const;

const acceptedTypes = ACCEPTED_IMAGE_TYPES.join(",");

/** One titled block of the form, so a long form reads as a few short ones. */
function FormBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-center gap-2 text-xl">
          {title}
          <Squiggle className="h-3 w-10 opacity-80" />
        </h3>
        {hint ? <p className="text-sm text-brown-mid">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Encouraging, never pressuring: how far this many hours is from the next tier. */
function awardHint(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) return null;
  const rounded = Math.round(hours * 10) / 10;
  const next = pvsaTiers.find((tier) => tier.hours > rounded);
  if (!next) {
    const top = pvsaTiers[pvsaTiers.length - 1];
    return `${rounded} hours — that's past the ${top.name} mark of ${top.hours}. Thank you for all of it.`;
  }
  const remaining = Math.round((next.hours - rounded) * 10) / 10;
  return `${rounded} hours logged. About ${remaining} more across the year reaches ${next.name}.`;
}

/**
 * Hours + cards, with the live award hint underneath.
 *
 * Split out and keyed on the echoed hours value so that when React resets the
 * form after a failed submission, this remounts and the hint re-derives from
 * the repopulated value — no state-syncing effect needed.
 */
function HoursBlock({
  defaultHours,
  defaultCards,
  hoursError,
  cardsError,
}: {
  defaultHours: string;
  defaultCards: string;
  hoursError?: string;
  cardsError?: string;
}) {
  const [hours, setHours] = useState(() => Number(defaultHours) || 0);
  const hint = awardHint(hours);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Hours volunteered"
          htmlFor="hours"
          hint="A person reads every entry, so please don't round up. Half hours are fine."
          error={hoursError}
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
            defaultValue={defaultHours}
            onChange={(e) => setHours(Number(e.currentTarget.value))}
            hint
            error={hoursError}
          />
        </Field>

        <Field label="Cards made" htmlFor="cardsMade" error={cardsError}>
          <Input
            id="cardsMade"
            name="cardsMade"
            type="number"
            inputMode="numeric"
            min={0}
            step="1"
            placeholder="0"
            defaultValue={defaultCards}
            error={cardsError}
          />
        </Field>
      </div>

      <p aria-live="polite" className="min-h-6 font-hand text-base text-red-deep">
        {hint}
      </p>
    </>
  );
}

export function VolunteerForm() {
  const [state, formAction] = useActionState(submitVolunteer, idleState);
  const alertRef = useRef<HTMLDivElement>(null);
  // Remounts <select>/checkboxes after a failed submit so the age group,
  // chosen activities, and consent tick survive — see useFormAttempt.
  // Must sit above the success early-return: hooks run unconditionally.
  const attempt = useFormAttempt(state);

  // Move focus to the form-level error so it can't be missed on a phone, where
  // the top of a long form is well off-screen by the time you hit submit.
  useEffect(() => {
    if (state.status === "error" && state.message) {
      alertRef.current?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Got it — thank you.">
        <p>{state.message}</p>
        {/* No "check your inbox" line here — whether a confirmation was
            actually sent depends on RESEND_API_KEY, so the server action says
            it in `state.message` only when the send succeeded. */}
        <ul className="mx-auto mt-4 flex max-w-md list-none flex-col gap-2 text-left">
          <li>A real person reviews every submission. Give it a couple of weeks.</li>
          <li>
            If you told us you made cards, we&apos;ll email you the current mailing address
            before you send anything.
          </li>
        </ul>
        <p className="mt-5">
          While you wait:{" "}
          <Link
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href="/blog/submit"
          >
            share a story
          </Link>{" "}
          or{" "}
          <Link
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href="/donate"
          >
            help with materials
          </Link>
          .
        </p>
      </SuccessPanel>
    );
  }

  const errors = state.errors;
  const checkedActivities = valuesOf(state, "activities");
  const defaultHours = valueOf(state, "hours");

  return (
    <form
      action={formAction}
      noValidate
      // No `encType` here on purpose: React sets multipart itself for a form
      // with a function action, and warns (then overrides) if we specify one.
      // The `proof` file still arrives in FormData.
      className="relative flex flex-col gap-10"
    >
      <AntiSpamFields />

      {state.status === "error" && state.message ? (
        <div ref={alertRef} tabIndex={-1}>
          <Alert tone="error" title="We couldn't send that yet">
            <p>{state.message}</p>
          </Alert>
        </div>
      ) : null}

      <FormBlock title="About you">
        <Field label="Your name" htmlFor="fullName" required error={errors?.fullName}>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            required
            defaultValue={valueOf(state, "fullName")}
            error={errors?.fullName}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="email"
          required
          hint="We use this to confirm your submission and nothing else."
          error={errors?.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={valueOf(state, "email")}
            hint
            error={errors?.email}
          />
        </Field>

        <Field label="Age group" htmlFor="ageGroup" error={errors?.ageGroup}>
          <Select
            key={`ageGroup-${attempt}`}
            id="ageGroup"
            name="ageGroup"
            defaultValue={valueOf(state, "ageGroup")}
            error={errors?.ageGroup}
          >
            <option value="">Prefer not to say</option>
            {ageGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="School or group"
          htmlFor="school"
          hint="If you're volunteering with a club or class, tell us its name."
          error={errors?.school}
        >
          <Input
            id="school"
            name="school"
            type="text"
            autoComplete="organization"
            defaultValue={valueOf(state, "school")}
            hint
            error={errors?.school}
          />
        </Field>
      </FormBlock>

      <FormBlock
        title="Where you are"
        hint="Volunteers write to us from all over. Country is all we really need."
      >
        <Field label="Country" htmlFor="country" required error={errors?.country}>
          <Input
            id="country"
            name="country"
            type="text"
            autoComplete="country-name"
            required
            defaultValue={valueOf(state, "country")}
            error={errors?.country}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="State or province" htmlFor="state" error={errors?.state}>
            <Input
              id="state"
              name="state"
              type="text"
              autoComplete="address-level1"
              defaultValue={valueOf(state, "state")}
              error={errors?.state}
            />
          </Field>

          <Field label="City or town" htmlFor="city" error={errors?.city}>
            <Input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              defaultValue={valueOf(state, "city")}
              error={errors?.city}
            />
          </Field>
        </div>
      </FormBlock>

      <FormBlock title="What you'd like to do">
        <Fieldset
          legend="Pick as many as you like"
          hint="You can change your mind later — just send another form."
          error={errors?.activities}
        >
          {volunteerActivities.map((activity) => (
            <CheckboxRow
              key={`${activity.value}-${attempt}`}
              id={`activity-${activity.value}`}
              name="activities"
              value={activity.value}
              label={activity.label}
              hint={activity.blurb}
              defaultChecked={checkedActivities.includes(activity.value)}
            />
          ))}
        </Fieldset>
      </FormBlock>

      <FormBlock
        title="Hours and cards"
        hint="Only if you've already done something. Signing up first is completely fine — leave these at zero."
      >
        <HoursBlock
          key={`hours-${defaultHours}`}
          defaultHours={defaultHours}
          defaultCards={valueOf(state, "cardsMade")}
          hoursError={errors?.hours}
          cardsError={errors?.cardsMade}
        />

        <Field
          label="When did you do it?"
          htmlFor="activityDate"
          hint="Roughly is fine. If it was spread over weeks, use the last day."
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

        <Field
          label="Photo of your cards"
          htmlFor="proof"
          hint="A phone photo of the finished cards laid out on a table is perfect. JPG, PNG, WEBP, HEIC, or PDF, up to 8 MB."
        >
          <FileField
            id="proof"
            name="proof"
            accept={acceptedTypes}
            maxBytes={MAX_UPLOAD_BYTES}
            error={errors?.proof}
            hint="Drag a photo here, or choose a file."
          />
        </Field>
      </FormBlock>

      <FormBlock title="Anything else">
        <Field
          label="Notes for us"
          htmlFor="notes"
          hint="Questions, a school deadline we should know about, or what you'd like to try next."
          error={errors?.notes}
        >
          <Textarea
            id="notes"
            name="notes"
            rows={5}
            maxLength={2000}
            defaultValue={valueOf(state, "notes")}
            hint
            error={errors?.notes}
          />
        </Field>

        <CheckboxRow
          key={`consent-${attempt}`}
          id="consent"
          name="consent"
          label="Everything here is accurate, and you can email me about it."
          hint="If you're under 18, please check with a parent or guardian first."
          defaultChecked={valueOf(state, "consent") === "on"}
          error={errors?.consent}
        />
      </FormBlock>

      <div className="flex flex-col items-start gap-3">
        <SubmitButton pendingLabel="Sending…">Send it in</SubmitButton>
        <p className="text-sm text-brown-soft">
          One person reads every submission. It usually takes a couple of weeks.
        </p>
      </div>
    </form>
  );
}
