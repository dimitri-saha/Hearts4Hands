import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Dashboard tile. `attention` is for queues with work waiting in them — it
 * says so in words as well as colour, so the emphasis survives greyscale.
 */
export function AdminStat({
  label,
  value,
  hint,
  href,
  attention = false,
  className,
}: {
  label: ReactNode;
  value: number | string;
  /** Small line under the number — "waiting for you", "live on the site". */
  hint?: ReactNode;
  /** Makes the whole tile a link to the page that clears this queue. */
  href?: string;
  /** Highlight the tile because something needs doing. */
  attention?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <p className="font-display text-sm font-bold text-brown-mid">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-4xl leading-none font-bold tabular-nums",
          attention ? "text-red-deep" : "text-berry",
        )}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint ? <p className="mt-1.5 text-sm text-brown-mid">{hint}</p> : null}
    </>
  );

  const base = cn(
    "block rounded-xl border bg-paper p-4 no-underline transition-colors",
    attention ? "border-red/60 bg-red/5" : "border-brown-faint",
    href && (attention ? "hover:bg-red/10" : "hover:border-brown-soft hover:bg-cream/60"),
    className,
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}
