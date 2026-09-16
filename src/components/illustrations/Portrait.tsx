import { hashFraction } from "@/lib/utils";
import { a11y, ink, type IllustrationProps } from "./types";

/**
 * Illustrated stand-in for a headshot.
 *
 * Why not a photo placeholder service? The CSP in `next.config.ts` allows
 * images from `'self'` only, so anything pulled from an external host is
 * blocked with no visible error — the slot would just be empty. Drawing the
 * stand-in keeps it working offline, costs no request, and matches the rest of
 * the artwork instead of dropping a stock face into a crayon drawing.
 *
 * Features are picked deterministically from `seed` (use the person's name), so
 * a given person keeps the same face across renders and reloads, and a grid of
 * them doesn't repeat one silhouette.
 */

// A deliberately wide range, so a roster of stand-ins doesn't read as one
// default person repeated.
const skins = [
  "#f4ddc3",
  "#e8c39e",
  "#d2a273",
  "#b07c4c",
  "#8a5a34",
  "#5f3d26",
];
const hairs = [
  "#2e211a",
  "#4a342a",
  "#6b4630",
  "#8a5a34",
  "#a78970",
  "#c79a6b",
];
const shirts = [
  ink.pink,
  ink.sky,
  ink.leaf,
  ink.sun,
  ink.pinkDeep,
  ink.tan,
  ink.honey,
];

/** Perceived brightness of a #rrggbb string, 0-255. */
function luma(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
  );
}

const stroke = {
  stroke: ink.brown,
  strokeWidth: 3.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function Portrait({
  seed = "",
  title,
  ...props
}: IllustrationProps & { seed?: string }) {
  const pick = <T,>(list: readonly T[], salt: string) =>
    list[Math.floor(hashFraction(seed + salt) * list.length) % list.length];

  const skin = pick(skins, "skin");
  const shirt = pick(shirts, "shirt");

  // Hair and skin are picked independently, so the two can land on neighbouring
  // browns and the hair disappears into the head. Step along the list until
  // there's enough contrast to read as hair.
  let hairIndex =
    Math.floor(hashFraction(seed + "hair") * hairs.length) % hairs.length;
  for (
    let i = 0;
    i < hairs.length && Math.abs(luma(hairs[hairIndex]) - luma(skin)) < 42;
    i++
  ) {
    hairIndex = (hairIndex + 2) % hairs.length;
  }
  const hair = hairs[hairIndex];
  const style = Math.floor(hashFraction(seed + "style") * 4) % 4;

  return (
    <svg
      viewBox="0 0 100 100"
      filter="url(#crayon)"
      {...a11y(title)}
      {...props}
    >
      {/* shoulders, drawn first so the head overlaps them */}
      <path
        d="M 8 100 C 8 79 27 70 50 70 C 73 70 92 79 92 100 Z"
        fill={shirt}
        {...stroke}
      />
      {/* collar */}
      <path
        d="M 40 71 C 44 77 56 77 60 71"
        fill="none"
        {...stroke}
        strokeWidth={2.6}
      />

      {/* neck */}
      <path
        d="M 42 58 L 42 72 C 46 75 54 75 58 72 L 58 58 Z"
        fill={skin}
        {...stroke}
      />

      {/* ears */}
      <circle
        cx="27"
        cy="47"
        r="5.2"
        fill={skin}
        {...stroke}
        strokeWidth={2.8}
      />
      <circle
        cx="73"
        cy="47"
        r="5.2"
        fill={skin}
        {...stroke}
        strokeWidth={2.8}
      />

      {/* head */}
      <ellipse cx="50" cy="43" rx="22" ry="23.5" fill={skin} {...stroke} />

      {/* Hair — four silhouettes.
          Each cap is a crescent: an outer arc over the crown and an inner arc
          back along the hairline. The inner arc must sit BELOW the outer one or
          the path self-inverts and fills as an empty sliver, which reads as a
          bald head wearing a thin band. */}
      {style === 0 ? (
        // cropped
        <path
          d="M 28 45 C 27 18 73 18 72 45 C 68 33 61 30 50 30 C 39 30 32 33 28 45 Z"
          fill={hair}
          {...stroke}
        />
      ) : null}
      {style === 1 ? (
        // long, falling past the jaw
        <>
          <path d="M 29 44 L 25 85 L 36 85 L 34 50 Z" fill={hair} {...stroke} />
          <path d="M 71 44 L 75 85 L 64 85 L 66 50 Z" fill={hair} {...stroke} />
          <path
            d="M 28 45 C 27 18 73 18 72 45 C 68 33 61 30 50 30 C 39 30 32 33 28 45 Z"
            fill={hair}
            {...stroke}
          />
        </>
      ) : null}
      {style === 2 ? (
        // bun
        <>
          <circle cx="50" cy="14" r="8" fill={hair} {...stroke} />
          <path
            d="M 28 45 C 27 18 73 18 72 45 C 68 33 61 30 50 30 C 39 30 32 33 28 45 Z"
            fill={hair}
            {...stroke}
          />
        </>
      ) : null}
      {style === 3 ? (
        // curls
        <path
          d="M 28 44 C 22 38 25 27 33 27 C 34 20 45 17 50 22 C 55 17 66 20 67 27 C 75 27 78 38 72 44 C 68 32 61 28 50 28 C 39 28 32 32 28 44 Z"
          fill={hair}
          {...stroke}
        />
      ) : null}

      {/* face */}
      <circle cx="42" cy="43" r="2.6" fill={ink.brown} />
      <circle cx="58" cy="43" r="2.6" fill={ink.brown} />
      <path
        d="M 43 53 C 46 57 54 57 57 53"
        fill="none"
        {...stroke}
        strokeWidth={2.8}
      />
      {/* cheeks */}
      <ellipse
        cx="34"
        cy="50"
        rx="4"
        ry="2.6"
        fill={ink.pinkDeep}
        opacity={0.55}
      />
      <ellipse
        cx="66"
        cy="50"
        rx="4"
        ry="2.6"
        fill={ink.pinkDeep}
        opacity={0.55}
      />
    </svg>
  );
}
