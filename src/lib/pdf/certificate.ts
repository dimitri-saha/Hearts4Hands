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

/**
 * A print copy of the logo, cropped to its content.
 *
 * `public/logo.jpeg` is the canonical logo but carries a wide pink margin —
 * placed on the certificate at a sensible size, the bear inside it came out
 * barely legible. This is the same artwork with the empty ground trimmed off
 * and scaled for print, so the size on the page is the size of the logo.
 */
const LOGO = join(process.cwd(), "public/logo-print.jpg");

/**
 * Signature image slot.
 *
 * A scanned signature is wider than it is tall, so the slot is sized to the
 * rule it sits on (240pt) with a little air either side. Anything handed in is
 * scaled to fit inside this box and centred, so an image that is the wrong
 * shape gets smaller rather than distorted.
 */
const SIG_MAX_W = 230;
const SIG_MAX_H = 48;

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

  // ------------------------------------------------------------------ logo
  // The full logo, bear and wordmark together. It carries its own pink ground
  // (it's a JPEG, so there's no transparency to knock out), which is why there
  // is no separate wordmark line below it — the name would otherwise appear
  // twice, once drawn and once typeset.
  try {
    const logo = await doc.embedJpg(readFileSync(LOGO));
    const h = 124;
    const w = (logo.width / logo.height) * h;
    page.drawImage(logo, { x: (W - w) / 2, y: H - 176, width: w, height: h });
  } catch {
    // A missing image must not cost somebody their certificate.
  }

  // ----------------------------------------------------------------- title
  centre(page, "CERTIFICATE OF VOLUNTEER SERVICE", bold, 25, H - 208, c.berry);

  page.drawLine({
    start: { x: W / 2 - 110, y: H - 226 },
    end: { x: W / 2 + 110, y: H - 226 },
    thickness: 2,
    color: c.pinkDeep,
  });

  // ------------------------------------------------------------------ name
  const isClub = cert.kind === "club";

  centre(page, "This certifies that", regular, 15, H - 256, c.brownMid);

  const name =
    cert.subject_name.trim() || (isClub ? "A Hearts4Hands club" : "A Hearts4Hands volunteer");
  centre(page, name, bold, fitSize(name, bold, 44, W - 180), H - 310, c.brown);

  // ------------------------------------------------------------ the claim
  const hours = formatNumber(Number(cert.hours));
  const cards = formatNumber(cert.cards);
  const hourWord = Number(cert.hours) === 1 ? "hour" : "hours";
  const cardPart = cert.cards > 0 ? ` and made ${cards} ${cert.cards === 1 ? "card" : "cards"}` : "";

  const claim = isClub
    ? `together volunteered ${hours} ${hourWord}${cardPart}`
    : `has volunteered ${hours} ${hourWord}${cardPart}`;

  centre(page, claim, regular, fitSize(claim, regular, 19, W - 160, 13), H - 348, c.brown);
  centre(page, "for patients in hospitals", regular, 19, H - 374, c.brown);

  const volunteers = formatNumber(cert.volunteer_count);
  const asOf = isClub
    ? `across ${volunteers} ${cert.volunteer_count === 1 ? "volunteer" : "volunteers"}, as of ${formatDate(cert.issued_at)}`
    : `as of ${formatDate(cert.issued_at)}`;

  centre(page, asOf, hand, 17, H - 406, c.brownMid);



  // ------------------------------------------------------------ signatures
  const sigY = 140;
  const slots = certificateSignatories.length || 1;
  const slotWidth = (W - 200) / slots;

  for (const [i, person] of certificateSignatories.entries()) {
    const cx = 100 + slotWidth * i + slotWidth / 2;
    const lineHalf = Math.min(slotWidth / 2 - 24, 120);

    // The signature itself, when one has been supplied. It sits on the rule
    // rather than above it, the way a real one would.
    if (person.signature) {
      try {
        const file = readFileSync(join(process.cwd(), "public", person.signature));
        const img = person.signature.toLowerCase().endsWith(".png")
          ? await doc.embedPng(file)
          : await doc.embedJpg(file);
        const scale = Math.min(SIG_MAX_W / img.width, SIG_MAX_H / img.height, 1);
        const sw = img.width * scale;
        const sh = img.height * scale;
        page.drawImage(img, { x: cx - sw / 2, y: sigY + 5, width: sw, height: sh });
      } catch {
        // A missing or unreadable signature leaves an empty rule, which is
        // still a usable certificate. It must never fail the download.
      }
    }

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
  }

  // A club's hours are the same hours its members hold personally. Saying so on
  // the document stops a school reading a club certificate plus five personal
  // ones as six separate contributions.
  //
  // It sits below the signatures rather than above them: the band above is
  // occupied by the signature images, which are up to 48pt tall and would be
  // written straight through.
  if (isClub) {
    centre(
      page,
      "This is the club's combined total. Its members also hold their own certificates for the same hours.",
      regular,
      9,
      90,
      c.brownSoft,
    );
  }

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
    cert.subject_name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || (cert.kind === "club" ? "club" : "volunteer");
  return `Hearts4Hands-certificate-${slug}.pdf`;
}
