import { a11y, ink, type IllustrationProps } from "./types";

const HEART_PATH =
  "M50 87 C 21 66 6 49 6 32.5 C 6 16.5 18 6 30.5 6 C 39.5 6 46.5 11.5 50 18.5 C 53.5 11.5 60.5 6 69.5 6 C 82 6 94 16.5 94 32.5 C 94 49 79 66 50 87 Z";

interface HeartProps extends IllustrationProps {
  fill?: string;
  stroke?: string;
  /** Adds the little crayon highlight stroke inside the lobe. */
  shine?: boolean;
}

/** The core brand motif. Used everywhere from bullets to page headers. */
export function Heart({
  fill = ink.red,
  stroke = ink.brown,
  shine = true,
  title,
  ...props
}: HeartProps) {
  return (
    <svg viewBox="0 0 100 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)">
        <path
          d={HEART_PATH}
          fill={fill}
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {shine ? (
          <path
            d="M27 22 C 21 27 19 33 20 40"
            fill="none"
            stroke={ink.paper}
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.65"
          />
        ) : null}
      </g>
    </svg>
  );
}

/** Outline-only heart — for bullets, checkmarks, and quiet accents. */
export function HeartOutline({
  stroke = ink.red,
  title,
  ...props
}: IllustrationProps & { stroke?: string }) {
  return (
    <svg viewBox="0 0 100 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d={HEART_PATH}
        fill="none"
        stroke={stroke}
        strokeWidth="7"
        strokeLinejoin="round"
        filter="url(#crayon)"
      />
    </svg>
  );
}

/** Three tumbling hearts — a light decorative cluster. */
export function HeartTrio({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 110" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeWidth="4">
        <g transform="translate(6 22) scale(0.62) rotate(-14 50 50)">
          <path d={HEART_PATH} fill={ink.pink} stroke={ink.brown} />
        </g>
        <g transform="translate(46 2) scale(0.9)">
          <path d={HEART_PATH} fill={ink.red} stroke={ink.brown} />
          <path
            d="M27 22 C 21 27 19 33 20 40"
            fill="none"
            stroke={ink.paper}
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>
        <g transform="translate(112 30) scale(0.5) rotate(16 50 50)">
          <path d={HEART_PATH} fill={ink.pinkDeep} stroke={ink.brown} />
        </g>
      </g>
    </svg>
  );
}

/**
 * The bear's paw with a heart pad — lifted straight from the logo, and the
 * most recognizable small mark we have. Doubles as the favicon.
 */
export function PawHeart({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)">
        {/* toes */}
        <ellipse cx="24" cy="35" rx="10" ry="13" fill={ink.tan} stroke={ink.brown} strokeWidth="3.5" transform="rotate(-18 24 35)" />
        <ellipse cx="42" cy="24" rx="10" ry="13.5" fill={ink.tan} stroke={ink.brown} strokeWidth="3.5" transform="rotate(-7 42 24)" />
        <ellipse cx="61" cy="25" rx="10" ry="13.5" fill={ink.tan} stroke={ink.brown} strokeWidth="3.5" transform="rotate(7 61 25)" />
        <ellipse cx="78" cy="37" rx="10" ry="13" fill={ink.tan} stroke={ink.brown} strokeWidth="3.5" transform="rotate(18 78 37)" />
        {/* main pad, shaped as a heart */}
        <g transform="translate(21 44) scale(0.58)">
          <path
            d={HEART_PATH}
            fill={ink.pinkDeep}
            stroke={ink.brown}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}

/**
 * Two cupped hands holding a heart — the literal "hearts for hands" mark.
 * Used as the About-page header and the volunteer CTA illustration.
 */
export function HandsHeart({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 140 120" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinecap="round" strokeLinejoin="round">
        {/* rays */}
        <g stroke={ink.sun} strokeWidth="4.5" opacity="0.9">
          <path d="M70 6 v10" />
          <path d="M38 14 l6 9" />
          <path d="M102 14 l-6 9" />
          <path d="M16 40 l10 4" />
          <path d="M124 40 l-10 4" />
        </g>
        {/* heart */}
        <g transform="translate(38 18) scale(0.66)">
          <path d={HEART_PATH} fill={ink.red} stroke={ink.brown} strokeWidth="6" />
          <path
            d="M28 24 C 22 29 20 35 21 42"
            fill="none"
            stroke={ink.paper}
            strokeWidth="7"
            opacity="0.6"
          />
        </g>
        {/* left hand */}
        <path
          d="M50 74 C 44 70 36 68 30 72 C 24 76 24 84 30 88 L 52 104 C 58 109 66 111 70 111 L 70 88 C 62 88 55 82 50 74 Z"
          fill={ink.honey}
          stroke={ink.brown}
          strokeWidth="4"
        />
        {/* right hand */}
        <path
          d="M90 74 C 96 70 104 68 110 72 C 116 76 116 84 110 88 L 88 104 C 82 109 74 111 70 111 L 70 88 C 78 88 85 82 90 74 Z"
          fill={ink.honey}
          stroke={ink.brown}
          strokeWidth="4"
        />
        {/* finger creases */}
        <g stroke={ink.tan} strokeWidth="2.6" fill="none" opacity="0.85">
          <path d="M46 84 l-8 -4" />
          <path d="M53 92 l-9 -4" />
          <path d="M94 84 l8 -4" />
          <path d="M87 92 l9 -4" />
        </g>
      </g>
    </svg>
  );
}
