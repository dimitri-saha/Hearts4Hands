import { a11y, ink, type IllustrationProps } from "./types";

/** Small marks scattered around the page — the margin doodles of the site. */

export function Sparkle({
  color = ink.sun,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M20 2 C 22 14 26 18 38 20 C 26 22 22 26 20 38 C 18 26 14 22 2 20 C 14 18 18 14 20 2 Z"
        fill={color}
        stroke={ink.brown}
        strokeWidth="2"
        strokeLinejoin="round"
        filter="url(#crayon-tight)"
      />
    </svg>
  );
}

export function Star({
  color = ink.sun,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M20 3 L 25 15 L 38 16 L 28 24 L 31 37 L 20 30 L 9 37 L 12 24 L 2 16 L 15 15 Z"
        fill={color}
        stroke={ink.brown}
        strokeWidth="2.4"
        strokeLinejoin="round"
        filter="url(#crayon-tight)"
      />
    </svg>
  );
}

export function Sun({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" strokeLinecap="round">
        <g stroke={ink.sun} strokeWidth="5" fill="none">
          <path d="M50 4 v 12" />
          <path d="M50 84 v 12" />
          <path d="M4 50 h 12" />
          <path d="M84 50 h 12" />
          <path d="M17 17 l 9 9" />
          <path d="M74 74 l 9 9" />
          <path d="M83 17 l -9 9" />
          <path d="M26 74 l -9 9" />
        </g>
        <circle cx="50" cy="50" r="26" fill={ink.sun} stroke={ink.brown} strokeWidth="3.5" />
      </g>
    </svg>
  );
}

export function Cloud({ title, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 70" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M28 60 C 14 60 6 51 6 41 C 6 31 14 23 25 24 C 28 12 39 5 51 7 C 62 9 70 18 71 28 C 84 24 98 32 100 44 C 111 45 116 52 114 60 Z"
        fill={ink.paper}
        stroke={ink.brown}
        strokeWidth="3.5"
        strokeLinejoin="round"
        filter="url(#crayon)"
      />
    </svg>
  );
}

export function Rainbow({ title, ...props }: IllustrationProps) {
  const bands = [
    { r: 46, c: ink.red },
    { r: 36, c: ink.sun },
    { r: 26, c: ink.leaf },
    { r: 16, c: ink.sky },
  ];
  return (
    <svg viewBox="0 0 110 60" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)" fill="none" strokeWidth="8" strokeLinecap="round">
        {bands.map((b) => (
          <path key={b.r} d={`M${55 - b.r} 54 a ${b.r} ${b.r} 0 0 1 ${b.r * 2} 0`} stroke={b.c} />
        ))}
      </g>
    </svg>
  );
}

/** Hand-drawn underline that sits beneath a heading. */
export function Underline({
  color = ink.pinkDeep,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 200 16" preserveAspectRatio="none" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M4 10 C 44 3 92 3 132 7 C 158 9 178 11 196 8"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#crayon)"
      />
    </svg>
  );
}

/** A looping curved arrow, for "start here" pointers. */
export function CurvedArrow({
  color = ink.brownSoft,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 100 80" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" filter="url(#crayon)">
        <path d="M8 12 C 40 4 74 16 82 52" />
        <path d="M70 44 L 83 56 L 92 41" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Short scribble used as a list bullet or inline separator. */
export function Squiggle({
  color = ink.pinkDeep,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 60 20" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M4 12 C 10 4 16 4 22 12 C 28 20 34 20 40 12 C 44 6 50 5 56 9"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#crayon)"
      />
    </svg>
  );
}

/** Hand-drawn check, for "what to include" lists. */
export function CheckMark({
  color = ink.leaf,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M6 22 L 16 32 L 34 8"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#crayon-tight)"
      />
    </svg>
  );
}

/** Hand-drawn circle used to ring a number or word. */
export function CircleScribble({
  color = ink.red,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M50 5 C 22 5 6 16 6 30 C 6 44 24 55 50 55 C 76 55 94 44 94 30 C 94 17 78 6 52 5"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        filter="url(#crayon)"
      />
    </svg>
  );
}

/** Washi tape, for taping cards and photos to the page. */
export function Tape({
  color = ink.pink,
  title,
  ...props
}: IllustrationProps & { color?: string }) {
  return (
    <svg viewBox="0 0 120 40" {...a11y(title)} {...props}>
      {title ? <title>{title}</title> : null}
      <g filter="url(#crayon)">
        <path d="M4 8 L 116 4 L 118 32 L 2 36 Z" fill={color} fillOpacity="0.85" />
        <g stroke={ink.paper} strokeWidth="2" opacity="0.5">
          <path d="M20 6 L 18 36" />
          <path d="M46 5 L 44 35" />
          <path d="M72 5 L 70 35" />
          <path d="M98 4 L 96 34" />
        </g>
      </g>
    </svg>
  );
}
