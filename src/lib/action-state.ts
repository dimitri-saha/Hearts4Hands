/**
 * Shared shape for every `useActionState` form on the site.
 *
 * Server actions return this instead of throwing, so a validation failure
 * re-renders the form with per-field messages and the user's typing intact —
 * which matters a lot here, since the blog form can hold a long personal story.
 */
export type ActionState = {
  status: "idle" | "success" | "error";
  /** Form-level message: the success note, or why the whole submission failed. */
  message?: string;
  /** Per-field messages, keyed by input name. */
  errors?: Record<string, string>;
  /** Echoed submitted values so the form can repopulate after an error. */
  values?: Record<string, string | string[]>;
};

export const idleState: ActionState = { status: "idle" };

export function errorState(
  message: string,
  errors?: Record<string, string>,
  values?: Record<string, string | string[]>,
): ActionState {
  return { status: "error", message, errors, values };
}

export function successState(message: string): ActionState {
  return { status: "success", message };
}

/**
 * Pull submitted values back out of FormData so an errored form can be
 * repopulated. Files are skipped — browsers won't let us re-seed them anyway.
 */
export function echoValues(formData: FormData, multiKeys: string[] = []) {
  const values: Record<string, string | string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    if (key === "website" || key === "elapsed") continue;
    if (multiKeys.includes(key)) {
      const existing = values[key];
      values[key] = Array.isArray(existing) ? [...existing, value] : [value];
    } else {
      values[key] = value;
    }
  }
  return values;
}

/** Read a repopulated single value. */
export function valueOf(state: ActionState, key: string, fallback = "") {
  const v = state.values?.[key];
  return typeof v === "string" ? v : fallback;
}

/** Read a repopulated multi-value (checkbox group). */
export function valuesOf(state: ActionState, key: string): string[] {
  const v = state.values?.[key];
  if (Array.isArray(v)) return v;
  return typeof v === "string" ? [v] : [];
}
