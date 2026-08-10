import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Underline } from "@/components/illustrations/Doodles";

const tones = {
  paper: "bg-paper",
  cream: "bg-cream grain-soft",
  blush: "bg-blush grain-soft",
  kraft: "bg-kraft grain-soft",
  pink: "bg-blush-deep grain-soft",
} as const;

export type SectionTone = keyof typeof tones;

/** Hex values matching `tones`, for handing to the divider components. */
export const sectionHex: Record<SectionTone, string> = {
  paper: "#fffcf8",
  cream: "#fbf1e6",
  blush: "#fbe8e4",
  kraft: "#f2e2cf",
  pink: "#f7d9d5",
};

export function Section({
  children,
  tone = "paper",
  className,
  containerClassName,
  id,
  width = "default",
}: {
  children: ReactNode;
  tone?: SectionTone;
  className?: string;
  containerClassName?: string;
  id?: string;
  width?: "default" | "wide" | "narrow" | "prose";
}) {
  const widths = {
    narrow: "max-w-3xl",
    prose: "max-w-2xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  }[width];

  return (
    <section
      id={id}
      className={cn("relative isolate px-5 py-16 sm:px-8 sm:py-20", tones[tone], className)}
    >
      <div className={cn("relative mx-auto w-full", widths, containerClassName)}>{children}</div>
    </section>
  );
}

/**
 * Section heading with an optional eyebrow and a hand-drawn underline.
 * The underline is absolutely positioned so it doesn't add to line height.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  level = 2,
  underlineColor,
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  level?: 1 | 2 | 3;
  underlineColor?: string;
  className?: string;
  id?: string;
}) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";
  const sizes = {
    1: "text-4xl sm:text-5xl lg:text-6xl",
    2: "text-3xl sm:text-4xl lg:text-[2.75rem]",
    3: "text-2xl sm:text-3xl",
  }[level];

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <p className="font-hand text-lg tracking-[0.14em] text-red-deep uppercase">{eyebrow}</p>
      ) : null}

      <div className="relative inline-block">
        <Tag id={id} className={cn(sizes, "relative z-10")}>
          {title}
        </Tag>
        <Underline
          color={underlineColor}
          className={cn(
            "absolute -bottom-2 h-3 w-[min(100%,18rem)]",
            align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
          )}
        />
      </div>

      {subtitle ? (
        <p
          className={cn(
            "mt-3 text-lg text-brown-mid",
            align === "center" ? "max-w-2xl" : "max-w-xl",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
