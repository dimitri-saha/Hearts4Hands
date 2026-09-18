import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Hearts4Hands — creativity is a form of courage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card, generated with next/og rather than checked in as a PNG so the
 * wording stays in sync with the site copy.
 *
 * The whole sitting bear, not the cropped face used by the icons: the face
 * has a flat bottom edge, which is invisible inside a rounded icon frame but
 * reads as a hard cut when it floats on the card's background.
 *
 * The bear is read off disk and inlined as a data-URI <img>. Satori renders a
 * PNG <img> reliably but is patchy with nested SVG, so passing artwork as an
 * image is the rule here. The read happens at module scope: `next build`
 * prerenders this route, so the file is there when it runs and nothing touches
 * the filesystem at request time.
 */
const face = readFileSync(join(process.cwd(), "public/bears/bear_sit.png"));
const markSrc = `data:image/png;base64,${face.toString("base64")}`;

export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7d9d5",
        padding: "60px",
      }}
    >
      <img src={markSrc} width={210} height={209} alt="" />

      <div
        style={{
          display: "flex",
          fontSize: 88,
          fontWeight: 700,
          color: "#b03a4e",
          marginTop: 24,
          letterSpacing: "-0.02em",
        }}
      >
        heARTs4hAnds
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 40,
          color: "#4a342a",
          marginTop: 16,
        }}
      >
        Creativity is a form of courage.
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 26,
          color: "#7a5a47",
          marginTop: 28,
        }}
      >
        Cards for patients in hospitals · Stories · Funding cancer research
      </div>
    </div>,
    size,
  );
}
