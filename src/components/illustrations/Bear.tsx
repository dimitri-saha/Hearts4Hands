import { a11y, ink, type IllustrationProps } from "./types";

const FUR = "#3f2c23";
const FUR_LIGHT = "#4d382c";

/**
 * The Hearts4Hands bear, redrawn as vector art from the logo so it can scale,
 * animate, and sit on any background without the logo's pink square.
 *
 * Limbs are drawn twice — a wide outline stroke, then a narrower fill stroke
 * on top. That's the cheapest way to get a chunky outlined limb that still
 * bends on a curve, and it survives the crayon displacement filter cleanly.
 */
export function Bear({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 210 290" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinecap="round" strokeLinejoin="round">
        {/* ---- legs ---- */}
        <path
          d="M82 214 C 74 236 70 254 74 266 C 78 276 96 276 100 266 C 104 254 104 236 102 216 Z"
          fill={FUR}
          stroke={ink.brown}
          strokeWidth="4"
        />
        <path
          d="M128 214 C 136 236 140 254 136 266 C 132 276 114 276 110 266 C 106 254 106 236 108 216 Z"
          fill={FUR}
          stroke={ink.brown}
          strokeWidth="4"
        />

        {/* ---- raised arm (waving) ---- */}
        <path
          d="M138 132 C 156 116 168 88 172 58"
          fill="none"
          stroke={ink.brown}
          strokeWidth="34"
        />
        <path
          d="M138 132 C 156 116 168 88 172 58"
          fill="none"
          stroke={FUR}
          strokeWidth="27"
        />
        {/* ---- lowered arm ---- */}
        <path
          d="M72 136 C 58 130 46 120 40 108"
          fill="none"
          stroke={ink.brown}
          strokeWidth="32"
        />
        <path
          d="M72 136 C 58 130 46 120 40 108"
          fill="none"
          stroke={FUR}
          strokeWidth="25"
        />

        {/* ---- body ---- */}
        <path
          d="M70 112 C 56 138 54 176 62 204 C 70 230 86 240 105 240 C 124 240 140 230 148 204 C 156 176 154 138 140 112 Z"
          fill={FUR}
          stroke={ink.brown}
          strokeWidth="4.5"
        />
        {/* chest heart */}
        <path
          d="M105 210 C 84 194 74 181 74 168 C 74 157 82 150 91 150 C 97 150 102 154 105 159 C 108 154 113 150 119 150 C 128 150 136 157 136 168 C 136 181 126 194 105 210 Z"
          fill={ink.tan}
          stroke={ink.brown}
          strokeWidth="3"
          opacity="0.95"
        />

        {/* ---- ears ---- */}
        <circle cx="70" cy="46" r="19" fill={FUR} stroke={ink.brown} strokeWidth="4.5" />
        <circle cx="140" cy="46" r="19" fill={FUR} stroke={ink.brown} strokeWidth="4.5" />
        <circle cx="70" cy="47" r="9" fill={FUR_LIGHT} />
        <circle cx="140" cy="47" r="9" fill={FUR_LIGHT} />

        {/* ---- head ---- */}
        <path
          d="M105 22 C 76 22 56 44 56 72 C 56 100 78 118 105 118 C 132 118 154 100 154 72 C 154 44 134 22 105 22 Z"
          fill={FUR}
          stroke={ink.brown}
          strokeWidth="4.5"
        />
        {/* muzzle */}
        <ellipse cx="105" cy="90" rx="24" ry="18" fill={ink.honey} stroke={ink.brown} strokeWidth="3" />
        <path d="M105 84 c -7 -5 -13 0 -9 5 c 3 4 9 6 9 6 s 6 -2 9 -6 c 4 -5 -2 -10 -9 -5 Z" fill={ink.brown} />
        <path d="M105 95 v 6" stroke={ink.brown} strokeWidth="2.6" fill="none" />
        <path d="M105 101 c -4 5 -10 4 -12 -1" stroke={ink.brown} strokeWidth="2.6" fill="none" />
        <path d="M105 101 c 4 5 10 4 12 -1" stroke={ink.brown} strokeWidth="2.6" fill="none" />
        {/* eyes */}
        <circle cx="85" cy="68" r="5.4" fill="#241812" />
        <circle cx="125" cy="68" r="5.4" fill="#241812" />
        <circle cx="86.8" cy="66" r="1.8" fill={ink.paper} />
        <circle cx="126.8" cy="66" r="1.8" fill={ink.paper} />
        {/* cheeks */}
        <ellipse cx="72" cy="84" rx="9" ry="6" fill="url(#blush-glow)" />
        <ellipse cx="138" cy="84" rx="9" ry="6" fill="url(#blush-glow)" />

        {/* ---- paw pads ---- */}
        <g stroke={ink.brown} strokeWidth="2.4">
          {/* waving paw */}
          <circle cx="174" cy="50" r="7.5" fill={ink.pinkDeep} />
          <circle cx="165" cy="40" r="3.4" fill={ink.pinkDeep} />
          <circle cx="176" cy="35" r="3.4" fill={ink.pinkDeep} />
          <circle cx="185" cy="42" r="3.4" fill={ink.pinkDeep} />
          {/* lowered paw, with the logo's little heart */}
          <path
            d="M38 108 C 32 103 28 100 28 96 C 28 93 30 91 33 91 C 35 91 37 92 38 94 C 39 92 41 91 43 91 C 46 91 48 93 48 96 C 48 100 44 103 38 108 Z"
            fill={ink.pinkDeep}
          />
        </g>

        {/* ---- fur ticks: a handful of crayon strokes so the silhouette isn't flat ---- */}
        <g stroke={FUR_LIGHT} strokeWidth="2.4" fill="none" opacity="0.85">
          <path d="M66 132 c 4 6 4 12 2 17" />
          <path d="M148 136 c -4 6 -4 12 -2 17" />
          <path d="M64 176 c 4 5 5 11 4 16" />
          <path d="M150 180 c -4 5 -5 11 -4 16" />
          <path d="M62 62 c -3 6 -3 12 -1 17" />
          <path d="M150 62 c 3 6 3 12 1 17" />
        </g>
      </g>
    </svg>
  );
}

