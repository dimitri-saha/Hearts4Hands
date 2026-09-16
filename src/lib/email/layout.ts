import "server-only";

import { contact, site } from "@/lib/site";

/**
 * The shell every Hearts4Hands email is poured into.
 *
 * Email HTML is not web HTML. The rules that shape this file:
 *
 *   - **Tables, not flexbox.** Outlook renders through Word's engine, which
 *     knows neither flex nor grid.
 *   - **Inline styles.** Gmail strips most of `<style>`, so anything that must
 *     survive is written on the element.
 *   - **No webfonts.** Gmail ignores them entirely. Baloo 2 is listed first for
 *     the few clients that do load it, then a rounded-ish fallback stack, so a
 *     mail that can't have the brand face still doesn't land in Times New Roman.
 *   - **Absolute image URLs.** A mail client has no origin to resolve against.
 *   - **600px.** Still the width that survives every client and phone.
 *
 * Every template also ships a plain-text part. That is not a formality: it is
 * what screen readers and text-only clients read, and a mail with no text part
 * scores worse with spam filters.
 */

const DISPLAY =
  "'Baloo 2', 'Trebuchet MS', 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif";
const BODY = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

const ink = {
  paper: "#fffcf8",
  cream: "#fbf1e6",
  blush: "#fbe8e4",
  kraft: "#f2e2cf",
  brown: "#4a342a",
  brownMid: "#7a5a47",
  brownSoft: "#a78970",
  red: "#d24a5e",
  redDeep: "#b03a4e",
  berry: "#8d2a3d",
  pinkDeep: "#e79a93",
};

export type EmailBlock =
  | { kind: "p"; text: string }
  | { kind: "lead"; text: string }
  | { kind: "button"; label: string; href: string }
  | { kind: "panel"; title?: string; rows: [string, string][] }
  | { kind: "quote"; text: string }
  | { kind: "small"; text: string };

/** A button that survives Outlook: a table cell with a background, not a styled <a>. */
function button(label: string, href: string) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px auto 6px;">
    <tr>
      <td align="center" bgcolor="${ink.red}" style="border-radius:26px;">
        <a href="${href}"
           style="display:inline-block;padding:14px 34px;font-family:${DISPLAY};font-size:17px;
                  font-weight:700;color:#fffcf8;text-decoration:none;border-radius:26px;
                  border:2px solid ${ink.brown};">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function renderBlock(b: EmailBlock): string {
  switch (b.kind) {
    case "lead":
      return `<p style="margin:0 0 18px;font-family:${BODY};font-size:18px;line-height:1.65;color:${ink.brown};">${b.text}</p>`;
    case "p":
      return `<p style="margin:0 0 16px;font-family:${BODY};font-size:16px;line-height:1.7;color:${ink.brown};">${b.text}</p>`;
    case "small":
      return `<p style="margin:0 0 12px;font-family:${BODY};font-size:13.5px;line-height:1.6;color:${ink.brownSoft};">${b.text}</p>`;
    case "quote":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
        <tr><td style="border-left:4px solid ${ink.pinkDeep};padding:6px 0 6px 16px;
            font-family:${BODY};font-size:16px;line-height:1.65;color:${ink.brownMid};">${b.text}</td></tr>
      </table>`;
    case "button":
      return button(b.label, b.href);
    case "panel":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin:4px 0 20px;background:${ink.cream};border:2px solid ${ink.kraft};border-radius:14px;">
        <tr><td style="padding:16px 18px;">
          ${b.title ? `<p style="margin:0 0 10px;font-family:${DISPLAY};font-size:15px;font-weight:700;color:${ink.berry};">${escapeHtml(b.title)}</p>` : ""}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${b.rows
              .map(
                ([k, v]) => `<tr>
              <td style="padding:3px 12px 3px 0;font-family:${BODY};font-size:14px;color:${ink.brownSoft};white-space:nowrap;vertical-align:top;">${escapeHtml(k)}</td>
              <td style="padding:3px 0;font-family:${BODY};font-size:14px;color:${ink.brown};font-weight:600;">${v}</td>
            </tr>`,
              )
              .join("")}
          </table>
        </td></tr>
      </table>`;
  }
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderEmail({
  heading,
  preheader,
  blocks,
  signOff = `— The ${site.name} team`,
}: {
  heading: string;
  /** The grey line clients show after the subject. Without it they scrape the first words of the body. */
  preheader: string;
  blocks: EmailBlock[];
  signOff?: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${ink.blush};">
<div style="display:none;font-size:1px;color:${ink.blush};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${ink.blush};">
  <tr><td align="center" style="padding:28px 14px;">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
           style="width:100%;max-width:600px;background:${ink.paper};border:2px solid ${ink.brown};border-radius:20px;overflow:hidden;">

      <tr>
        <td align="center" style="padding:26px 24px 6px;">
          <img src="${site.url}/logo-print.jpg" width="112" height="110" alt="${escapeHtml(site.name)}"
               style="display:block;border:0;border-radius:12px;">
        </td>
      </tr>

      <tr>
        <td style="padding:8px 34px 0;">
          <h1 style="margin:0 0 18px;font-family:${DISPLAY};font-size:26px;line-height:1.3;
                     font-weight:700;color:${ink.berry};text-align:center;">${escapeHtml(heading)}</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:0 34px 8px;">
          ${blocks.map(renderBlock).join("\n")}
        </td>
      </tr>

      <tr>
        <td style="padding:10px 34px 28px;">
          <p style="margin:18px 0 0;font-family:${BODY};font-size:16px;color:${ink.brownMid};">${escapeHtml(signOff)}</p>
        </td>
      </tr>

      <tr>
        <td style="background:${ink.kraft};padding:20px 34px;">
          <p style="margin:0 0 6px;font-family:${DISPLAY};font-size:17px;color:${ink.redDeep};">heARTs4hAnds</p>
          <p style="margin:0 0 10px;font-family:${BODY};font-size:13px;line-height:1.6;color:${ink.brownMid};">
            ${escapeHtml(site.tagline)} We make cards for kids in hospitals, share stories about cancer, and raise money for research.
          </p>
          <p style="margin:0;font-family:${BODY};font-size:13px;color:${ink.brownMid};">
            <a href="${site.url}" style="color:${ink.redDeep};text-decoration:underline;">${site.url.replace(/^https?:\/\//, "")}</a>
            &nbsp;·&nbsp;
            <a href="mailto:${contact.general}" style="color:${ink.redDeep};text-decoration:underline;">${contact.general}</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
