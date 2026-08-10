import { cn } from "@/lib/utils";
import { ink } from "./types";

/**
 * Section dividers.
 *
 * Each renders a full-bleed SVG shaped to the *next* section's background
 * colour, so bands of colour meet on a hand-torn or scalloped edge rather than
 * a ruled line. Pass the incoming section's fill as `color`.
 */

type DividerProps = {
  /** Hex fill of the section this divider leads into. */
  color?: string;
  /**
   * Hex background of the section this divider comes *out of*.
   *
   * The shape only paints the incoming colour; the area above it is
   * transparent. Without `from`, that gap shows the page background, which
   * reads as a stripe whenever the outgoing band isn't paper.
   */
  from?: string;
  className?: string;
  /** Point the shape upward instead (use at the bottom of a band). */
  flip?: boolean;
};

const base = "block w-full";

/** Torn-paper edge — the workhorse. */
export function TornEdge({ color = ink.paper, from, className, flip }: DividerProps) {
  return (
    <svg
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={from ? { backgroundColor: from } : undefined}
      className={cn(base, "h-6 sm:h-10", flip && "rotate-180", className)}
    >
      <path
        d="M0 30 C 60 18 96 40 156 34 C 216 28 240 12 306 18 C 372 24 396 44 462 38 C 528 32 552 14 618 20 C 684 26 714 44 780 40 C 846 36 870 16 936 20 C 1002 24 1032 42 1098 38 C 1164 34 1188 14 1254 18 C 1320 22 1350 40 1410 32 C 1424 30 1434 28 1440 26 L 1440 48 L 0 48 Z"
        fill={color}
      />
    </svg>
  );
}

/** Scalloped edge — softer, used above warm/blush bands. */
export function ScallopEdge({ color = ink.paper, from, className, flip }: DividerProps) {
  const scallops = Array.from({ length: 24 }, (_, i) => {
    const w = 60;
    const x = i * w;
    return `M${x} 40 a ${w / 2} ${w / 2.6} 0 0 1 ${w} 0`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 1440 44"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={from ? { backgroundColor: from } : undefined}
      className={cn(base, "h-5 sm:h-8", flip && "rotate-180", className)}
    >
      <path d={`${scallops} L1440 44 L0 44 Z`} fill={color} />
    </svg>
  );
}

/** Gentle hand-drawn wave. */
export function WaveEdge({ color = ink.paper, from, className, flip }: DividerProps) {
  return (
    <svg
      viewBox="0 0 1440 56"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={from ? { backgroundColor: from } : undefined}
      className={cn(base, "h-6 sm:h-10", flip && "rotate-180", className)}
    >
      <path
        d="M0 26 C 180 6 300 46 480 34 C 660 22 780 -4 960 12 C 1140 28 1260 48 1440 30 L 1440 56 L 0 56 Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Inline decorative rule: a crayon line with a heart in the middle. Sits
 * *within* a section rather than between two.
 */
export function HeartRule({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden="true">
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" className="h-3 w-24 sm:w-40">
        <path
          d="M2 6 C 50 2 120 10 198 5"
          fill="none"
          stroke={ink.pink}
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#crayon)"
        />
      </svg>
      <svg viewBox="0 0 100 100" className="h-4 w-4">
        <path
          d="M50 87 C 21 66 6 49 6 32.5 C 6 16.5 18 6 30.5 6 C 39.5 6 46.5 11.5 50 18.5 C 53.5 11.5 60.5 6 69.5 6 C 82 6 94 16.5 94 32.5 C 94 49 79 66 50 87 Z"
          fill={ink.pinkDeep}
          filter="url(#crayon-tight)"
        />
      </svg>
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" className="h-3 w-24 sm:w-40">
        <path
          d="M2 5 C 80 10 150 2 198 6"
          fill="none"
          stroke={ink.pink}
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#crayon)"
        />
      </svg>
    </div>
  );
}
