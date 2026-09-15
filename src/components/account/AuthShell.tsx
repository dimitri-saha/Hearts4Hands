import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { BearHead } from "@/components/illustrations/Bear";
import { Section } from "@/components/ui/Section";

/**
 * Shared frame for the four auth screens.
 *
 * Narrow and quiet on purpose — these are the only pages on the site with a
 * single job, and the usual illustration-heavy treatment would get in the way
 * of someone just trying to get in.
 */
export function AuthShell({
  eyebrow,
  title,
  intro,
  children,
  footer,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Section tone="blush" width="prose" className={cn("py-14 sm:py-20", className)}>
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <BearHead className="h-14 w-16" />
        {eyebrow ? (
          <p className="mt-3 font-hand text-lg tracking-[0.16em] text-red-deep uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-3xl sm:text-4xl">{title}</h1>
        {intro ? <p className="mt-3 text-brown-mid">{intro}</p> : null}
      </div>

      <Card tone="paper" seed={title} className="mx-auto mt-8 max-w-lg px-5 py-7 sm:px-8 sm:py-9">
        {children}
      </Card>

      {footer ? (
        <div className="mx-auto mt-6 max-w-lg text-center text-brown-mid">{footer}</div>
      ) : null}
    </Section>
  );
}
