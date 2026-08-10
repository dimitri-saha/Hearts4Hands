import type { SVGProps } from "react";

export interface IllustrationProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /**
   * Accessible name. Omit for decorative art (the default) — the SVG is then
   * marked `aria-hidden` so screen readers skip it entirely.
   */
  title?: string;
}

/** Spreads the right a11y attributes based on whether a title was supplied. */
export function a11y(title?: string) {
  return title
    ? ({ role: "img", "aria-label": title } as const)
    : ({ "aria-hidden": true, focusable: false } as const);
}

/** Brand hex values, for use inside SVG attributes where CSS vars are awkward. */
export const ink = {
  brown: "#4a342a",
  brownMid: "#7a5a47",
  brownSoft: "#a78970",
  red: "#d24a5e",
  redDeep: "#b03a4e",
  berry: "#8d2a3d",
  pink: "#f2c3bc",
  pinkDeep: "#e79a93",
  blush: "#fbe8e4",
  paper: "#fffcf8",
  cream: "#fbf1e6",
  kraft: "#f2e2cf",
  tan: "#c79a6b",
  honey: "#e8c39e",
  leaf: "#7fa86a",
  sky: "#9cc4d8",
  sun: "#f2c14e",
} as const;
