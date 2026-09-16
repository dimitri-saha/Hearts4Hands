import Image from "next/image";

import { Monogram } from "@/components/ui/Monogram";
import { Button } from "@/components/ui/Button";
import { leadershipTeam } from "@/lib/site";

/**
 * A face pile and a way through to the roster.
 *
 * The roster itself lives on /leadership so there is one place to keep it
 * current — this page used to carry its own copy in a `team` constant, and two
 * lists of the same people only ever drift apart.
 *
 * The faces are decorative on purpose — the roster page names everyone, and
 * repeating the names here would only make a screen reader read them twice.
 * The button carries the meaning.
 */
export function TeamPreview() {
  const faces = leadershipTeam.slice(0, 5);

  return (
    <div className="mt-8 flex flex-col items-center gap-7">
      <ul className="flex list-none justify-center -space-x-5">
        {faces.map((person) => (
          <li key={person.name}>
            <span className="relative block h-18 w-18 overflow-hidden rough-blob border-[2.5px] border-brown bg-cream sm:h-22 sm:w-22">
              {person.photo ? (
                <Image src={person.photo} alt="" fill sizes="88px" className="object-cover" />
              ) : (
                <Monogram name={person.name} size="sm" />
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-3">
        <Button href="/leadership" size="lg">
          Meet the team
        </Button>
        <p className="max-w-md font-hand text-lg text-brown-mid">
          Applications for chapter presidents, editors, and more are open on the same page.
        </p>
      </div>
    </div>
  );
}
