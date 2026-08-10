import { HandsHeart, HeartTrio } from "@/components/illustrations/Hearts";
import { OpenBook } from "@/components/illustrations/Objects";

/**
 * One decorative illustration per blog category, so a story page and a story
 * card carry the same visual cue without needing per-post artwork.
 *
 * Cases match `blogCategories` in `src/lib/site.ts`. Anything unrecognised
 * falls back to the heart trio rather than rendering nothing.
 */
export function CategoryArt({
  category,
  className,
  title,
}: {
  category: string;
  className?: string;
  title?: string;
}) {
  switch (category) {
    case "caregiving":
      return <HandsHeart className={className} title={title} />;
    case "education":
      return <OpenBook className={className} title={title} />;
    default:
      return <HeartTrio className={className} title={title} />;
  }
}

/** Tag colour per category — a quiet way to tell the three strands apart. */
export function categoryTagTone(category: string): "pink" | "leaf" | "brown" {
  if (category === "caregiving") return "leaf";
  if (category === "education") return "brown";
  return "pink";
}
