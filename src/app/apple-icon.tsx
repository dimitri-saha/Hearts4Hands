import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Home-screen icon for iOS.
 *
 * iOS wants a PNG at a known size, so this is composed via next/og rather than
 * reusing `icon.png` directly. Safari asks for /apple-touch-icon.png on every
 * visit; without this the bookmark falls back to a screenshot of the page.
 *
 * The face is bottom-aligned and full-bleed: its crop edge then lands on the
 * icon's own edge instead of hanging in the middle of the background.
 *
 * Same build-time read as the OG card — see the note there.
 */
const face = readFileSync(join(process.cwd(), "public/bears/bear_face.png"));
const markSrc = `data:image/png;base64,${face.toString("base64")}`;

export default async function AppleIcon() {
  return new ImageResponse(
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
      <img src={markSrc} width={180} height={148} alt="" />
    </div>,
    size,
  );
}
