import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Home-screen icon for iOS.
 *
 * iOS ignores SVG favicons, so this is rasterised via next/og rather than
 * reusing `icon.svg`. Safari asks for /apple-touch-icon.png on every visit;
 * without this the bookmark falls back to a screenshot of the page.
 */
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="140" height="140">
<g stroke="#4a342a" stroke-width="4" stroke-linejoin="round">
<ellipse cx="22" cy="34" rx="10.5" ry="13.5" fill="#c79a6b" transform="rotate(-18 22 34)"/>
<ellipse cx="41" cy="23" rx="10.5" ry="14" fill="#c79a6b" transform="rotate(-7 41 23)"/>
<ellipse cx="61" cy="23" rx="10.5" ry="14" fill="#c79a6b" transform="rotate(7 61 23)"/>
<ellipse cx="80" cy="34" rx="10.5" ry="13.5" fill="#c79a6b" transform="rotate(18 80 34)"/>
<path d="M51 97 C 32 84 22 73 22 62 C 22 52 30 45 38 45 C 44 45 48 48 51 53 C 54 48 58 45 64 45 C 72 45 80 52 80 62 C 80 73 70 84 51 97 Z" fill="#d24a5e"/>
</g></svg>`;

const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`;

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7d9d5",
        }}
      >
        <img src={markSrc} width={140} height={140} alt="" />
      </div>
    ),
    size,
  );
}
