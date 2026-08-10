import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { PaperPlane } from "@/components/illustrations/Objects";
import { Heart } from "@/components/illustrations/Hearts";

const tones = {
  success: "bg-leaf/12 border-leaf text-brown",
  error: "bg-red/8 border-red text-berry",
  info: "bg-blush border-pink-deep text-brown",
  note: "bg-cream border-brown-faint text-brown-mid",
} as const;

/** Inline message block — form results, empty states, admin notices. */
export function Alert({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: keyof typeof tones;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role ?? (tone === "error" ? "alert" : "status")}
      className={cn("rough-2 border-[2.5px] px-5 py-4", tones[tone], className)}
    >
      {title ? (
        <p className="font-display text-lg font-bold text-berry">{title}</p>
      ) : null}
      {children ? <div className={cn(title && "mt-1", "text-[0.98rem]")}>{children}</div> : null}
    </div>
  );
}

/** Full-width confirmation panel shown after a successful submission. */
export function SuccessPanel({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "animate-pop-in rough-1 border-[3px] border-brown bg-cream px-6 py-8 text-center sticker-shadow",
        className,
      )}
    >
      <PaperPlane className="mx-auto h-20 w-24" />
      <h2 className="mt-4 text-2xl sm:text-3xl">{title}</h2>
      {children ? <div className="mx-auto mt-3 max-w-prose text-brown-mid">{children}</div> : null}
    </div>
  );
}

/** Friendly empty state with a doodle. */
export function EmptyState({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rough-3 border-[2.5px] border-dashed border-brown-faint bg-cream/60 px-6 py-12 text-center",
        className,
      )}
    >
      <Heart className="mx-auto h-12 w-12 opacity-60" fill="#f2c3bc" />
      <p className="mt-4 font-display text-xl font-bold text-berry">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-prose text-brown-mid">{children}</div> : null}
    </div>
  );
}

/**
 * Banner shown when a feature needs Supabase credentials that aren't set yet.
 * Kept deliberately warm and non-technical for the public side.
 */
export function NotConfiguredNotice({
  what,
  className,
}: {
  what: string;
  className?: string;
}) {
  return (
    <Alert tone="note" title="Almost ready!" className={className}>
      <p>
        {what} isn&apos;t switched on quite yet. In the meantime, email us at{" "}
        <a className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4" href="mailto:hello@hearts4hands.org">
          hello@hearts4hands.org
        </a>{" "}
        and we&apos;ll take it from there.
      </p>
    </Alert>
  );
}
