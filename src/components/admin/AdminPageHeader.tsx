import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Top of every admin page: the title, one explanatory line, an optional count
 * badge, and a slot for page-level actions (filters, "add" buttons).
 */
export function AdminPageHeader({
  title,
  description,
  count,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Shown as a badge beside the title — usually "how many are on this page". */
  count?: number;
  /** Page-level actions, rendered top-right (wraps under the title on mobile). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-3 border-b-2 border-brown-faint pb-4",
        "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-center gap-2 font-display text-2xl leading-tight font-bold text-berry sm:text-3xl">
          {title}
          {typeof count === "number" ? (
            <span className="rounded-full border border-brown-faint bg-cream px-2.5 py-0.5 font-body text-sm font-bold text-brown-mid tabular-nums">
              {count.toLocaleString()}
            </span>
          ) : null}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[0.95rem] text-brown-mid">{description}</p>
        ) : null}
      </div>

      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </header>
  );
}
