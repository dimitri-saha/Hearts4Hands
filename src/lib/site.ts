/**
 * Single source of truth for everything a non-developer might want to change:
 * links, contact addresses, fallback impact numbers, and team bios.
 *
 * Anything here that has a `NEXT_PUBLIC_*` override can be changed from the
 * Vercel dashboard without a code edit. Everything else is a one-line change
 * in this file.
 */

export const site = {
  name: "Hearts4Hands",
  shortName: "heARTs4hands",
  tagline: "Creativity is a form of courage.",
  description:
    "Hearts4Hands is a student-led volunteer initiative making handmade cards for kids in hospitals, sharing stories about cancer, and raising funds for research — one colorful act of kindness at a time.",
  /**
   * Canonical origin, no trailing slash.
   *
   * Used for canonical URLs, the sitemap, OG images, and — critically — the
   * `emailRedirectTo` on every auth email. If this doesn't match a pattern in
   * Supabase's Redirect URLs list, magic links and password resets fail with
   * no visible error, so `www` vs apex has to be exactly right.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hearts4hands.org").replace(/\/+$/, ""),
  locale: "en_US",
} as const;

/** Shown on /privacy. Bump whenever the policy's substance changes. */
export const privacyUpdated = "2026-08-11";

export const contact = {
  general: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@hearts4hands.org",
  editor: process.env.NEXT_PUBLIC_EDITOR_EMAIL ?? "stories@hearts4hands.org",
  partnerships:
    process.env.NEXT_PUBLIC_PARTNERSHIPS_EMAIL ?? "partners@hearts4hands.org",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/hearts4hands",
} as const;

/**
 * Donation destinations. Set these in the environment for launch; the Donate
 * page hides any channel whose link is left blank.
 */
export const donationLinks = {
  gofundme: process.env.NEXT_PUBLIC_GOFUNDME_URL ?? "",
  venmo: process.env.NEXT_PUBLIC_VENMO_URL ?? "",
  venmoHandle: process.env.NEXT_PUBLIC_VENMO_HANDLE ?? "@Hearts4Hands",
  paypal: process.env.NEXT_PUBLIC_PAYPAL_URL ?? "",
} as const;

export type NavItem = { href: string; label: string };

export const mainNav: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/leadership", label: "Leadership" },
  { href: "/blog", label: "Stories" },
  { href: "/contact", label: "Contact" },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Get involved",
    items: [
      { href: "/volunteer", label: "Volunteer with us" },
      { href: "/volunteer#log-hours", label: "Log your hours" },
      { href: "/donate", label: "Donate" },
      { href: "/blog/submit", label: "Share your story" },
      { href: "/leadership#apply", label: "Apply to lead" },
    ],
  },
  {
    heading: "Learn more",
    items: [
      { href: "/about", label: "Our story" },
      { href: "/leadership", label: "The team" },
      { href: "/blog", label: "Stories & education" },
      { href: "/contact", label: "Contact us" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

/**
 * Fallback impact numbers.
 *
 * These render when Supabase has no `site_stats` row yet (or isn't configured),
 * so the site never shows an empty dashboard. Once an admin saves stats at
 * /admin/stats, the live values take over everywhere.
 */
export const fallbackStats = {
  totalRaisedCents: 0,
  materialsCents: 0,
  researchCents: 0,
  goalCents: 500_000,
  cardsMade: 0,
  volunteers: 0,
  hoursLogged: 0,
  hospitalsServed: 0,
  updatedAt: null as string | null,
} as const;

/** Blog categories. The value is stored in the database — do not rename casually. */
export const blogCategories = [
  {
    value: "experience",
    label: "Personal experience",
    blurb: "First-hand stories from people who have faced cancer.",
  },
  {
    value: "caregiving",
    label: "Caregiving",
    blurb: "For the siblings, parents, and friends who show up every day.",
  },
  {
    value: "education",
    label: "Cancer education",
    blurb: "Clear, careful explainers about research, treatment, and prevention.",
  },
] as const;

export type BlogCategory = (typeof blogCategories)[number]["value"];

export function categoryLabel(value: string) {
  return blogCategories.find((c) => c.value === value)?.label ?? "Story";
}

/**
 * Age brackets at sign-up. Three, and each one earns its place:
 *
 *   Under 13     the COPPA gate — the only bracket the code actually branches
 *                on. Switches the account to guardian-held. See UNDER_13.
 *   13 to 17     old enough for their own account, still a minor, so the
 *                consent wording asks them to check with a parent.
 *   18 or older  an adult; none of the minor-specific wording applies.
 *
 * Finer brackets were tried and dropped. Splitting 13–15 from 16–17 mapped to
 * GDPR Article 8's variable consent age (13 in the UK, 16 in Germany) — but
 * nothing in the code acted on it, so it was a question asked for a rule we
 * don't implement. Splitting 18–24 from 25+ was pure curiosity about the
 * volunteer base. Both made a required field longer for no decision it changed.
 *
 * Required, not optional: a "prefer not to say" option would let an under-13
 * walk straight past the gate.
 */
export const ageGroups = ["Under 13", "13 to 17", "18 or older"] as const;

/** The bracket meaning "a minor who holds their own account". */
export const MINOR_13_TO_17 = "13 to 17" as const;

/**
 * The bracket that switches the form into guardian mode.
 *
 * US COPPA applies once a service knowingly collects personal information —
 * name, email, photos — from a child under 13, and requires verifiable
 * parental consent first; a tickbox a child can tick themselves is explicitly
 * not that. The UK/EU equivalent is GDPR Article 8. So we don't collect a
 * under-13's details at all: the adult submitting becomes the contact, and the
 * child's name, email, and school are never asked for or stored.
 */
export const UNDER_13 = "Under 13" as const;

/** Ways to volunteer, shown on the Volunteer page and the home page. */
export const volunteerActivities = [
  {
    value: "cards",
    label: "Make hospital cards",
    blurb:
      "Draw, color, and write cards that get delivered to kids in treatment. All you need is paper and something colorful.",
  },
  {
    value: "fundraising",
    label: "Fundraise",
    blurb:
      "Run a bake sale, an art auction, or a lemonade stand. We will help you plan it and share it.",
  },
  {
    value: "writing",
    label: "Write for the blog",
    blurb:
      "Share your experience, or help other volunteers turn their notes into a published story.",
  },
  {
    value: "outreach",
    label: "Outreach & chapters",
    blurb:
      "Bring Hearts4Hands to your school, connect us with a hospital, or help run a local chapter.",
  },
] as const;

export type VolunteerActivity = (typeof volunteerActivities)[number]["value"];

/**
 * Open leadership positions.
 *
 * Applications run through Google Forms rather than a native form: these are
 * judgement calls on free-text answers that somebody reads, not structured rows
 * that belong in Postgres next to volunteer hours. Paste a new form URL here and
 * the card appears; delete the entry and it's gone.
 *
 * NOTE: the blurbs are placeholder copy — rewrite them before this goes live.
 */
export const leadershipRoles = [
  {
    title: "Chapter President",
    blurb:
      "Start Hearts4Hands at your own school and run it. You recruit the volunteers, run the card-making sessions, organize fundraisers, and keep your chapter's hours logged.",
    url: "https://forms.gle/jFEsbhVeYSTzaJGa7",
  },
  {
    title: "Vice President Intern",
    blurb:
      "Work next to the leadership team on whatever the month needs — events, outreach, helping new chapters find their feet. The best way in if you are not sure which role fits yet.",
    url: "https://forms.gle/YxfZuHe7DDH39iMJ7",
  },
  {
    title: "Social Media Rep",
    blurb:
      "Run our Instagram. Post the cards volunteers send in, write captions that sound like a person wrote them, and help people find us.",
    url: "https://forms.gle/hubxVLVU81fxwbog6",
  },
  {
    title: "Fundraising & Marketing Strategist",
    blurb:
      "Plan the drives that pay for paper, envelopes, and stamps — and for the research money everything left over goes to. Expect to bring flyer ideas, post ideas, and other ways to help us grow.",
    url: "https://forms.gle/PF1KuFfvspYwtR8y9",
  },
  {
    title: "Editor",
    blurb:
      "Read the stories volunteers send in and decide what goes on the blog. Careful, kind reading matters more than a writing background.",
    url: "https://forms.gle/K4j7hrWonjXmix7W9",
  },
] as const;

/**
 * The current leadership roster. This is the single copy — /about links here
 * rather than keeping its own list, because two lists of the same people drift.
 *
 * `photo` is optional. With no photo, `<Portrait>` draws an illustrated stand-in
 * seeded from the name, so a roster with only some headshots still looks
 * deliberate instead of half-finished. To use a real one, drop the file in
 * `public/team/` and set `photo: "/team/name.jpg"`.
 */
export type LeaderProfile = {
  name: string;
  role: string;
  location?: string;
  /** Optional. A card without one just shows name, role and place. */
  bio?: string;
  photo?: string;
};

export const leadershipTeam: LeaderProfile[] = [
  {
    name: "Ira Verma",
    role: "Co-President",
    location: "San Ramon, CA",
    photo: "/team/Ira_Verma.jpg",
  },
  {
    name: "Preethika Prabhakaran",
    role: "Co-President",
    location: "San Ramon, CA",
    photo: "/team/Preethika_Prabhakaran.jpg",
  },
  {
    name: "Nishna Nadipally",
    role: "Vice President",
    location: "San Ramon, CA",
    photo: "/team/Nishna_Nadipally.jpg",
  },
  {
    name: "Dimitri Saha",
    role: "Treasurer and Tech Lead",
    location: "San Ramon, CA",
  },
  {
    name: "Varshini Anupalli",
    role: "Social Media Head",
    location: "San Ramon, CA",
    photo: "/team/Varshini_Anupalli.jpg",
  },
];

/**
 * Who signs the certificates.
 *
 * Printed under the signature lines on every generated PDF. Two slots is the
 * intended shape; the layout divides the width by however many are listed, so
 * one or three also work.
 *
 * TODO: these are placeholders until the club presidents' details are in.
 */
export type Signatory = {
  name: string;
  role: string;
  /**
   * Path to a scanned signature inside `public/`, e.g. "signatures/ira.png".
   * Leave it off and the certificate prints an empty rule, which is still a
   * usable document — so an unsigned slot never blocks a download.
   */
  signature?: string;
};

export const certificateSignatories: Signatory[] = [
  {
    name: "Ira Verma",
    role: "Co-President, Hearts4Hands",
    signature: "signatures/Ira_Verma.png",
  },
  {
    name: "Preethika Prabhakaran",
    role: "Co-President, Hearts4Hands",
    signature: "signatures/Preethika_Prabhakaran.png",
  },
];

/** Editable in-repo content — no CMS needed for the About page. */
export const milestones = [
  {
    year: "The spark",
    title: "One card at a time",
    body: "Hearts4Hands began with a simple idea: a kid in a hospital bed should get mail that makes them laugh.",
  },
  {
    year: "Growing",
    title: "Volunteers everywhere",
    body: "Students from different countries started making cards on their own kitchen tables and mailing photos of them in.",
  },
  {
    year: "Now",
    title: "Cards, stories, and research",
    body: "We make cards, publish volunteer-written stories about cancer, and raise money that goes straight to materials and research.",
  },
] as const;

/** Maximum upload size for volunteer proof photos, in bytes. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;
