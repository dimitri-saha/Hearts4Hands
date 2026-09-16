import "server-only";

import { contact, site } from "@/lib/site";
import { escapeHtml, renderEmail } from "./layout";

/**
 * Every email this application sends.
 *
 * Each returns a subject, an HTML part and a plain-text part. The text part is
 * not decoration — it is what text-only clients and screen readers read, and a
 * message with no text alternative scores worse with spam filters.
 *
 * The auth emails (confirm sign-up, magic link, password reset) are NOT here.
 * Those are sent by Supabase from templates stored in its dashboard — see
 * `supabase/email-templates/`.
 */

export type BuiltEmail = { subject: string; html: string; text: string };

const team = `— The ${site.name} team`;

/* ------------------------------------------------------------------ people */

export function storyReceived(name: string, title: string): BuiltEmail {
  return {
    subject: `We received your story: ${title}`,
    html: renderEmail({
      heading: "Thank you for sending us your story",
      preheader: `We have "${title}" and an editor will read it.`,
      signOff: `— The ${site.name} editors`,
      blocks: [
        { kind: "lead", text: `Hi ${escapeHtml(name)},` },
        { kind: "p", text: `Thank you for sending us <strong>${escapeHtml(title)}</strong>.` },
        {
          kind: "p",
          text: "An editor reads every submission. If we publish it, we'll email you first with any edits so you can approve them — nothing goes up without your OK. If it isn't the right fit, we'll tell you that too.",
        },
        { kind: "quote", text: "Writing about this stuff takes guts. Thank you for trusting us with it." },
        { kind: "button", label: "Read other stories", href: `${site.url}/blog` },
      ],
    }),
    text: `Hi ${name},

Thank you for sending us "${title}".

An editor reads every submission. If we publish it, we'll email you first with any edits so you can approve them — nothing goes up without your OK. If it isn't the right fit, we'll tell you that too.

Writing about this stuff takes guts. Thank you for trusting us with it.

— The ${site.name} editors
${contact.editor}`,
  };
}

export function messageReceived(name: string): BuiltEmail {
  return {
    subject: `We got your message — ${site.name}`,
    html: renderEmail({
      heading: "We got your message",
      preheader: "Someone will get back to you, usually within a few days.",
      blocks: [
        { kind: "lead", text: `Hi ${escapeHtml(name)},` },
        {
          kind: "p",
          text: "We got your message and someone will get back to you soon — usually within a few days.",
        },
        {
          kind: "small",
          text: "If it's urgent, replying to this email reaches the same inbox.",
        },
      ],
    }),
    text: `Hi ${name},

We got your message and someone will get back to you soon — usually within a few days.

${team}
${site.url}`,
  };
}

export function hoursLogged(name: string, hours: number, cards: number): BuiltEmail {
  const h = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return {
    subject: `We've got your ${h} — ${site.name}`,
    html: renderEmail({
      heading: "Your hours are in the queue",
      preheader: `${h} logged. A real person checks every entry.`,
      blocks: [
        { kind: "lead", text: `Hi ${escapeHtml(name)},` },
        { kind: "p", text: "Thanks for logging what you've done. Here's what we've got:" },
        {
          kind: "panel",
          rows: [
            ["Hours", escapeHtml(String(hours))],
            ["Cards", escapeHtml(String(cards))],
            ["Status", "Waiting to be checked"],
          ],
        },
        {
          kind: "p",
          text: "A real person reads every entry, so give it a couple of weeks. Once it's approved it counts toward your certificate — and you can issue that yourself, any time, from your dashboard.",
        },
        { kind: "button", label: "Go to my dashboard", href: `${site.url}/account` },
      ],
    }),
    text: `Hi ${name},

Thanks for logging what you've done.

  Hours:  ${hours}
  Cards:  ${cards}
  Status: Waiting to be checked

A real person reads every entry, so give it a couple of weeks. Once it's approved it counts toward your certificate, which you can issue yourself any time from your dashboard.

${site.url}/account

${team}`,
  };
}

export function hoursApproved(name: string, hours: number, totalHours: number): BuiltEmail {
  const h = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return {
    subject: `Your ${h} have been approved`,
    html: renderEmail({
      heading: "Approved — nice work",
      preheader: `${h} added to your total.`,
      blocks: [
        { kind: "lead", text: `Hi ${escapeHtml(name)},` },
        { kind: "p", text: `We've checked your ${escapeHtml(h)} and added them to your total.` },
        {
          kind: "panel",
          rows: [
            ["Just approved", escapeHtml(h)],
            ["Your total", `${escapeHtml(String(totalHours))} hours`],
          ],
        },
        {
          kind: "p",
          text: "You can issue a certificate for everything approved so far whenever you like. It carries a code anyone can check, so a school or programme can confirm it without taking your word for it.",
        },
        { kind: "button", label: "Get my certificate", href: `${site.url}/account/certificates` },
      ],
    }),
    text: `Hi ${name},

We've checked your ${h} and added them to your total.

  Just approved: ${h}
  Your total:    ${totalHours} hours

You can issue a certificate for everything approved so far whenever you like:
${site.url}/account/certificates

${team}`,
  };
}

