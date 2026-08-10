import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AdminCard } from "./AdminCard";
import { AdminEmpty } from "./AdminEmpty";

export type AdminColumn<T> = {
  /** Unique key for this column — also the React key for its cells. */
  key: string;
  /** Column heading. Also used as the field label in the stacked mobile view. */
  header: ReactNode;
  /** Cell contents for one row. */
  cell: (row: T, index: number) => ReactNode;
  /** Right-align numbers and action buttons. */
  align?: "left" | "right";
  /** Extra classes for the `<td>` / mobile value. */
  className?: string;
  /** Skip the label in the stacked mobile view (actions, avatars, badges). */
  hideLabelOnMobile?: boolean;
  /** Leave this column out of the stacked mobile view entirely. */
  hideOnMobile?: boolean;
};

/**
 * Responsive record list.
 *
 * A real `<table>` from `md` up — column headers, scannable rows, the thing a
 * reviewer actually wants on a laptop. Below `md` the same data stacks into
 * label/value cards, because a five-column table on a 375px phone is a
 * horizontal-scroll trap, not a table.
 */
export function AdminTable<T>({
  columns,
  rows,
  getKey,
  caption,
  empty,
  className,
}: {
  columns: AdminColumn<T>[];
  rows: T[];
  /** Stable key per row — the record id. */
  getKey: (row: T, index: number) => string;
  /** Screen-reader description of the table. */
  caption?: string;
  /** Shown instead of the table when `rows` is empty. */
  empty?: ReactNode;
  className?: string;
}) {
  if (rows.length === 0) {
    return <>{empty ?? <AdminEmpty title="Nothing here yet." />}</>;
  }

  return (
    <div className={className}>
      {/* --- md and up: a real table ------------------------------------- */}
      <div className="hidden overflow-x-auto rounded-xl border border-brown-faint bg-paper md:block">
        <table className="w-full border-collapse text-left text-[0.95rem]">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-brown-faint bg-cream/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-2.5 font-display text-sm font-bold text-brown-mid",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={getKey(row, i)}
                className="border-b border-brown-faint/60 last:border-b-0 hover:bg-cream/40"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 align-top",
                      col.align === "right" && "text-right",
                      col.className,
                    )}
                  >
                    {col.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- below md: stacked cards -------------------------------------- */}
      <ul className="flex list-none flex-col gap-3 md:hidden">
        {rows.map((row, i) => (
          <AdminCard as="li" key={getKey(row, i)}>
            <dl className="flex flex-col gap-3">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => {
                  const value = col.cell(row, i);
                  if (col.hideLabelOnMobile) {
                    return (
                      <div key={col.key} className={col.className}>
                        <dt className="sr-only">
                          {typeof col.header === "string" ? col.header : col.key}
                        </dt>
                        <dd>{value}</dd>
                      </div>
                    );
                  }
                  return (
                    <div key={col.key} className={cn("flex flex-col gap-0.5", col.className)}>
                      <dt className="font-display text-xs tracking-wide text-brown-soft uppercase">
                        {col.header}
                      </dt>
                      <dd className="text-[0.95rem] text-brown">{value}</dd>
                    </div>
                  );
                })}
            </dl>
          </AdminCard>
        ))}
      </ul>
    </div>
  );
}

/**
 * Vertical stack of cards, for records that don't fit a grid — a message with
 * a paragraph of body text, a story submission with an excerpt and buttons.
 * Same rhythm as `AdminTable`'s mobile view, at every width.
 */
export function AdminList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ul className={cn("flex list-none flex-col gap-4", className)}>{children}</ul>;
}

/** One row of an `AdminList`. */
export function AdminListItem({
  title,
  meta,
  badge,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  /** Small grey line under the title — author, date, email. */
  meta?: ReactNode;
  /** Usually a `<StatusBadge>`. */
  badge?: ReactNode;
  /** Buttons/forms for this record. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <AdminCard as="li" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="font-display text-base leading-snug font-bold text-berry">{title}</h3>
          {meta ? <p className="mt-0.5 text-sm text-brown-mid">{meta}</p> : null}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      {children ? <div className="mt-3 text-[0.95rem] text-brown">{children}</div> : null}

      {actions ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brown-faint/70 pt-3">
          {actions}
        </div>
      ) : null}
    </AdminCard>
  );
}
