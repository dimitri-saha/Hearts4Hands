import { a11y, ink, type IllustrationProps } from "./types";

/**
 * Object illustrations used as section headers, card art, and button accents.
 * All share the same crayon language: chunky brown outline, flat warm fill,
 * one or two highlight strokes, and a wobble filter.
 */

/** A folded card, open a little, with a heart on the front. */
export function GreetingCard({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 110" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round">
        {/* back panel */}
        <path
          d="M60 26 L 112 40 L 112 96 L 60 86 Z"
          fill={ink.cream}
          stroke={ink.brown}
          strokeWidth="4"
        />
        {/* front panel */}
        <path
          d="M60 26 L 8 40 L 8 96 L 60 86 Z"
          fill={ink.paper}
          stroke={ink.brown}
          strokeWidth="4"
        />
        {/* heart on the front */}
        <path
          d="M34 74 C 24 66 19 60 19 54 C 19 49 23 46 27 46 C 30 46 33 48 34 51 C 35 48 38 46 41 46 C 45 46 49 49 49 54 C 49 60 44 66 34 74 Z"
          fill={ink.red}
          stroke={ink.brown}
          strokeWidth="3"
        />
        {/* handwriting squiggles on the inside panel */}
        <g stroke={ink.brownSoft} strokeWidth="2.6" fill="none">
          <path d="M72 54 h 30" />
          <path d="M72 64 h 24" />
          <path d="M72 74 h 28" />
        </g>
        {/* fold */}
        <path d="M60 26 v 60" stroke={ink.brown} strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
}

/** A crayon. Pass `color` to recolor the barrel. */
export function Crayon({
  color = ink.red,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 130" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon-tight)" strokeLinejoin="round" strokeLinecap="round">
        <path d="M20 4 L 33 30 L 7 30 Z" fill={color} stroke={ink.brown} strokeWidth="3" />
        <rect x="7" y="30" width="26" height="94" rx="5" fill={color} stroke={ink.brown} strokeWidth="3" />
        <rect x="7" y="46" width="26" height="30" fill={ink.paper} stroke={ink.brown} strokeWidth="3" />
        <g stroke={color} strokeWidth="2.4" fill="none" opacity="0.8">
          <path d="M12 54 h 16" />
          <path d="M12 62 h 16" />
          <path d="M12 70 h 16" />
        </g>
        <path d="M14 88 v 28" stroke={ink.paper} strokeWidth="3" opacity="0.35" fill="none" />
      </g>
    </svg>
  );
}

/** A fan of crayons — the Volunteer page header. */
export function CrayonBundle({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 150 120" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round">
        {[
          { x: 8, r: -16, c: ink.sky },
          { x: 40, r: -7, c: ink.sun },
          { x: 72, r: 3, c: ink.red },
          { x: 104, r: 13, c: ink.leaf },
        ].map((crayon, i) => (
          <g key={i} transform={`translate(${crayon.x} 14) rotate(${crayon.r} 18 50)`}>
            <path d="M18 0 L 30 22 L 6 22 Z" fill={crayon.c} stroke={ink.brown} strokeWidth="3" />
            <rect x="6" y="22" width="24" height="76" rx="4" fill={crayon.c} stroke={ink.brown} strokeWidth="3" />
            <rect x="6" y="36" width="24" height="24" fill={ink.paper} stroke={ink.brown} strokeWidth="2.6" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Envelope with a heart seal — Contact page. */
export function Envelope({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 130 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round">
        <rect x="8" y="16" width="114" height="76" rx="8" fill={ink.cream} stroke={ink.brown} strokeWidth="4" />
        <path d="M8 22 L 65 62 L 122 22" fill="none" stroke={ink.brown} strokeWidth="3.5" />
        <path d="M8 88 L 48 56" fill="none" stroke={ink.brownSoft} strokeWidth="2.6" />
        <path d="M122 88 L 82 56" fill="none" stroke={ink.brownSoft} strokeWidth="2.6" />
        <path
          d="M65 74 C 55 66 50 60 50 54 C 50 49 54 46 58 46 C 61 46 64 48 65 51 C 66 48 69 46 72 46 C 76 46 80 49 80 54 C 80 60 75 66 65 74 Z"
          fill={ink.red}
          stroke={ink.brown}
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}

/** Coin jar with a heart label — Donate page. */
export function CoinJar({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 130" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round">
        {/* falling coin */}
        <circle cx="60" cy="14" r="10" fill={ink.sun} stroke={ink.brown} strokeWidth="3" />
        <path d="M60 9 v 10 M56.5 11.5 h 7" stroke={ink.brown} strokeWidth="2" fill="none" />
        {/* jar */}
        <rect x="22" y="30" width="76" height="12" rx="4" fill={ink.tan} stroke={ink.brown} strokeWidth="3.5" />
        <path
          d="M28 42 C 22 58 20 82 24 102 C 27 116 38 122 60 122 C 82 122 93 116 96 102 C 100 82 98 58 92 42 Z"
          fill={ink.sky}
          fillOpacity="0.35"
          stroke={ink.brown}
          strokeWidth="4"
        />
        {/* coins inside */}
        <g stroke={ink.brown} strokeWidth="2.6">
          <circle cx="44" cy="100" r="9" fill={ink.sun} />
          <circle cx="66" cy="105" r="8" fill={ink.honey} />
          <circle cx="80" cy="96" r="7" fill={ink.sun} />
          <circle cx="54" cy="88" r="7" fill={ink.honey} />
        </g>
        {/* heart label */}
        <g transform="translate(43 52) scale(0.9)">
          <path
            d="M18 30 C 8 22 3 16 3 10 C 3 5 7 2 11 2 C 14 2 17 4 18 7 C 19 4 22 2 25 2 C 29 2 33 5 33 10 C 33 16 28 22 18 30 Z"
            fill={ink.red}
            stroke={ink.brown}
            strokeWidth="3"
          />
        </g>
        {/* glass shine */}
        <path d="M34 54 c -3 14 -3 30 -1 42" stroke={ink.paper} strokeWidth="4" fill="none" opacity="0.7" />
      </g>
    </svg>
  );
}

/** Open book — Stories / blog. */
export function OpenBook({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 140 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M70 26 C 56 16 32 14 12 18 L 12 84 C 32 80 56 82 70 92 Z"
          fill={ink.paper}
          stroke={ink.brown}
          strokeWidth="4"
        />
        <path
          d="M70 26 C 84 16 108 14 128 18 L 128 84 C 108 80 84 82 70 92 Z"
          fill={ink.paper}
          stroke={ink.brown}
          strokeWidth="4"
        />
        <path d="M70 26 v 66" stroke={ink.brown} strokeWidth="3.5" fill="none" />
        <g stroke={ink.brownSoft} strokeWidth="2.4" fill="none">
          <path d="M22 36 h 36" />
          <path d="M22 48 h 32" />
          <path d="M22 60 h 36" />
          <path d="M82 36 h 36" />
          <path d="M82 48 h 30" />
          <path d="M82 60 h 34" />
        </g>
        <path
          d="M100 76 C 93 70 89 66 89 61 C 89 57 92 55 95 55 C 97 55 99 56 100 58 C 101 56 103 55 105 55 C 108 55 111 57 111 61 C 111 66 107 70 100 76 Z"
          fill={ink.pinkDeep}
          stroke={ink.brown}
          strokeWidth="2.6"
        />
      </g>
    </svg>
  );
}

/** Award ribbon — the PVSA / recognition callout. */
export function AwardRibbon({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 130" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round">
        <path d="M32 76 L 20 124 L 42 112 L 50 94 Z" fill={ink.red} stroke={ink.brown} strokeWidth="3.5" />
        <path d="M68 76 L 80 124 L 58 112 L 50 94 Z" fill={ink.redDeep} stroke={ink.brown} strokeWidth="3.5" />
        <circle cx="50" cy="48" r="38" fill={ink.sun} stroke={ink.brown} strokeWidth="4" />
        <circle cx="50" cy="48" r="27" fill={ink.honey} stroke={ink.brown} strokeWidth="3" />
        <path
          d="M50 66 C 38 56 32 49 32 42 C 32 36 37 32 42 32 C 45 32 48 34 50 37 C 52 34 55 32 58 32 C 63 32 68 36 68 42 C 68 49 62 56 50 66 Z"
          fill={ink.red}
          stroke={ink.brown}
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}

/** Globe — "volunteers from anywhere". */
export function Globe({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round" fill="none">
        <circle cx="50" cy="50" r="40" fill={ink.sky} fillOpacity="0.4" stroke={ink.brown} strokeWidth="4" />
        <path d="M10 50 h 80" stroke={ink.brown} strokeWidth="3" />
        <path d="M50 10 C 30 28 30 72 50 90" stroke={ink.brown} strokeWidth="3" />
        <path d="M50 10 C 70 28 70 72 50 90" stroke={ink.brown} strokeWidth="3" />
        <path d="M18 30 C 34 38 66 38 82 30" stroke={ink.brown} strokeWidth="2.6" />
        <path d="M18 70 C 34 62 66 62 82 70" stroke={ink.brown} strokeWidth="2.6" />
        <path
          d="M62 62 C 55 56 51 52 51 47 C 51 43 54 41 57 41 C 59 41 61 42 62 44 C 63 42 65 41 67 41 C 70 41 73 43 73 47 C 73 52 69 56 62 62 Z"
          fill={ink.red}
          stroke={ink.brown}
          strokeWidth="2.6"
        />
      </g>
    </svg>
  );
}

/** Megaphone — outreach and chapters. */
export function Megaphone({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round">
        <path d="M20 40 L 66 20 L 66 80 L 20 60 Z" fill={ink.red} stroke={ink.brown} strokeWidth="4" />
        <rect x="8" y="40" width="14" height="20" rx="4" fill={ink.tan} stroke={ink.brown} strokeWidth="3.5" />
        <path d="M28 62 l -4 22 c -1 5 8 6 10 1 l 6 -18 Z" fill={ink.tan} stroke={ink.brown} strokeWidth="3" />
        <g stroke={ink.pinkDeep} strokeWidth="4" fill="none">
          <path d="M78 34 c 8 6 8 26 0 32" />
          <path d="M92 24 c 14 12 14 40 0 52" />
        </g>
      </g>
    </svg>
  );
}

/** Paper airplane — "sent!" confirmation states. */
export function PaperPlane({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinejoin="round" strokeLinecap="round">
        <path d="M12 52 L 108 14 L 78 88 L 60 62 Z" fill={ink.paper} stroke={ink.brown} strokeWidth="4" />
        <path d="M108 14 L 60 62 L 12 52" fill={ink.cream} stroke={ink.brown} strokeWidth="3.5" />
        <path d="M60 62 L 62 86 L 78 88" fill={ink.kraft} stroke={ink.brown} strokeWidth="3" />
        <g stroke={ink.pinkDeep} strokeWidth="3.4" fill="none" opacity="0.9">
          <path d="M6 74 c 12 -4 22 -4 30 -1" />
          <path d="M18 88 c 10 -4 18 -4 24 -2" />
        </g>
      </g>
    </svg>
  );
}
