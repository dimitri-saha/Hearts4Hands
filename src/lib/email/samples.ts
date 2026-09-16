import "server-only";

import { site } from "@/lib/site";
import * as t from "./templates";
import type { BuiltEmail } from "./templates";

/**
 * One sample of every email the application sends, with believable stand-in
 * data, for the preview screen at /admin/emails and the "send me a set" button.
 *
 * Keeping the samples in one list means a new template that isn't added here is
 * visibly missing from the preview, rather than quietly never being looked at.
 */
export type Sample = {
  id: string;
  label: string;
  /** Who receives it in real life. */
  audience: "Volunteer" | "Writer" | "Anyone" | "The team";
  when: string;
  build: () => BuiltEmail;
};

export const emailSamples: Sample[] = [
  {
    id: "hours-logged",
    label: "Hours logged",
    audience: "Volunteer",
    when: "Immediately after somebody logs hours.",
    build: () => t.hoursLogged("Ira", 4, 6),
  },
  {
    id: "hours-approved",
    label: "Hours approved",
    audience: "Volunteer",
    when: "When an admin approves an entry at /admin/volunteers.",
    build: () => t.hoursApproved("Ira", 4, 26.5),
  },
  {
    id: "hours-rejected",
    label: "Hours not counted",
    audience: "Volunteer",
    when: "When an admin rejects an entry. Carries the reviewer's reason.",
    build: () =>
      t.hoursRejected("Ira", 4, "The photo didn't show the cards, so we couldn't check the count."),
  },
  {
    id: "certificate-issued",
    label: "Certificate issued",
    audience: "Volunteer",
    when: "When a volunteer issues a certificate from their dashboard.",
    build: () => t.certificateIssued("Ira", "H4H-7K2PQ-9XR4M", 26.5, 41),
  },
  {
    id: "story-received",
    label: "Story received",
    audience: "Writer",
    when: "Immediately after a story is submitted at /blog/submit.",
    build: () => t.storyReceived("Ira", "The year my brother was in hospital"),
  },
  {
    id: "story-published",
    label: "Story published",
    audience: "Writer",
    when: "When an editor publishes a submitted story.",
    build: () =>
      t.storyPublished("Ira", "The year my brother was in hospital", "the-year-my-brother"),
  },
  {
    id: "message-received",
    label: "Message received",
    audience: "Anyone",
    when: "After somebody uses the contact form.",
    build: () => t.messageReceived("Ira"),
  },
  {
    id: "team-hours",
    label: "Team alert — hours",
    audience: "The team",
    when: `To ${"NOTIFY_EMAIL"} whenever hours are logged.`,
    build: () =>
      t.teamNotification(
        "New hours logged",
        [
          ["Volunteer", "Ira Verma (ira@example.com)"],
          ["Hours", "4"],
          ["Cards", "6"],
          ["Guardian account", "no"],
          ["Proof", "attached"],
        ],
        `${site.url}/admin/volunteers`,
      ),
  },
  {
    id: "team-story",
    label: "Team alert — story",
    audience: "The team",
    when: "To the team inbox whenever a story is submitted.",
    build: () =>
      t.teamNotification(
        "New story submission",
        [
          ["Title", "The year my brother was in hospital"],
          ["Category", "Caregiving"],
          ["From", "Ira Verma <ira@example.com>"],
          ["Length", "4,182 characters"],
        ],
        `${site.url}/admin/stories`,
      ),
  },
  {
    id: "team-message",
    label: "Team alert — message",
    audience: "The team",
    when: "To the team inbox whenever the contact form is used.",
    build: () =>
      t.teamNotification(
        "New message: Partnership",
        [
          ["From", "Ira Verma <ira@example.com>"],
          ["Topic", "Partnership"],
          ["Message", "We run a paediatric ward in Oakland and would love to receive cards."],
        ],
        `${site.url}/admin/messages`,
      ),
  },
];

export function findSample(id: string) {
  return emailSamples.find((s) => s.id === id) ?? null;
}
