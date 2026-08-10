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
  text: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, text, replyTo }: SendArgs): Promise<boolean> {
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
export async function notifyTeam(subject: string, text: string, replyTo?: string) {
  return sendEmail({ to: NOTIFY, subject: `[${site.name}] ${subject}`, text, replyTo });
}

export const emailTemplates = {
  volunteerConfirmation(name: string, hours: number) {
    return `Hi ${name},

Thanks for signing up with ${site.name}! We've got your submission${
      hours > 0 ? ` — including ${hours} hour${hours === 1 ? "" : "s"} logged` : ""
    }.

A real person reviews every submission, usually within a week. If you uploaded a photo of your cards, that gets checked at the same time and counted toward volunteer award tracking.

In the meantime:
• Card-making guide: ${site.url}/volunteer
• Share your story: ${site.url}/blog/submit

Thank you for making something for someone who needs it.

— The ${site.name} team
${site.url}`;
  },

  blogConfirmation(name: string, title: string) {
    return `Hi ${name},

Thank you for sending us "${title}".

An editor reads every submission. If we publish it, we'll email you first with any edits so you can approve them — nothing goes up without your OK. If it isn't the right fit, we'll tell you that too.

Writing about this stuff takes guts. Thank you for trusting us with it.

— The ${site.name} editors
${contact.editor}`;
  },

  contactConfirmation(name: string) {
    return `Hi ${name},

We got your message and someone will get back to you soon — usually within a few days.

— The ${site.name} team
${site.url}`;
  },
};
