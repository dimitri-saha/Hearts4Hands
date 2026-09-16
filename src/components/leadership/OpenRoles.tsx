import { CurvedArrow } from "@/components/illustrations/Doodles";
import { Card } from "@/components/ui/Card";
import { leadershipRoles } from "@/lib/site";

/**
 * The application cards.
 *
 * Each card is covered by a real, focusable `<a>` rather than an `aria-hidden`
 * overlay — same rule as `LinkCard`, which this can't reuse because these links
 * leave the site and need `target`/`rel` that `LinkCard` doesn't pass through.
 */
export function OpenRoles() {
  return (
    <ul className="mt-10 grid list-none gap-6 md:grid-cols-2">
      {leadershipRoles.map((role, index) => (
        <li key={role.url} className="h-full">
          <Card
            tone={index % 2 === 0 ? "paper" : "blush"}
            seed={role.title}
            interactive
            className="group flex h-full flex-col px-6 py-6 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-4 focus-within:outline-dashed focus-within:outline-red"
          >
            <a
              href={role.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-10 rounded-[inherit] focus:outline-none"
            >
              <span className="sr-only">Apply to be {role.title} — opens a Google Form</span>
            </a>

            <h3 className="text-xl sm:text-2xl">{role.title}</h3>
            <p className="mt-2 text-brown-mid">{role.blurb}</p>

            <p className="mt-auto flex items-center gap-2 pt-5 font-display font-bold text-red-deep">
              <span className="underline decoration-pink-deep decoration-2 underline-offset-4 group-hover:decoration-red">
                Apply on Google Forms
              </span>
              <CurvedArrow
                color="#b03a4e"
                className="h-4 w-5 shrink-0 -rotate-45 transition-transform group-hover:translate-x-1"
              />
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
