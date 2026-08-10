"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./Button";

/** Submit button that disables itself and swaps its label while pending. */
export function SubmitButton({
  children,
  pendingLabel = "Sending…",
  variant = "primary",
  size = "lg",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={buttonClasses({ variant, size, className })}
    >
      {pending ? (
        <>
          <PencilSpinner />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function PencilSpinner() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 animate-spin">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path
        d="M12 3 a 9 9 0 0 1 9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Spam traps shared by every public form.
 *
 * `website` is a real input positioned off-screen — bots that fill every field
 * trip it. `elapsed` measures how long the form was open; scripted posts fire
 * in well under the threshold. Neither blocks a real person, and neither
 * depends on a third-party captcha.
 */
export function AntiSpamFields() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // `Date.now()` lives in the effect, not in a ref initializer: reading the
    // clock during render is impure and can produce a hydration mismatch.
    const start = Date.now();
    const id = window.setInterval(() => {
      const ms = Date.now() - start;
      setElapsed(ms);
      // Past a minute nothing downstream cares, so stop re-rendering.
      if (ms > 60_000) window.clearInterval(id);
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website-field">Leave this field empty</label>
      <input
        id="website-field"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
      <input type="hidden" name="elapsed" value={elapsed} readOnly />
    </div>
  );
}

/** File input with a drag-and-drop surface and a chosen-file preview. */
export function FileField({
  id,
  name,
  accept,
  error,
  hint,
  maxBytes,
}: {
  id: string;
  name: string;
  accept?: string;
  error?: string;
  hint?: string;
  maxBytes?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const describedBy = useId();

  function handleFile(next: File | null) {
    if (next && maxBytes && next.size > maxBytes) {
      setLocalError(
        `That file is ${(next.size / 1024 / 1024).toFixed(1)} MB. Please keep it under ${Math.round(
          maxBytes / 1024 / 1024,
        )} MB.`,
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setLocalError(null);
    setFile(next);
  }

  const shown = localError ?? error;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const dropped = e.dataTransfer.files?.[0] ?? null;
          if (dropped && inputRef.current) {
            const dt = new DataTransfer();
            dt.items.add(dropped);
            inputRef.current.files = dt.files;
            handleFile(dropped);
          }
        }}
        className={cn(
          "rough-1 border-[2.5px] border-dashed border-brown/55 bg-cream/70 p-5 text-center transition-colors",
          dragging && "border-red bg-blush",
          shown && "border-red bg-red/5",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          aria-describedby={describedBy}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className={cn(
            "block w-full cursor-pointer text-sm text-brown-mid",
            "file:mr-3 file:cursor-pointer file:rough-pill file:border-[2.5px] file:border-brown",
            "file:bg-pink file:px-4 file:py-2 file:font-display file:font-bold file:text-berry",
            "hover:file:bg-pink-deep hover:file:text-paper",
          )}
        />
        <p id={describedBy} className="mt-2.5 text-sm text-brown-mid">
          {file ? (
            <span className="font-hand text-base text-berry">
              Ready to send: {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </span>
          ) : (
            (hint ?? "Drag a photo here, or choose a file.")
          )}
        </p>
      </div>
      {shown ? (
        <p role="alert" className="font-hand text-base text-red-deep">
          {shown}
        </p>
      ) : null}
    </div>
  );
}

/** Live character counter for long-form fields. */
export function CharacterCount({
  targetId,
  min,
  max,
}: {
  targetId: string;
  min?: number;
  max: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    // Guard the element type, not just its existence: an id collision with a
    // wrapper element would otherwise read `.value` off something that has no
    // value and take the whole page down.
    if (!(el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[CharacterCount] no input or textarea with id "${targetId}"`);
      }
      return;
    }
    const update = () => setCount(el.value.length);
    update();
    el.addEventListener("input", update);
    return () => el.removeEventListener("input", update);
  }, [targetId]);

  const short = min !== undefined && count > 0 && count < min;
  const over = count > max;

  return (
    <p
      className={cn(
        "text-right text-sm tabular-nums",
        short || over ? "text-red-deep" : "text-brown-soft",
      )}
      aria-live="polite"
    >
      {count.toLocaleString()} / {max.toLocaleString()}
      {short ? ` — ${min - count} more to go` : null}
    </p>
  );
}
