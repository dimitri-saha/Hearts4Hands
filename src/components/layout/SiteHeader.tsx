"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { mainNav } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";

/**
 * `signedIn` is resolved by the server layout and passed down — this is a
 * client component (mobile drawer, active-link state) so it can't read the
 * session itself.
 */
export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the mobile drawer whenever the route changes. Adjusting state during
  // render (rather than in an effect) means the drawer is already closed on the
  // first paint of the new route, with no flash of the open menu.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b-[3px] border-brown/85 bg-paper/95 backdrop-blur-sm transition-shadow",
        scrolled && "shadow-[0_4px_0_0_rgba(74,52,42,0.10)]",
      )}
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rough-pill px-4 py-2 font-display text-[1.05rem] font-bold transition-colors",
                isActive(item.href)
                  ? "bg-blush text-red-deep"
                  : "text-brown hover:bg-blush/70 hover:text-red-deep",
              )}
            >
              {item.label}
              {isActive(item.href) ? (
                <svg
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-0.5 h-1.5"
                >
                  <path
                    d="M2 5 C 30 1 70 1 98 4"
                    fill="none"
                    stroke="#d24a5e"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={signedIn ? "/account" : "/login"}
            className="hidden rough-pill px-3 py-2 font-display text-[1.02rem] font-bold text-brown transition-colors hover:bg-blush/70 hover:text-red-deep lg:inline-flex"
          >
            {signedIn ? "My account" : "Sign in"}
          </Link>
          <Button href="/donate" size="sm" className="hidden sm:inline-flex">
            Donate
            <HeartGlyph />
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="rough-pill border-[2.5px] border-brown bg-paper p-2.5 text-brown lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              {open ? (
                <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 5 L 19 19" />
                  <path d="M19 5 L 5 19" />
                </g>
              ) : (
                <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M3.5 7 C 10 5.5 16 8 20.5 6.5" />
                  <path d="M3.5 12 C 10 10.5 16 13.5 20.5 12" />
                  <path d="M3.5 17.5 C 10 16 16 18.5 20.5 17" />
                </g>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t-[3px] border-brown/80 bg-cream lg:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5">
          {[{ href: "/", label: "Home" }, ...mainNav, { href: "/donate", label: "Donate" }].map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rough-2 border-[2.5px] px-4 py-3 font-display text-lg font-bold transition-colors",
                  isActive(item.href)
                    ? "border-red bg-blush text-red-deep"
                    : "border-brown/40 bg-paper text-brown hover:border-red",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
          <Link
            href={signedIn ? "/account" : "/login"}
            className="rough-2 border-[2.5px] border-brown/40 bg-paper px-4 py-3 font-display text-lg font-bold text-brown hover:border-red"
          >
            {signedIn ? "My account" : "Sign in"}
          </Link>
          <Link
            href="/volunteer"
            className="mt-1 rough-pill border-[2.5px] border-brown bg-red px-4 py-3 text-center font-display text-lg font-bold text-paper sticker-shadow"
          >
            Start volunteering
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeartGlyph() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M50 87 C 21 66 6 49 6 32.5 C 6 16.5 18 6 30.5 6 C 39.5 6 46.5 11.5 50 18.5 C 53.5 11.5 60.5 6 69.5 6 C 82 6 94 16.5 94 32.5 C 94 49 79 66 50 87 Z"
        fill="currentColor"
      />
    </svg>
  );
}
