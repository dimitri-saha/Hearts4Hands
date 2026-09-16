import Image from "next/image";

import { PawHeart } from "@/components/illustrations/Hearts";
import { Card } from "@/components/ui/Card";
import { Monogram } from "@/components/ui/Monogram";
import { leadershipTeam } from "@/lib/site";

/**
 * Current leadership.
 *
 * The portrait frame keeps a fixed 4:5 box whether it holds a real headshot or
 * a monogram, so a roster where only some people have sent a photo still lines
 * up.
 */
export function LeadershipRoster() {
  return (
    <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {leadershipTeam.map((person, index) => (
        <li key={`${person.name}-${person.role}`} className="h-full">
          <Card
            tone={index % 3 === 1 ? "blush" : "paper"}
            seed={person.name}
            className="flex h-full flex-col px-5 py-5"
          >
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rough-3 border-[2.5px] border-brown bg-cream">
                {person.photo ? (
                  <Image
                    src={person.photo}
                    alt={`${person.name}, ${person.role}`}
                    fill
                    sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                    quality={90}
                    className="object-cover"
                  />
                ) : (
                  <Monogram name={person.name} />
                )}
              </div>
              <PawHeart className="absolute -right-2 -bottom-3 h-8 w-8" />
            </div>

            <h3 className="mt-4 text-xl">{person.name}</h3>
            <p className="mt-0.5 font-hand text-lg text-red-deep">{person.role}</p>
            {person.location ? (
              <p className="mt-0.5 text-sm text-brown-soft">{person.location}</p>
            ) : null}
            {person.bio ? <p className="mt-2 text-brown-mid">{person.bio}</p> : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}
