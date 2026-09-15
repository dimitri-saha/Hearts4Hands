import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Header wordmark: the painted bear, then the hand-lettered name.
 *
 * The bear is the real brand artwork (a PNG) rather than the `BearHead` SVG.
 * Every file in `public/bears` has had its transparent padding trimmed off, so
 * the artwork fills its own box — drop an untrimmed 512x512 square into a 44px
 * slot and the bear renders tiny, floating away from the word beside it.
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
      {/* alt="" on purpose: the link above already carries the name, and a
          second copy would make screen readers announce it twice. */}
      <Image
        src="/bears/bear_sit.png"
        alt=""
        width={312}
        height={310}
        priority
        className="h-11 w-11 shrink-0 object-contain transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
      />
      {showWordmark ? (
        <span className="font-hand text-2xl leading-none tracking-tight text-red-deep sm:text-[1.7rem]">
          he<span className="uppercase">art</span>s
          <span className="text-red">4</span>h
          <span className="uppercase">a</span>nds
        </span>
      ) : null}
    </Link>
  );
}
