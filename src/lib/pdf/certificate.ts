import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import { certificateSignatories, site } from "@/lib/site";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Certificate } from "@/lib/supabase/types";

/**
 * Renders a certificate to a PDF.
 *
 * Built on every download rather than stored: the row is the source of truth,
 * there is no file to go stale or to survive a revocation, and nothing needs
 * cleaning up when a volunteer deletes their account.
 *
 * US Letter landscape, because that is what the schools and programmes these
 * get handed to print on.
 */

const W = 792;
const H = 612;

// Brand palette, as pdf-lib colours. Kept in sync with @theme in globals.css.
const c = {
  paper: rgb(1, 0.988, 0.973),
  cream: rgb(0.984, 0.945, 0.902),
  blush: rgb(0.984, 0.91, 0.894),
  brown: rgb(0.29, 0.204, 0.165),
  brownMid: rgb(0.478, 0.353, 0.278),
  brownSoft: rgb(0.655, 0.537, 0.439),
  red: rgb(0.824, 0.29, 0.369),
  berry: rgb(0.553, 0.165, 0.239),
  pinkDeep: rgb(0.906, 0.604, 0.576),
};

/**
 * Read once at module scope. Route handlers are dynamic, so this runs in a
 * serverless function — the files are traced into the bundle because the path
 * is a literal `process.cwd()` join, which is the pattern Next's file tracing
 * recognises. If a deploy ever ships without them, the throw is immediate and
 * loud rather than a PDF that silently falls back to Helvetica.
 */
const fontFile = (name: string) => readFileSync(join(process.cwd(), "src/fonts", name));
const FONTS = {
  bold: fontFile("Baloo2-Bold.ttf"),
  regular: fontFile("Baloo2-Regular.ttf"),
  hand: fontFile("PatrickHand-Regular.ttf"),
};

const BEAR = join(process.cwd(), "public/bears/bear_card.png");

/** Horizontally centred text. pdf-lib positions from the left, so measure first. */
function centre(page: PDFPage, text: string, font: PDFFont, size: number, y: number, color = c.brown) {
  page.drawText(text, {
    x: (W - font.widthOfTextAtSize(text, size)) / 2,
    y,
    size,
    font,
    color,
  });
}

/**
 * Shrinks `size` until the text fits `maxWidth`.
 *
 * Names run long — "Alexandra Constantinou-Whitfield" at the headline size is
 * half again wider than the page. Wrapping a name looks like a mistake, so it
 * scales down instead, with a floor so it never becomes unreadable.
 */
function fitSize(text: string, font: PDFFont, ideal: number, maxWidth: number, min = 22) {
  let size = ideal;
  while (size > min && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

export async function buildCertificatePdf(cert: Certificate): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // subset: true embeds only the glyphs actually used — the difference between
  // a ~40KB certificate and a ~400KB one.
  const bold = await doc.embedFont(FONTS.bold, { subset: true });
  const regular = await doc.embedFont(FONTS.regular, { subset: true });
  const hand = await doc.embedFont(FONTS.hand, { subset: true });

  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: c.paper });

  // ---------------------------------------------------------------- border
  // Two offset rectangles rather than one: the inner line sitting slightly off
  // the outer one is the flat "sticker shadow" the rest of the site uses.
  page.drawRectangle({
    x: 34, y: 30, width: W - 68, height: H - 68,
    borderColor: c.pinkDeep, borderWidth: 1.5,
  });
  page.drawRectangle({
    x: 28, y: 36, width: W - 68, height: H - 68,
    borderColor: c.brown, borderWidth: 2.5,
  });

  // ------------------------------------------------------------------ bear
  try {
    const bear = await doc.embedPng(readFileSync(BEAR));
    const h = 104;
    const w = (bear.width / bear.height) * h;
    page.drawImage(bear, { x: (W - w) / 2, y: H - 168, width: w, height: h });
  } catch {
    // A missing image must not cost somebody their certificate.
  }

  // ----------------------------------------------------------------- title
  centre(page, site.shortName, hand, 26, H - 200, c.red);
  centre(page, "CERTIFICATE OF VOLUNTEER SERVICE", bold, 25, H - 240, c.berry);

  page.drawLine({
    start: { x: W / 2 - 110, y: H - 258 },
    end: { x: W / 2 + 110, y: H - 258 },
    thickness: 2,
    color: c.pinkDeep,
  });

  // ------------------------------------------------------------------ name
  centre(page, "This certifies that", regular, 15, H - 292, c.brownMid);

  const name = cert.full_name.trim() || "A Hearts4Hands volunteer";
  centre(page, name, bold, fitSize(name, bold, 44, W - 180), H - 348, c.brown);

  // ------------------------------------------------------------ the claim
  const hours = formatNumber(Number(cert.hours));
  const cards = formatNumber(cert.cards);
  const claim =
    cert.cards > 0
      ? `has volunteered ${hours} ${Number(cert.hours) === 1 ? "hour" : "hours"} and made ${cards} ${cert.cards === 1 ? "card" : "cards"}`
      : `has volunteered ${hours} ${Number(cert.hours) === 1 ? "hour" : "hours"}`;

  centre(page, claim, regular, fitSize(claim, regular, 19, W - 160, 13), H - 388, c.brown);
  centre(page, "for children in hospitals", regular, 19, H - 414, c.brown);

  centre(
    page,
    `as of ${formatDate(cert.issued_at)}`,
    hand,
    17,
    H - 446,
    c.brownMid,
  );

  // ------------------------------------------------------------ signatures
  const sigY = 132;
  const slots = certificateSignatories.length || 1;
  const slotWidth = (W - 200) / slots;

  certificateSignatories.forEach((person, i) => {
    const cx = 100 + slotWidth * i + slotWidth / 2;
    const lineHalf = Math.min(slotWidth / 2 - 24, 120);

    page.drawLine({
      start: { x: cx - lineHalf, y: sigY },
      end: { x: cx + lineHalf, y: sigY },
      thickness: 1.2,
      color: c.brownSoft,
    });

    const nameSize = fitSize(person.name, bold, 14, lineHalf * 2, 9);
    page.drawText(person.name, {
      x: cx - bold.widthOfTextAtSize(person.name, nameSize) / 2,
      y: sigY - 18,
      size: nameSize,
      font: bold,
      color: c.brown,
    });

    const roleSize = fitSize(person.role, regular, 11, lineHalf * 2, 8);
    page.drawText(person.role, {
      x: cx - regular.widthOfTextAtSize(person.role, roleSize) / 2,
      y: sigY - 33,
      size: roleSize,
      font: regular,
      color: c.brownMid,
    });
  });

  // ------------------------------------------------------- verification
  // The line that makes the document checkable rather than decorative.
  const verifyUrl = `${site.url}/verify/${cert.code}`;
  centre(page, `Verify this certificate at ${verifyUrl}`, regular, 10.5, 72, c.brownMid);
  centre(page, cert.code, bold, 15, 52, c.berry);

  return doc.save();
}

/** Filename for the download. Kept ASCII-safe — Content-Disposition is fussy. */
export function certificateFilename(cert: Certificate) {
  const slug =
    cert.full_name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "volunteer";
  return `Hearts4Hands-certificate-${slug}.pdf`;
}
