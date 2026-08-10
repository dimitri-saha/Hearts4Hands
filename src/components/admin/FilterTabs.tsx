import Link from "next/link";

import { cn } from "@/lib/utils";

export type FilterOption = {
  /** Query value. Use "" for the unfiltered "All" tab. */
  value: string;
  label: string;
  /** Optional badge — how many records match this filter. */
  count?: number;
};

/**
 * Link-based filters.
 *
 * Deliberately not a client component: each tab is a plain link to the same
 * page with a different query string, so filtering survives a refresh, works
 * without JavaScript, and can be bookmarked or shared between reviewers.
 */
export function FilterTabs({
  options,
  active,
  basePath,
  param = "status",
  label = "Filter",
  className,
}: {
  options: FilterOption[];
  /** The currently applied value ("" when unfiltered). */
  active: string;
  /** Page these tabs live on, e.g. "/admin/volunteers". */
  basePath: string;
  /** Query parameter name. Defaults to "status". */
  param?: string;
  /** Accessible name for the group. */
  label?: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn("-mx-1 overflow-x-auto px-1 pb-1", className)}
    >
      <ul className="flex list-none items-center gap-1.5">
        {options.map((option) => {
          const isActive = option.value === active;
          const href = option.value ? `${basePath}?${param}=${encodeURIComponent(option.value)}` : basePath;

          return (
            <li key={option.value || "all"} className="shrink-0">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
                  "font-display text-sm font-bold whitespace-nowrap no-underline transition-colors",
                  isActive
                    ? "border-berry bg-berry text-paper"
                    : "border-brown-faint bg-paper text-brown-mid hover:border-brown-soft hover:bg-cream",
                )}
              >
                {option.label}
                {typeof option.count === "number" ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      isActive ? "bg-paper/25 text-paper" : "bg-cream text-brown-soft",
                    )}
                  >
                    {option.count.toLocaleString()}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
