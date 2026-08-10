import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const controlBase = cn(
  "w-full bg-paper text-brown placeholder:text-brown-soft/80",
  "border-[2.5px] border-brown/60 rough-2 px-4 py-2.5",
  "font-body text-base leading-relaxed",
  "transition-colors duration-150",
  "hover:border-brown focus:border-red focus:outline-none",
  "disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-70",
);

const errorRing = "border-red bg-red/5";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="font-display text-base font-bold text-berry">
        {label}
        {required ? (
          <span className="ml-1 text-red" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 font-body text-sm font-normal text-brown-soft">optional</span>
        )}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-brown-mid">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="font-hand text-base text-red-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Wires up aria-describedby/aria-invalid from the hint + error ids. */
function describedBy(id: string, hint?: unknown, error?: unknown) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function Input({
  id,
  error,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string; hint?: unknown }) {
  return (
    <input
      id={id}
      name={props.name ?? id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      className={cn(controlBase, error && errorRing, className)}
      {...props}
    />
  );
}

export function Textarea({
  id,
  error,
  hint,
  className,
  rows = 6,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string; hint?: unknown }) {
  return (
    <textarea
      id={id}
      name={props.name ?? id}
      rows={rows}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      className={cn(controlBase, "min-h-32 resize-y", error && errorRing, className)}
      {...props}
    />
  );
}

export function Select({
  id,
  error,
  hint,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { id: string; error?: string; hint?: unknown }) {
  return (
    <div className="relative">
      <select
        id={id}
        name={props.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlBase, "appearance-none pr-10", error && errorRing, className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-brown"
      >
        <path
          d="M4 8 L 12 17 L 20 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Checkbox styled as a hand-drawn box with a crayon tick.
 *
 * Renders its own error message and wires `aria-invalid`/`aria-describedby`,
 * so a required consent box behaves like every other field.
 */
export function CheckboxRow({
  id,
  name,
  value,
  label,
  hint,
  error,
  defaultChecked,
  className,
}: {
  id: string;
  name: string;
  value?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn(
          "group flex cursor-pointer items-start gap-3 rough-3 border-2 bg-paper p-3.5",
          "transition-colors duration-150 hover:border-red hover:bg-blush/60",
          "has-checked:border-red has-checked:bg-blush",
          error ? "border-red bg-red/5" : "border-brown/45",
          className,
        )}
      >
        <span className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            id={id}
            name={name}
            value={value}
            defaultChecked={defaultChecked}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, hint, error)}
            className="peer h-6 w-6 cursor-pointer appearance-none rounded-[7px_9px_6px_10px] border-[2.5px] border-brown bg-paper checked:bg-red checked:border-brown"
          />
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute h-4 w-4 opacity-0 peer-checked:opacity-100"
          >
            <path
              d="M4 13 L 9 19 L 20 5"
              fill="none"
              stroke="#fffcf8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-display font-bold text-berry">{label}</span>
          {hint ? (
            <span id={`${id}-hint`} className="text-sm text-brown-mid">
              {hint}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p id={`${id}-error`} role="alert" className="font-hand text-base text-red-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Fieldset({
  legend,
  hint,
  error,
  children,
  className,
}: {
  legend: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-2.5", className)}>
      <legend className="font-display text-base font-bold text-berry">{legend}</legend>
      {hint ? <p className="text-sm text-brown-mid">{hint}</p> : null}
      <div className="mt-1 grid gap-2.5 sm:grid-cols-2">{children}</div>
      {error ? (
        <p role="alert" className="font-hand text-base text-red-deep">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
