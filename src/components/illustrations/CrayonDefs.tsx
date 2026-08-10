/**
 * Global SVG filter definitions, rendered once in the root layout.
 *
 * Every illustration in the site references these by id. The trick that sells
 * the crayon look is `feTurbulence` + `feDisplacementMap`: it pushes each edge
 * around by a few pixels along a noise field, so mathematically perfect curves
 * come out slightly wrong in the way a human hand gets them wrong.
 *
 * Keep `scale` small (1–4). Past that, strokes tear apart instead of wobbling.
 */
export function CrayonDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* Subtle wobble — the default for most illustrations. */}
        <filter id="crayon" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.028"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Looser, for big decorative shapes and dividers. */}
        <filter id="crayon-loose" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.016"
            numOctaves="3"
            seed="12"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Tight, for small icons where a big wobble would destroy legibility. */}
        <filter id="crayon-tight" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/*
          Waxy fill: punches noise-shaped holes in the graphic so a flat fill
          reads as crayon laid over textured paper.
        */}
        <filter id="crayon-wax" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            seed="9"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 -1.1 1.02"
            result="grainAlpha"
          />
          <feComposite in="SourceGraphic" in2="grainAlpha" operator="in" result="textured" />
          <feBlend in="SourceGraphic" in2="textured" mode="normal" />
        </filter>

        {/* Soft paper drop shadow for cut-out elements. */}
        <filter id="paper-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow
            dx="2"
            dy="3"
            stdDeviation="2"
            floodColor="#4a342a"
            floodOpacity="0.18"
          />
        </filter>

        {/* Reusable soft radial for cheeks, glows, and blush spots. */}
        <radialGradient id="blush-glow">
          <stop offset="0%" stopColor="#e79a93" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e79a93" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
