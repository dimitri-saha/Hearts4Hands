import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { hashFraction } from "@/lib/utils";

const roughVariants = ["rough-1", "rough-2", "rough-3", "rough-4"] as const;

const tones = {
  paper: "bg-paper border-brown/70",
  cream: "bg-cream border-brown/70",
  blush: "bg-blush border-pink-deep",
  pink: "bg-pink/60 border-pink-deep",
  kraft: "bg-kraft border-brown/60",
  red: "bg-red text-paper border-brown",
} as const;

export type CardTone = keyof typeof tones;

/**
 * Paper card with a hand-cut edge.
 *
 * `seed` picks one of four radius variants deterministically, so a grid of
 * cards has four different silhouettes instead of one repeated shape — the
 * single cheapest thing that keeps a card grid from looking machine-made.
 */
export function Card({
  children,
  className,
  tone = "paper",
  seed,
  tilt = false,
  interactive = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  tone?: CardTone;
  seed?: string;
  tilt?: boolean;
  interactive?: boolean;
  as?: "div" | "article" | "li" | "section";
}) {
  const index = seed ? Math.floor(hashFraction(seed) * roughVariants.length) : 0;
  const rough = roughVariants[index % roughVariants.length];
  const tiltDeg = seed ? (hashFraction(`${seed}tilt`) - 0.5) * 1.6 : 0;

  return (
    <Tag
      className={cn(
        "relative border-[2.5px] sticker-shadow",
        rough,
        tones[tone],
        interactive &&
          "transition-transform duration-200 ease-out hover:-translate-y-1 hover:rotate-[-0.4deg] focus-within:-translate-y-1",
        className,
      )}
      style={tilt ? { transform: `rotate(${tiltDeg.toFixed(2)}deg)` } : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Card whose whole surface is a link.
 *
 * The overlay link is real and keyboard-focusable — an `aria-hidden` overlay
 * would make the card unreachable without a mouse. Pass `label` (usually the
 * post title) so the link has an accessible name; the visible focus ring is
 * drawn on the card via `focus-within`.
 *
 * Anything interactive *inside* the card needs `relative z-20` to sit above
 * the overlay.
 */
export function LinkCard({
  href,
  label,
  children,
  className,
  tone = "paper",
  seed,
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
  tone?: CardTone;
  seed?: string;
}) {
  return (
    <Card
      tone={tone}
      seed={seed}
      interactive
      className={cn(
        "group focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-4 focus-within:outline-dashed focus-within:outline-red",
        className,
      )}
    >
      <Link href={href} className="absolute inset-0 z-10 rounded-[inherit] focus:outline-none">
        <span className="sr-only">{label}</span>
      </Link>
      {children}
    </Card>
  );
}

/** Small rounded label — categories, statuses, counts. */
export function Tag({
  children,
  className,
  tone = "pink",
}: {
  children: ReactNode;
  className?: string;
  tone?: "pink" | "red" | "cream" | "leaf" | "brown";
}) {
  const toneClasses = {
    pink: "bg-blush text-berry border-pink-deep",
    red: "bg-red text-paper border-brown",
    cream: "bg-cream text-brown border-brown-faint",
    leaf: "bg-leaf/20 text-brown border-leaf",
    brown: "bg-kraft text-brown border-brown-soft",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rough-pill border-2 px-3 py-0.5",
        "font-hand text-sm leading-6 tracking-wide",
        toneClasses,
        className,
      )}
    >
      {children}
    </span>
  );
}
