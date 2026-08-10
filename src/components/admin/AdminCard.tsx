import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The admin equivalent of the public `Card`.
 *
 * Deliberately plainer: a light border, a small honest radius, and a white
 * background. The crayon vocabulary belongs on the public site; this is a work
 * tool, and an editor scanning forty submissions does not need forty wobbly
 * silhouettes.
 */
export function AdminCard({
  children,
  title,
  description,
  actions,
  className,
  bodyClassName,
  padded = true,
  as: Tag = "div",
}: {
  children?: ReactNode;
  /** Optional heading rendered above the body. */
  title?: ReactNode;
  /** Optional one-line note under the title. */
  description?: ReactNode;
  /** Buttons or links pinned to the top-right of the card. */
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Set false when the child supplies its own padding (e.g. a table). */
  padded?: boolean;
  as?: "div" | "section" | "article" | "li";
}) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <Tag
      className={cn(
        "rounded-xl border border-brown-faint bg-paper shadow-[0_1px_0_0_rgba(74,52,42,0.04)]",
        className,
      )}
    >
      {hasHeader ? (
        <div
          className={cn(
            "flex flex-wrap items-start justify-between gap-3 border-b border-brown-faint/70",
            padded ? "px-4 py-3 sm:px-5" : "px-4 py-3",
          )}
        >
          <div className="min-w-0">
            {title ? (
              <h2 className="font-display text-lg leading-tight font-bold text-berry">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-sm text-brown-mid">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      {children ? (
        <div className={cn(padded && "p-4 sm:p-5", bodyClassName)}>{children}</div>
      ) : null}
    </Tag>
  );
}

/**
 * Small labelled value, for the stacked mobile rows and detail panels.
 * `<dt>`/`<dd>` so screen readers keep the label attached to the value.
 */
export function AdminDetail({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <dt className="font-display text-xs tracking-wide text-brown-soft uppercase">{label}</dt>
      <dd className="text-[0.95rem] text-brown">{children}</dd>
    </div>
  );
}
