import { cn } from "@/lib/utils";

/**
 * The three review states every submission moves through, plus a few extra
 * values the stories and messages pages need. Anything assignable to
 * "pending" | "approved" | "rejected" is always valid.
 */
export type AdminStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "draft"
  | "published"
  | "handled";

const styles: Record<AdminStatus, { label: string; mark: string; className: string }> = {
  pending: {
    label: "Pending",
    mark: "•",
    className: "border-sun bg-sun/20 text-brown",
  },
  approved: {
    label: "Approved",
    mark: "✓",
    className: "border-leaf bg-leaf/18 text-brown",
  },
  rejected: {
    label: "Not approved",
    mark: "×",
    className: "border-red bg-red/10 text-berry",
  },
  draft: {
    label: "Draft",
    mark: "•",
    className: "border-brown-soft bg-kraft text-brown",
  },
  published: {
    label: "Published",
    mark: "✓",
    className: "border-sky bg-sky/25 text-brown",
  },
  handled: {
    label: "Handled",
    mark: "✓",
    className: "border-leaf bg-leaf/18 text-brown",
  },
};

/**
 * Status pill. The word is always present — colour is a second signal, never
 * the only one — and a small glyph carries it through for anyone who prints
 * the page or reads it in greyscale.
 */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: AdminStatus;
  /** Override the default wording (e.g. "Needs a reply"). */
  label?: string;
  className?: string;
}) {
  const style = styles[status] ?? styles.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "font-display text-sm leading-6 font-bold whitespace-nowrap",
        style.className,
        className,
      )}
    >
      <span aria-hidden="true" className="text-xs leading-none">
        {style.mark}
      </span>
      {label ?? style.label}
    </span>
  );
}
