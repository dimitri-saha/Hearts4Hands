import { Heart } from "@/components/illustrations/Hearts";
import { Tape } from "@/components/illustrations/Doodles";
import { Card } from "@/components/ui/Card";
import { milestones } from "@/lib/site";

/**
 * Milestones as a crayon line with heart dots and taped-down cards. The line is
 * a dashed border rather than an SVG so it stretches to whatever height the
 * cards end up at.
 */
export function Timeline() {
  return (
    <ol className="relative mt-10 ml-3 space-y-8 border-l-[3px] border-dashed border-pink-deep pl-7 sm:ml-6 sm:pl-10">
      {milestones.map((milestone, index) => (
        <li key={milestone.year} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-6 -left-[2.4rem] flex h-5 w-5 items-center justify-center sm:-left-[3.22rem]"
          >
            <Heart className="h-5 w-5" fill={index === 1 ? "#e79a93" : "#d24a5e"} shine={false} />
          </span>

          <Card
            tone={index % 2 === 0 ? "paper" : "cream"}
            seed={milestone.title}
            tilt
            className="px-6 py-6"
          >
            <Tape
              className="pointer-events-none absolute -top-3 right-6 h-5 w-16 rotate-6"
              color={index % 2 === 0 ? "#f2c3bc" : "#e8c39e"}
            />
            <p className="font-hand text-lg tracking-wide text-red-deep uppercase">
              {milestone.year}
            </p>
            <h3 className="mt-1 text-xl sm:text-2xl">{milestone.title}</h3>
            <p className="mt-2 text-brown-mid">{milestone.body}</p>
          </Card>
        </li>
      ))}
    </ol>
  );
}
