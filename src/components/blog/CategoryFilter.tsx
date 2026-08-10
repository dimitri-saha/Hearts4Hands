import Link from "next/link";

import { blogCategories } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Category filter as plain links, not client state.
 *
 * `/blog` and `/blog?category=caregiving` are real, shareable URLs that work
 * with JavaScript switched off — which matters for an audience reading on
 * hospital wifi and borrowed devices.
 */
export function CategoryFilter({
  active,
  counts,
  total,
}: {
  active: string | null;
  counts: Record<string, number>;
  total: number;
}) {
  return (
    <nav aria-label="Filter stories by category">
      <ul className="flex flex-wrap justify-center gap-2.5">
        <FilterLink href="/blog" active={active === null} label="All stories" count={total} />
        {blogCategories.map((category) => (
          <FilterLink
            key={category.value}
            href={`/blog?category=${category.value}`}
            active={active === category.value}
            label={category.label}
            count={counts[category.value] ?? 0}
          />
        ))}
      </ul>
    </nav>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "inline-flex items-center gap-2 rough-pill border-[2.5px] px-4 py-1.5",
          "font-display text-sm font-bold transition-colors duration-150 sm:text-base",
          active
            ? "border-brown bg-red text-paper sticker-shadow"
            : "border-pink-deep bg-paper text-berry hover:border-red hover:bg-blush sticker-shadow-sm",
        )}
      >
        {label}
        <span
          className={cn(
            "font-hand text-sm tabular-nums",
            active ? "text-paper/85" : "text-brown-soft",
          )}
        >
          {count}
        </span>
      </Link>
    </li>
  );
}
