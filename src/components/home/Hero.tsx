import Link from "next/link";

import { Bear } from "@/components/illustrations/Bear";
import { Cloud, CurvedArrow, Sparkle, Star, Tape } from "@/components/illustrations/Doodles";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

/**
 * Home hero.
 *
 * Two columns on desktop, one stacked column at 375px — the bear keeps a
 * generous size on small screens rather than shrinking to a thumbnail, because
 * it is the first thing that tells you what kind of place this is.
 */
export function Hero() {
  return (
    <Section tone="blush" className="overflow-hidden pt-10 pb-14 sm:pt-14">
      {/* margin doodles */}
      <Cloud className="pointer-events-none absolute -top-5 right-0 h-9 w-14 opacity-70 sm:right-6 sm:h-14 sm:w-24" />
      <Sparkle className="pointer-events-none absolute top-6 left-0 hidden h-8 w-8 opacity-80 sm:block" />
      <Sparkle
        color="#e79a93"
        className="pointer-events-none absolute bottom-16 left-2 hidden h-6 w-6 opacity-70 lg:block"
      />

      <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="max-w-xl text-center md:text-left">
          <p className="font-hand text-lg tracking-[0.16em] text-red-deep uppercase">
            Creativity is a form of courage
          </p>

          <h1 className="mt-2 text-4xl sm:text-5xl lg:text-[3.6rem]">
            Make something for someone who needs it
          </h1>

          <p className="mt-5 text-lg text-brown-mid sm:text-xl">
            We are students who draw cards for kids in hospitals, then mail them out. We publish
            stories from people living with cancer and the people caring for them. And the money we
            raise buys paper, postage, and cancer research.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Button href="/volunteer" size="lg">
              Start volunteering
            </Button>
            <Button href="/donate" variant="outline" size="lg" alt>
              Donate
            </Button>
          </div>

          <p className="mt-5">
            <Link
              href="/blog"
              className="font-hand text-lg text-brown-mid underline decoration-pink-deep decoration-2 underline-offset-4 hover:text-red-deep"
            >
              Or read a story first
            </Link>
          </p>

          <div className="relative mx-auto mt-9 inline-block max-w-sm rough-3 border-[2.5px] border-brown-faint bg-paper/80 px-5 py-3 md:mx-0">
            <Tape className="pointer-events-none absolute -top-3 -left-4 h-6 w-20 -rotate-12" />
            <CurvedArrow
              color="#e79a93"
              className="pointer-events-none absolute -top-9 -right-8 hidden h-12 w-14 rotate-180 lg:block"
            />
            <p className="font-hand text-lg text-brown-mid">
              No experience needed. Paper and something colorful is plenty.
            </p>
          </div>
        </div>

        <div className="relative shrink-0 px-10 sm:px-6">
          <Star
            color="#f2c3bc"
            className="pointer-events-none absolute top-10 left-0 h-7 w-7 opacity-90 sm:-left-2"
          />
          <Sparkle
            color="#f2c14e"
            className="pointer-events-none absolute right-1 bottom-12 h-6 w-6 opacity-90 sm:-right-2"
          />
          <Bear
            title="The Hearts4Hands bear, waving"
            className="h-60 w-42 animate-float sm:h-72 sm:w-52 lg:h-[21rem] lg:w-60"
            style={{ ["--tilt" as string]: "-3deg" }}
          />
        </div>
      </div>
    </Section>
  );
}
