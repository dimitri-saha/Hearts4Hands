import type { ReactNode } from "react";

import { cn, hashFraction } from "@/lib/utils";
import { Card } from "./Card";

/**
 * A single impact number on a taped-down card. Tiles tilt slightly, seeded off
 * the label so the arrangement is stable between renders but never uniform.
 */
export function StatTile({
  value,
  label,
  hint,
  icon,
  tone = "paper",
  className,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "paper" | "cream" | "blush" | "pink";
  className?: string;
}) {
  const tilt = (hashFraction(label) - 0.5) * 2.6;

  return (
    <Card
      tone={tone}
      seed={label}
      className={cn("flex flex-col items-center gap-1 px-5 py-7 text-center", className)}
    >
      <div style={{ transform: `rotate(${tilt.toFixed(2)}deg)` }} className="flex flex-col items-center">
        {icon ? <div className="mb-2 flex h-12 items-end justify-center">{icon}</div> : null}
        <p className="font-display text-4xl leading-none font-bold text-red-deep sm:text-5xl">
          {value}
        </p>
        <p className="mt-2 font-hand text-lg text-brown">{label}</p>
        {hint ? <p className="mt-1 text-sm text-brown-soft">{hint}</p> : null}
      </div>
    </Card>
  );
}

/**
 * Hand-drawn progress bar. Rendered as a crayon-filled strip inside a wobbly
 * outline rather than a rounded rectangle with a gradient.
 */
export function ProgressBar({
  value,
  label,
  caption,
  color = "bg-red",
  className,
}: {
  /** 0–100. */
  value: number;
  label?: ReactNode;
  caption?: ReactNode;
  color?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? <div className="flex items-baseline justify-between gap-3">{label}</div> : null}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={typeof label === "string" ? label : "Progress"}
        className="relative h-7 w-full overflow-hidden rough-pill border-[2.5px] border-brown bg-paper"
      >
        <div
          className={cn("h-full rough-pill transition-[width] duration-700 ease-out", color)}
          style={{ width: `${pct}%` }}
        />
        {/* crayon hatching over the filled portion */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 opacity-25"
          style={{
            width: `${pct}%`,
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0 6px, rgba(255,252,248,.85) 6px 8px)",
          }}
        />
      </div>
      {caption ? <p className="text-sm text-brown-mid">{caption}</p> : null}
    </div>
  );
}

/**
 * Two-segment allocation bar for the materials-vs-research split (PRD §5.3).
 */
export function AllocationBar({
  materialsPct,
  researchPct,
  isProjected,
  className,
}: {
  materialsPct: number;
  researchPct: number;
  isProjected?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex h-9 w-full overflow-hidden rough-pill border-[2.5px] border-brown bg-paper">
        <div
          className="flex items-center justify-center bg-pink-deep transition-[width] duration-700"
          style={{ width: `${materialsPct}%` }}
        >
          {materialsPct >= 18 ? (
            <span className="font-display text-sm font-bold text-berry">{materialsPct}%</span>
          ) : null}
        </div>
        <div
          className="flex items-center justify-center bg-red transition-[width] duration-700"
          style={{ width: `${researchPct}%` }}
        >
          {researchPct >= 18 ? (
            <span className="font-display text-sm font-bold text-paper">{researchPct}%</span>
          ) : null}
        </div>
      </div>

      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <li className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[6px_8px_5px_9px] border-2 border-brown bg-pink-deep" />
          <span className="text-brown">
            <strong className="font-display text-berry">Materials</strong> — paper, envelopes, postage
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[8px_5px_9px_6px] border-2 border-brown bg-red" />
          <span className="text-brown">
            <strong className="font-display text-berry">Research</strong> — granted to cancer research
          </span>
        </li>
      </ul>

      {isProjected ? (
        <p className="font-hand text-base text-brown-soft">
          This is our planned split — the bar updates to the real numbers as donations come in.
        </p>
      ) : null}
    </div>
  );
}
