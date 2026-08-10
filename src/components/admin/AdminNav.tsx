"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type AdminNavItem = {
  href: string;
  label: string;
  /** Renders above a divider, away from the section links (e.g. "View site"). */
  separated?: boolean;
};

/**
 * Admin section nav.
 *
 * A client component for exactly one reason: `aria-current="page"` needs the
 * current pathname, and a layout can't read it on the server. No state, no
 * effects — just a link list.
 *
 * One `<nav>` at every width. Below `lg` the list is a horizontal scroll row
 * across the top; from `lg` it becomes a sticky left column.
 */
export function AdminNav({
  items,
  className,
}: {
  items: AdminNavItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className={className}>
      <ul
        className={cn(
          "-mx-1 flex list-none items-center gap-1.5 overflow-x-auto px-1 pb-1",
          "lg:mx-0 lg:sticky lg:top-6 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0",
        )}
      >
        {items.map((item) => {
          // "/admin" must only match exactly, or every child page lights it up.
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li
              key={item.href}
              className={cn(
                "shrink-0 lg:shrink",
                item.separated && "lg:mt-3 lg:border-t lg:border-brown-faint lg:pt-3",
              )}
            >
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block rounded-lg border px-3 py-2 font-display text-[0.95rem] font-bold",
                  "whitespace-nowrap no-underline transition-colors",
                  isActive
                    ? "border-berry bg-berry text-paper"
                    : "border-transparent text-brown-mid hover:bg-cream hover:text-berry",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
