import { z } from "zod";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  blogCategories,
  volunteerActivities,
} from "./site";

const categoryValues = blogCategories.map((c) => c.value) as [string, ...string[]];
const activityValues = volunteerActivities.map((a) => a.value) as [string, ...string[]];

/** Collapses whitespace and trims — form values arrive with stray newlines. */
const text = (min: number, max: number, label: string) =>
  z
    .string()
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(min, `${label} is required.`)
        .max(max, `${label} must be under ${max} characters.`),
    );

/** Same, but preserves paragraph breaks. */
const longText = (min: number, max: number, label: string) =>
  z
    .string()
    .transform((v) => v.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim())
    .pipe(
      z
        .string()
        .min(min, `${label} needs at least ${min} characters.`)
        .max(max, `${label} must be under ${max.toLocaleString()} characters.`),
    );

const email = z
  .string()
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.email("Please enter a valid email address.").max(200));

const optionalText = (max: number) =>
  z
    .string()
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max))
    .transform((v) => (v.length ? v : null))
    .nullable()
    .catch(null);

/**
 * Anti-spam fields present on every public form:
 *   `website` — a honeypot input hidden from humans; bots fill it in.
 *   `elapsed` — ms since the form mounted; near-instant posts are scripted.
 */
export const antiSpamSchema = z.object({
  website: z.string().max(0, "Submission blocked.").optional().default(""),
  elapsed: z.coerce.number().optional().default(9999),
});

export const MIN_FILL_MS = 2500;

// --- Volunteer ---------------------------------------------------------------

export const volunteerSchema = antiSpamSchema.extend({
  fullName: text(2, 120, "Your name"),
  email,
  ageGroup: optionalText(40),
  country: text(2, 100, "Country"),
  state: optionalText(100),
  city: optionalText(100),
  school: optionalText(140),
  activities: z
    .array(z.enum(activityValues))
    .min(1, "Pick at least one way you'd like to help.")
    .max(activityValues.length),
  hours: z.coerce
    .number({ error: "Hours must be a number." })
    .min(0, "Hours can't be negative.")
    .max(2000, "That's more hours than there are in the year — please double-check.")
    .default(0),
  cardsMade: z.coerce
    .number({ error: "Cards made must be a number." })
    .int("Please enter a whole number of cards.")
    .min(0, "Cards made can't be negative.")
    .max(100000)
    .default(0),
  activityDate: z
    .string()
    .trim()
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Please enter a valid date.")
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .catch(null),
  notes: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(2000, "Please keep notes under 2,000 characters."))
    .transform((v) => (v.length ? v : null))
    .nullable()
    .catch(null),
  consent: z
    .union([z.literal("on"), z.literal("true"), z.literal(true)])
    .refine(Boolean, "Please confirm before submitting."),
});

export type VolunteerInput = z.infer<typeof volunteerSchema>;

export function validateProofFile(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — please keep uploads under 8 MB.`;
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Please upload a photo (JPG, PNG, WEBP, HEIC) or a PDF.";
  }
  return null;
}

// --- Blog submission ---------------------------------------------------------

export const blogSubmissionSchema = antiSpamSchema.extend({
  title: text(3, 160, "A title"),
  category: z.enum(categoryValues, { error: "Please choose a category." }),
  authorName: text(2, 120, "Your name"),
  authorEmail: email,
  authorLocation: optionalText(120),
  body: longText(200, 40000, "Your story"),
  consent: z
    .union([z.literal("on"), z.literal("true"), z.literal(true)])
    .refine(Boolean, "Please confirm before submitting."),
});

export type BlogSubmissionInput = z.infer<typeof blogSubmissionSchema>;

// --- Contact -----------------------------------------------------------------

export const contactTopics = [
  { value: "general", label: "General question" },
  { value: "volunteer", label: "Volunteering" },
  { value: "hospital", label: "Hospital or partner organization" },
  { value: "editor", label: "Blog / story editing" },
  { value: "press", label: "Press or sponsorship" },
] as const;

export const contactSchema = antiSpamSchema.extend({
  name: text(2, 120, "Your name"),
  email,
  topic: z
    .enum(contactTopics.map((t) => t.value) as [string, ...string[]])
    .default("general"),
  subject: optionalText(160),
  message: longText(10, 8000, "Your message"),
});

export type ContactInput = z.infer<typeof contactSchema>;

// --- Admin -------------------------------------------------------------------

export const statsSchema = z.object({
  totalRaised: z.coerce.number().min(0).max(100_000_000),
  materials: z.coerce.number().min(0).max(100_000_000),
  research: z.coerce.number().min(0).max(100_000_000),
  goal: z.coerce.number().min(0).max(100_000_000),
  cardsMade: z.coerce.number().int().min(0).max(10_000_000),
  volunteers: z.coerce.number().int().min(0).max(1_000_000),
  hoursLogged: z.coerce.number().int().min(0).max(10_000_000),
  hospitalsServed: z.coerce.number().int().min(0).max(100_000),
  note: z.string().trim().max(280).optional().default(""),
});

export const publishSchema = z.object({
  submissionId: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug can only use lowercase letters, numbers, and dashes."),
  title: text(3, 160, "Title"),
  category: z.enum(categoryValues),
  authorName: text(2, 120, "Author name"),
  authorLocation: optionalText(120),
  excerpt: z.string().trim().max(400).optional().default(""),
  body: longText(50, 40000, "Body"),
  featured: z.union([z.literal("on"), z.literal("")]).optional(),
  status: z.enum(["draft", "published"]).default("published"),
});

/** Turn a ZodError into `{ fieldName: "first message" }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
