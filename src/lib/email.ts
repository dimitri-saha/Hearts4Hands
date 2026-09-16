import "server-only";

import { contact, site } from "./site";

/**
 * Optional transactional email via Resend.
 *
 * Every call is fire-and-forget and fails soft: if `RESEND_API_KEY` is unset —
 * which it will be on day one — the site still works, and submissions are
 * still saved. Confirmation email is a nice-to-have layered on top of the
 * on-page confirmation, never a prerequisite for it (PRD §5.2).
 */

const API_KEY = process.env.RESEND_API_KEY?.trim() ?? "";
const FROM = process.env.RESEND_FROM?.trim() || `${site.name} <onboarding@resend.dev>`;
const NOTIFY = process.env.NOTIFY_EMAIL?.trim() || contact.general;

export const isEmailConfigured = Boolean(API_KEY);

type SendArgs = {
  to: string | string[];
  subject: string;
  /** Always send one. Text-only clients and screen readers read this, and a message without it scores worse with spam filters. */
  text: string;
  html?: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, text, html, replyTo }: SendArgs): Promise<boolean> {
  if (!API_KEY) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        ...(html ? { html } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      console.error("[email] send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send threw:", error);
    return false;
  }
}

/** Ping the team inbox that something new needs review. */
export async function notifyTeam(
  subject: string,
  rows: [string, string][],
  reviewUrl: string,
  replyTo?: string,
) {
  const { teamNotification } = await import("./email/templates");
  const built = teamNotification(subject, rows, reviewUrl);
  return sendEmail({
    to: NOTIFY,
    subject: `[${site.name}] ${subject}`,
    text: built.text,
    html: built.html,
    replyTo,
  });
}

/** Sends a prebuilt template from `email/templates`. */
export async function sendBuilt(
  to: string,
  built: { subject: string; html: string; text: string },
  replyTo?: string,
) {
  return sendEmail({ to, subject: built.subject, text: built.text, html: built.html, replyTo });
}
