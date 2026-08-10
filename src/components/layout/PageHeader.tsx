import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { TornEdge } from "@/components/illustrations/Dividers";
import { Sparkle } from "@/components/illustrations/Doodles";
import { sectionHex, type SectionTone } from "@/components/ui/Section";

/**
 * Standard interior-page header band.
 *
 * Every page except the home page opens with this, so the site has one
 * consistent entry rhythm: eyebrow, big title, one warm sentence, an
 * illustration on the right, and a torn edge into the content below.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  illustration,
  tone = "blush",
  /** Background colour of the section immediately below — for the torn edge. */
  nextTone = "paper",
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  illustration?: ReactNode;
  tone?: SectionTone;
  nextTone?: SectionTone;
  children?: ReactNode;
  className?: string;
}) {
  const bg = {
    paper: "bg-paper",
    cream: "bg-cream grain-soft",
    blush: "bg-blush grain-soft",
    kraft: "bg-kraft grain-soft",
    pink: "bg-blush-deep grain-soft",
  }[tone];

  return (
    <div className={cn("relative", className)}>
      <div className={cn("relative overflow-hidden px-5 pt-12 pb-14 sm:px-8 sm:pt-16", bg)}>
        {/* corner doodles */}
        <Sparkle className="pointer-events-none absolute top-8 right-[12%] hidden h-7 w-7 opacity-70 sm:block" />
        <Sparkle
          color="#e79a93"
          className="pointer-events-none absolute bottom-10 left-[8%] hidden h-5 w-5 opacity-60 md:block"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl text-center md:text-left">
            {eyebrow ? (
              <p className="font-hand text-lg tracking-[0.16em] text-red-deep uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-1 text-4xl sm:text-5xl lg:text-[3.4rem]">{title}</h1>
            {intro ? (
              <p className="mt-5 text-lg text-brown-mid sm:text-xl">{intro}</p>
            ) : null}
            {children ? <div className="mt-7">{children}</div> : null}
          </div>

          {illustration ? (
            <div className="shrink-0 animate-float" style={{ ["--tilt" as string]: "-3deg" }}>
              {illustration}
            </div>
          ) : null}
        </div>
      </div>

      <TornEdge color={sectionHex[nextTone]} from={sectionHex[tone]} className="-mt-px" />
    </div>
  );
}
