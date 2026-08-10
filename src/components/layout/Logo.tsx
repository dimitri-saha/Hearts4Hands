import Link from "next/link";

import { cn } from "@/lib/utils";
import { BearHead } from "@/components/illustrations/Bear";

/**
 * Header wordmark. The bear is redrawn as SVG rather than using LOGO.jpeg so
 * it sits on any background, stays crisp, and can animate on hover.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5 no-underline", className)}
      aria-label="Hearts4Hands — home"
    >
      <BearHead className="h-11 w-12 shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
      {showWordmark ? (
        <span className="font-hand text-2xl leading-none tracking-tight text-red-deep sm:text-[1.7rem]">
          he<span className="uppercase">art</span>s
          <span className="text-red">4</span>h<span className="uppercase">a</span>nds
        </span>
      ) : null}
    </Link>
  );
}