export function hoursRejected(name: string, hours: number, reason: string): BuiltEmail {
  const h = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return {
    subject: `About the ${h} you logged`,
    html: renderEmail({
      heading: "We couldn't count those hours",
      preheader: "Usually it's something small and easily fixed.",
      blocks: [
        { kind: "lead", text: `Hi ${escapeHtml(name)},` },
        {
          kind: "p",
          text: `We weren't able to count the ${escapeHtml(h)} you logged. Here's why:`,
        },
        { kind: "quote", text: escapeHtml(reason) },
        {
          kind: "p",
          text: "This usually means something small — a missing photo, or a date that didn't look right. Log it again with that fixed and we'll take another look. If you think we've got it wrong, just reply to this email.",
        },
        { kind: "button", label: "Log it again", href: `${site.url}/account/hours` },
      ],
    }),
    text: `Hi ${name},

We weren't able to count the ${h} you logged.

Why: ${reason}

This usually means something small — a missing photo, or a date that didn't look right. Log it again with that fixed and we'll take another look. If you think we've got it wrong, just reply to this email.

${site.url}/account/hours

${team}`,
  };
}

export function certificateIssued(
  name: string,
  code: string,
  hours: number,
  cards: number,
): BuiltEmail {
  return {
    subject: `Your ${site.name} certificate (${code})`,
    html: renderEmail({
      heading: "Your certificate is ready",
      preheader: `${hours} hours, certified. Code ${code}.`,
      blocks: [
        { kind: "lead", text: `Hi ${escapeHtml(name)},` },
        { kind: "p", text: "Here's what it says:" },
        {
          kind: "panel",
          rows: [
            ["Hours", escapeHtml(String(hours))],
            ["Cards", escapeHtml(String(cards))],
            ["Code", escapeHtml(code)],
          ],
        },
        {
          kind: "p",
          text: `Anyone can check it at <a href="${site.url}/verify/${encodeURIComponent(code)}" style="color:#b03a4e;">${site.url.replace(/^https?:\/\//, "")}/verify/${escapeHtml(code)}</a> — so a school or programme can confirm it's real without having to take your word for it.`,
        },
        { kind: "button", label: "Download the PDF", href: `${site.url}/account/certificates` },
        {
          kind: "small",
          text: "Certificates are cumulative. Log more hours and you can issue an updated one that replaces this.",
        },
      ],
    }),
    text: `Hi ${name},

Your certificate is ready.

  Hours: ${hours}
  Cards: ${cards}
  Code:  ${code}

Anyone can check it at ${site.url}/verify/${code}

Download the PDF from ${site.url}/account/certificates

Certificates are cumulative — log more hours and you can issue an updated one.

${team}`,
  };
}

export function storyPublished(name: string, title: string, slug: string): BuiltEmail {
  return {
    subject: `Your story is live: ${title}`,
    html: renderEmail({
      heading: "Your story is published",
      preheader: `"${title}" is now on the Hearts4Hands blog.`,
      signOff: `— The ${site.name} editors`,
      blocks: [
        { kind: "lead", text: `Hi ${escapeHtml(name)},` },
        {
          kind: "p",
          text: `<strong>${escapeHtml(title)}</strong> is live on the blog. Thank you for writing it — somebody is going to read this and feel less alone.`,
        },
        { kind: "button", label: "Read it", href: `${site.url}/blog/${slug}` },
        {
          kind: "small",
          text: "Want something changed or taken down? Reply to this email and we'll sort it out.",
        },
      ],
    }),
    text: `Hi ${name},

"${title}" is live on the blog. Thank you for writing it — somebody is going to read this and feel less alone.

${site.url}/blog/${slug}

Want something changed or taken down? Reply to this email and we'll sort it out.

— The ${site.name} editors`,
  };
}

/* -------------------------------------------------------------------- team */

export function teamNotification(title: string, rows: [string, string][], reviewUrl: string) {
  return {
    subject: title,
    html: renderEmail({
      heading: title,
      preheader: rows.map(([k, v]) => `${k}: ${v}`).join(" · ").slice(0, 120),
      signOff: "— Hearts4Hands, automatically",
      blocks: [
        { kind: "panel", rows: rows.map(([k, v]) => [k, escapeHtml(v)] as [string, string]) },
        { kind: "button", label: "Open the review queue", href: reviewUrl },
      ],
    }),
    text:
      rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nReview at ${reviewUrl}`,
  };
}
