import { ImageResponse } from "next/og";

export const alt = "Hearts4Hands — creativity is a form of courage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card, generated with next/og rather than checked in as a PNG so the
 * wording stays in sync with the site copy.
 *
 * The mark is passed as a data-URI <img> rather than inline SVG children:
 * Satori's support for nested SVG elements with per-element transforms is
 * patchy, and an <img> is rendered by resvg reliably.
 */
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
<g stroke="#4a342a" stroke-width="3.5" stroke-linejoin="round">
<ellipse cx="24" cy="35" rx="10" ry="13" fill="#c79a6b" transform="rotate(-18 24 35)"/>
<ellipse cx="42" cy="24" rx="10" ry="13.5" fill="#c79a6b" transform="rotate(-7 42 24)"/>
<ellipse cx="61" cy="25" rx="10" ry="13.5" fill="#c79a6b" transform="rotate(7 61 25)"/>
<ellipse cx="78" cy="37" rx="10" ry="13" fill="#c79a6b" transform="rotate(18 78 37)"/>
<path d="M50 96 C 33 84 24 74 24 64 C 24 55 31 49 38 49 C 43 49 47 52 50 56 C 53 52 57 49 62 49 C 69 49 76 55 76 64 C 76 74 67 84 50 96 Z" fill="#d24a5e"/>
</g></svg>`;

const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`;

export default async function OpengraphImage() {
  return new ImageResponse(
    (
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
        <img src={markSrc} width={190} height={190} alt="" />

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

        <div style={{ display: "flex", fontSize: 40, color: "#4a342a", marginTop: 16 }}>
          Creativity is a form of courage.
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#7a5a47", marginTop: 28 }}>
          Cards for kids in hospitals · Stories · Funding cancer research
        </div>
      </div>
    ),
    size,
  );
}
