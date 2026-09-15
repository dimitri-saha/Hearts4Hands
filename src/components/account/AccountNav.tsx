"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { signOutVolunteer } from "@/app/actions/account";

const items = [
  { href: "/account", label: "Overview" },
  { href: "/account/hours", label: "Log hours" },
  { href: "/account/groups", label: "My club" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Your account"
      className="flex flex-wrap items-center gap-2 border-b-2 border-dashed border-brown-faint pb-4"
    >
      {items.map((item) => {
        const active =
          item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rough-pill border-2 px-4 py-1.5 font-display text-sm font-bold transition-colors",
              active
                ? "border-brown bg-red text-paper"
                : "border-brown/40 bg-paper text-brown hover:border-red hover:bg-blush",
            )}
          >
            {item.label}
          </Link>
        );
      })}

      <form action={signOutVolunteer} className="ml-auto">
        <button
          type="submit"
          className="rough-pill border-2 border-brown-faint bg-paper px-4 py-1.5 font-display text-sm font-bold text-brown-mid transition-colors hover:border-red hover:text-berry"
        >
          Sign out
        </button>
      </form>
    </nav>
  );
}
