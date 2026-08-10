import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, letting later Tailwind utilities win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** `$12,480` — donation figures are always shown whole, never with cents. */
export function formatCurrency(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(cents) / 100);
}

/** `1,240` */
export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

/** `March 4, 2026` */
export function formatDate(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** ISO date for <time dateTime>. */
export function isoDate(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/** "A Card for Every Kid" -> "a-card-for-every-kid" */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Rough read time, rounded up, minimum one minute. */
export function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** First ~180 characters of body copy, cut on a word boundary. */
export function excerptFrom(body: string, length = 180) {
  const plain = body
    .replace(/[#*_>`~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= length) return plain;
  return `${plain.slice(0, plain.lastIndexOf(" ", length))}…`;
}

/**
 * Deterministic 0..1 from a string. Used to vary illustration tilt/seed per
 * item so repeated cards don't look mechanically identical.
 */
export function hashFraction(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Pick a stable item from a list based on a seed string. */
export function pickBySeed<T>(items: readonly T[], seed: string): T {
  return items[Math.floor(hashFraction(seed) * items.length) % items.length];
}