/** Head-only mark, sized for the header, favicon, and small badges. */
export function BearHead({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 110 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon-tight)" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="26" r="16" fill={FUR} stroke={ink.brown} strokeWidth="4" />
        <circle cx="86" cy="26" r="16" fill={FUR} stroke={ink.brown} strokeWidth="4" />
        <circle cx="24" cy="27" r="7.5" fill={FUR_LIGHT} />
        <circle cx="86" cy="27" r="7.5" fill={FUR_LIGHT} />
        <path
          d="M55 8 C 29 8 12 27 12 50 C 12 74 32 92 55 92 C 78 92 98 74 98 50 C 98 27 81 8 55 8 Z"
          fill={FUR}
          stroke={ink.brown}
          strokeWidth="4.5"
        />
        <ellipse cx="55" cy="65" rx="20" ry="15" fill={ink.honey} stroke={ink.brown} strokeWidth="3" />
        <path d="M55 60 c -6 -4 -11 0 -7.5 4 c 2.5 3 7.5 5 7.5 5 s 5 -2 7.5 -5 c 3.5 -4 -1.5 -8 -7.5 -4 Z" fill={ink.brown} />
        <path d="M55 69 v 5" stroke={ink.brown} strokeWidth="2.4" fill="none" />
        <path d="M55 74 c -3.5 4 -8 3 -9.5 -1" stroke={ink.brown} strokeWidth="2.4" fill="none" />
        <path d="M55 74 c 3.5 4 8 3 9.5 -1" stroke={ink.brown} strokeWidth="2.4" fill="none" />
        <circle cx="38" cy="45" r="4.8" fill="#241812" />
        <circle cx="72" cy="45" r="4.8" fill="#241812" />
        <circle cx="39.6" cy="43.2" r="1.6" fill={ink.paper} />
        <circle cx="73.6" cy="43.2" r="1.6" fill={ink.paper} />
        <ellipse cx="26" cy="60" rx="8" ry="5.5" fill="url(#blush-glow)" />
        <ellipse cx="84" cy="60" rx="8" ry="5.5" fill="url(#blush-glow)" />
      </g>
    </svg>
  );
}
