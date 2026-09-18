import Link from "next/link";

import { contact, footerNav, site } from "@/lib/site";
import { HeartTrio } from "@/components/illustrations/Hearts";
import { Button } from "@/components/ui/Button";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto">
      {/* `torn-top` clips the footer's own background rather than painting a
          shape over an assumed colour, so the tear works no matter which tone
          the page ends on. See CLAUDE.md §11. */}
      <div className="torn-top grain-soft bg-kraft px-5 pt-14 pb-8 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-hand text-3xl text-red-deep">
              he<span className="uppercase">art</span>s<span className="text-red">4</span>h
              <span className="uppercase">a</span>nds
            </p>
            <p className="mt-3 max-w-sm text-brown">
              Creativity is a form of courage. We make cards for patients in hospitals, share stories
              about cancer, and raise money for research.
            </p>
            <HeartTrio className="mt-4 h-12 w-20" />
            <Button href="/volunteer" size="sm" variant="outline" className="mt-4">
              Volunteer with us
            </Button>
          </div>

          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="font-display text-lg font-bold text-berry">{group.heading}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className="text-brown underline decoration-pink-deep decoration-2 underline-offset-4 transition-colors hover:text-red-deep hover:decoration-red"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mx-auto mt-10 w-full max-w-6xl border-t-2 border-dashed border-brown-soft/50 pt-6">
          <div className="flex flex-col gap-3 text-sm text-brown-mid sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.name}. Made by volunteers, mostly with crayons.
            </p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <li>
                <a
                  href={`mailto:${contact.general}`}
                  className="underline decoration-pink-deep decoration-2 underline-offset-4 hover:text-red-deep"
                >
                  {contact.general}
                </a>
              </li>
              <li>
                <Link
                  href="/blog/submit"
                  className="underline decoration-pink-deep decoration-2 underline-offset-4 hover:text-red-deep"
                >
                  Submit a story
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="underline decoration-brown-faint decoration-2 underline-offset-4 hover:text-red-deep"
                >
                  Editor sign-in
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
