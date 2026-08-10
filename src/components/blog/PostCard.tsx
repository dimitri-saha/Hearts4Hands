import { LinkCard, Tag } from "@/components/ui/Card";
import { CategoryArt, categoryTagTone } from "@/components/blog/category-art";
import { toPlainText } from "@/lib/markdown";
import { categoryLabel } from "@/lib/site";
import type { Post } from "@/lib/supabase/types";
import { cn, excerptFrom, formatDate, isoDate, readingTime } from "@/lib/utils";

/**
 * A single story, as a hand-cut card.
 *
 * `seed={post.slug}` is what keeps a grid from looking machine-made — Card
 * picks one of four wobbly silhouettes from it. Used by the Stories index and
 * the "keep reading" row; the home page can drop it in as-is.
 *
 * The whole card is the link (see LinkCard), so the title is plain text here —
 * a second link would just be a duplicate stop for keyboard users.
 */
export function PostCard({
  post,
  featured = false,
  headingLevel = 3,
  className,
}: {
  post: Post;
  /** Large horizontal treatment for the lead story. */
  featured?: boolean;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const excerpt = post.excerpt ?? excerptFrom(post.body);
  const minutes = readingTime(toPlainText(post.body));
  const published = post.published_at;

  const titleClasses =
    "decoration-pink-deep decoration-[3px] underline-offset-[6px] group-hover:underline";

  const meta = (
    <p className="mt-4 font-hand text-base text-brown-mid">
      <span className="text-berry">{post.author_name}</span>
      {post.author_location ? <span> · {post.author_location}</span> : null}
      {published ? (
        <>
          {" · "}
          <time dateTime={isoDate(published)}>{formatDate(published)}</time>
        </>
      ) : null}
      {" · "}
      {minutes} min read
    </p>
  );

  if (featured) {
    return (
      <LinkCard
        href={`/blog/${post.slug}`}
        label={`Read: ${post.title}`}
        seed={post.slug}
        tone="cream"
        className={cn("overflow-hidden", className)}
      >
        <div className="grid gap-0 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="order-2 p-6 sm:p-8 md:order-1">
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="red">Featured story</Tag>
              <Tag tone={categoryTagTone(post.category)}>{categoryLabel(post.category)}</Tag>
            </div>
            <Heading className="mt-4 text-2xl sm:text-3xl lg:text-4xl">
              <span className={titleClasses}>{post.title}</span>
            </Heading>
            <p className="mt-3 text-lg text-brown-mid">{excerpt}</p>
            {meta}
            <p className="mt-5 font-display font-bold text-red-deep" aria-hidden="true">
              Read the story →
            </p>
          </div>

          <div className="order-1 flex items-center justify-center bg-blush px-6 py-8 md:order-2">
            <CategoryArt category={post.category} className="h-28 w-36 animate-float" />
          </div>
        </div>
      </LinkCard>
    );
  }

  return (
    <LinkCard
      href={`/blog/${post.slug}`}
      label={`Read: ${post.title}`}
      seed={post.slug}
      className={cn("flex h-full flex-col p-6", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <Tag tone={categoryTagTone(post.category)}>{categoryLabel(post.category)}</Tag>
        <CategoryArt category={post.category} className="h-9 w-11 shrink-0 opacity-80" />
      </div>

      <Heading className="mt-4 text-xl sm:text-2xl">
        <span className={titleClasses}>{post.title}</span>
      </Heading>

      <p className="mt-2.5 text-brown-mid">{excerpt}</p>

      <div className="mt-auto">{meta}</div>
    </LinkCard>
  );
}
