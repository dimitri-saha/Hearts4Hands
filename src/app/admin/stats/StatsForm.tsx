"use client";

import { useActionState, useState } from "react";

import { updateStats } from "@/app/actions/admin";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/FormBits";
import { idleState } from "@/lib/action-state";

export type StatsFormValues = {
  /** Dollars, not cents — the action multiplies by 100 on the way in. */
  totalRaised: string;
  materials: string;
  research: string;
  goal: string;
  cardsMade: string;
  volunteers: string;
  hoursLogged: string;
  hospitalsServed: string;
  note: string;
};

const money = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

/**
 * The manually maintained impact numbers (PRD §5.3).
 *
 * Client-side only because `updateStats` returns an ActionState. The
 * allocation check here mirrors the one the action runs on save, so a mismatch
 * is visible before the editor commits to it rather than after.
 */
export function StatsForm({ initial }: { initial: StatsFormValues }) {
  const [state, action] = useActionState(updateStats, idleState);
  const [totalRaised, setTotalRaised] = useState(initial.totalRaised);
  const [materials, setMaterials] = useState(initial.materials);
  const [research, setResearch] = useState(initial.research);

  const errors = state.errors ?? {};
  const allocated = money(materials) + money(research);
  const total = money(totalRaised);
  const mismatch = Math.abs(allocated - total) > 0.01;
  const gap = allocated - total;

  return (
    <form action={action} className="flex flex-col gap-7">
      {state.status !== "idle" && state.message ? (
        <Alert
          tone={state.status === "success" ? "success" : "error"}
          title={state.status === "success" ? "Saved" : "Not saved"}
        >
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display text-xl font-bold text-berry">Money</legend>
        <p className="text-sm text-brown-mid">
          Enter whole dollars — no <span className="font-bold">$</span> sign and no cents needed.
          These drive the running total and the allocation bar on{" "}
          <span className="font-bold text-brown">/donate</span>, and the &ldquo;raised so
          far&rdquo; tile on the home page.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Total raised"
            htmlFor="totalRaised"
            required
            error={errors.totalRaised}
            hint="Everything in, across GoFundMe, Venmo, PayPal, and cash."
          >
            <Input
              id="totalRaised"
              name="totalRaised"
              hint
              error={errors.totalRaised}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={totalRaised}
              onChange={(e) => setTotalRaised(e.target.value)}
            />
          </Field>

          <Field
            label="Fundraising goal"
            htmlFor="goal"
            required
            error={errors.goal}
            hint="The target the progress bar fills toward."
          >
            <Input
              id="goal"
              name="goal"
              hint
              error={errors.goal}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              defaultValue={initial.goal}
            />
          </Field>

          <Field
            label="Spent on materials"
            htmlFor="materials"
            required
            error={errors.materials}
            hint="Paper, crayons, envelopes, postage."
          >
            <Input
              id="materials"
              name="materials"
              hint
              error={errors.materials}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
            />
          </Field>

          <Field
            label="Given to research"
            htmlFor="research"
            required
            error={errors.research}
            hint="Donated onward to cancer research."
          >
            <Input
              id="research"
              name="research"
              hint
              error={errors.research}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={research}
              onChange={(e) => setResearch(e.target.value)}
            />
          </Field>
        </div>

        <div
          aria-live="polite"
          className={
            mismatch
              ? "rough-2 border-[2.5px] border-red bg-red/8 px-5 py-3"
              : "rough-2 border-[2.5px] border-brown-faint bg-cream px-5 py-3"
          }
        >
          <p className="font-display font-bold text-berry">
            Materials + research = {usd(allocated)}
          </p>
          <p className="mt-0.5 text-sm text-brown-mid">
            {mismatch ? (
              <>
                Heads up: the total says {usd(total)} — that&apos;s{" "}
                <span className="font-bold text-red-deep">
                  {usd(Math.abs(gap))} {gap > 0 ? "more allocated than raised" : "unallocated"}
                </span>
                . You can still save; the site will just show a split that doesn&apos;t add up to
                the total.
              </>
            ) : (
              <>That matches the total raised. The allocation bar will add up.</>
            )}
          </p>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display text-xl font-bold text-berry">Counts</legend>
        <p className="text-sm text-brown-mid">
          Whole numbers. These are the impact tiles on the home page and the About page.
        </p>
        <div className="rounded-lg border border-sky bg-sky/10 px-4 py-3 text-sm text-brown">
          <strong className="font-display text-berry">
            Cards, volunteers and hours are now worked out automatically
          </strong>{" "}
          from approved hour entries, so the public site ignores whatever is typed below for those
          three. Approve an entry on{" "}
          <a
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
            href="/admin/volunteers"
          >
            Volunteer hours
          </a>{" "}
          and the figures move on their own. They&apos;re kept here only as a record of what was
          counted before accounts existed. <strong>Money raised is still yours to maintain.</strong>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Cards made"
            htmlFor="cardsMade"
            required
            error={errors.cardsMade}
            hint="Delivered, not planned."
          >
            <Input
              id="cardsMade"
              name="cardsMade"
              hint
              error={errors.cardsMade}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={initial.cardsMade}
            />
          </Field>

          <Field
            label="Volunteers"
            htmlFor="volunteers"
            required
            error={errors.volunteers}
            hint="Distinct people who've signed up."
          >
            <Input
              id="volunteers"
              name="volunteers"
              hint
              error={errors.volunteers}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={initial.volunteers}
            />
          </Field>

          <Field
            label="Hours logged"
            htmlFor="hoursLogged"
            required
            error={errors.hoursLogged}
            hint="Approved hours only."
          >
            <Input
              id="hoursLogged"
              name="hoursLogged"
              hint
              error={errors.hoursLogged}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={initial.hoursLogged}
            />
          </Field>

          <Field
            label="Hospitals served"
            htmlFor="hospitalsServed"
            required
            error={errors.hospitalsServed}
            hint="Where cards have actually landed."
          >
            <Input
              id="hospitalsServed"
              name="hospitalsServed"
              hint
              error={errors.hospitalsServed}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={initial.hospitalsServed}
            />
          </Field>
        </div>
      </fieldset>

      <Field
        label="Internal note"
        htmlFor="note"
        error={errors.note}
        hint="For the next editor: where these numbers came from, what's not counted yet. Up to 280 characters. Not shown on the public site."
      >
        <Textarea
          id="note"
          name="note"
          hint
          error={errors.note}
          rows={3}
          maxLength={280}
          defaultValue={initial.note}
          className="min-h-0"
        />
      </Field>

      <div>
        <SubmitButton pendingLabel="Saving…" size="md">
          Save impact numbers
        </SubmitButton>
      </div>
    </form>
  );
}
