import Link from "next/link";

import { Sparkle } from "@/components/illustrations/Doodles";
import { PawHeart } from "@/components/illustrations/Hearts";
import { Card } from "@/components/ui/Card";
import { team } from "@/lib/site";

function isOpenSeat(name: string) {
  return name.trim().toLowerCase() === "open seat";
}

/**
 * Team grid. Two entries in `site.ts` are deliberately unfilled roles, so they
 * render as dashed "this could be you" cards rather than as people.
 */
export function Team() {
  return (
    <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((member, index) => {
        const open = isOpenSeat(member.name);
        const key = `${member.name}-${member.role}`;

        if (open) {
          return (
            <li key={key} className="h-full">
              <div className="flex h-full flex-col items-center rough-3 border-[2.5px] border-dashed border-brown-faint bg-cream/60 px-6 py-7 text-center">
                <span className="flex h-16 w-16 items-center justify-center rough-blob border-[2.5px] border-dashed border-brown-soft bg-paper">
                  <Sparkle className="h-7 w-7 opacity-80" />
                </span>
                <p className="mt-4 font-hand text-lg text-brown-soft">Open seat</p>
                <h3 className="mt-1 text-xl">{member.role}</h3>
                <p className="mt-2 text-brown-mid">{member.bio}</p>
                <Link
                  href="/contact"
                  className="mt-auto pt-4 font-display font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4 hover:text-berry"
                >
                  Put your hand up
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </li>
          );
        }

        return (
          <li key={key} className="h-full">
            <Card
              tone={index % 2 === 0 ? "paper" : "blush"}
              seed={key}
              className="flex h-full flex-col items-center px-6 py-7 text-center"
            >
              <span className="relative flex h-16 w-16 items-center justify-center rough-blob border-[2.5px] border-brown bg-pink">
                <span className="font-display text-2xl font-bold text-berry">
                  {member.name.charAt(0)}
                </span>
                <PawHeart className="absolute -right-3 -bottom-2 h-7 w-7" />
              </span>
              <h3 className="mt-4 text-xl">{member.name}</h3>
              <p className="mt-1 font-hand text-lg text-red-deep">{member.role}</p>
              <p className="mt-2 text-brown-mid">{member.bio}</p>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
