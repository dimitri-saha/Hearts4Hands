import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** "Nothing here" state. Quiet on purpose — an empty queue is good news. */
export function AdminEmpty({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  /** Optional action (e.g. a link that clears the current filter). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-brown-faint bg-cream/60 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="font-display text-lg font-bold text-berry">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-md text-[0.95rem] text-brown-mid">{description}</p>
      ) : null}
      {children ? <div className="mt-4 flex justify-center gap-2">{children}</div> : null}
    </div>
  );
}
