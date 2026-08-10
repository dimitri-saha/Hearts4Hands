import { a11y, ink, type IllustrationProps } from "@/components/illustrations/types";

/**
 * Hand-drawn ✗ — the counterpart to `CheckMark`, for the "please skip" list.
 * Same crayon language: two chunky round-capped strokes through the tight
 * wobble filter so it reads as drawn, not typeset.
 */
export function CrossMark({
  color = ink.redDeep,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#crayon-tight)"
      >
        <path d="M9 10 L 31 30" />
        <path d="M31 9 L 10 31" />
      </g>
    </svg>
  );
}
