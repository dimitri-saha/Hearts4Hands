import { cn, hashFraction } from "@/lib/utils";

/**
 * Initials in place of a headshot.
 *
 * This replaced an illustrated face on the team roster. A generated face is
 * fine for invented placeholder people, but once the names are real, an
 * invented face carries invented information — a skin tone, a hairstyle, an
 * implied gender — attached to somebody who never chose any of it. Initials say
 * "no photo yet" and nothing more.
 *
 * The background tone is seeded from the name, so a grid of them varies and a
 * given person keeps the same colour between renders.
 */
const tones = [
  "bg-blush text-berry",
  "bg-cream text-red-deep",
  "bg-kraft text-brown",
  "bg-blush-deep text-berry",
  "bg-honey/40 text-brown",
] as const;

const sizes = {
  sm: "text-xl sm:text-2xl",
  lg: "text-5xl sm:text-6xl",
} as const;

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function Monogram({
  name,
  size = "lg",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const tone = tones[Math.floor(hashFraction(name) * tones.length) % tones.length];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full w-full items-center justify-center",
        tone,
        sizes[size],
        className,
      )}
    >
      <span className="font-display font-bold tracking-wide">{initialsOf(name)}</span>
    </div>
  );
}
