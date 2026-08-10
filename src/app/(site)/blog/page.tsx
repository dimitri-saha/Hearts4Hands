import type { Metadata } from "next";
import Link from "next/link";

import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { PostCard } from "@/components/blog/PostCard";
import { HeartRule, TornEdge } from "@/components/illustrations/Dividers";
import { Crayon, OpenBook } from "@/components/illustrations/Objects";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";
import {
  getCategoryCounts,
  getFeaturedPost,
  getPostsByCategory,
  getPublishedPosts,
} from "@/lib/posts";
import { blogCategories, categoryLabel, contact } from "@/lib/site";

/**
 * Stories index — PRD §5.4.
 *
 * Revalidated rather than force-dynamic: a story an editor publishes shows up
 * within five minutes with no redeploy, and the page stays cheap in between.
 */
export const revalidate = 300;

type BlogSearchParams = { category?: string };

/** Only accept a category we actually publish; anything else means "all". */
function normalizeCategory(value?: string): string | null {
  if (!value) return null;
  return blogCategories.some((c) => c.value === value) ? value : null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}): Promise<Metadata> {
  const active = normalizeCategory((await searchParams).category);

  if (!active) {
    return {
      title: "Stories",
      description:
        "Volunteer-written stories about cancer, caregiving, and what the research actually means — plus how to send us yours.",
      alternates: { canonical: "/blog" },
    };
  }

  const label = categoryLabel(active);
  const blurb = blogCategories.find((c) => c.value === active)?.blurb ?? "";
  return {
    title: `${label} stories`,
    description: blurb,
    alternates: { canonical: `/blog?category=${active}` },
  };
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const active = normalizeCategory((await searchParams).category);

  const [all, posts, counts] = await Promise.all([
    getPublishedPosts(),
    getPostsByCategory(active),
    getCategoryCounts(),
  ]);

  // The featured story only leads the page when nothing is filtered — inside a
  // category it would just be a duplicate of the first card.
  const featured = active ? null : await getFeaturedPost();
  const gridPosts = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;

  const activeLabel = active ? categoryLabel(active) : null;

  return (
    <>
      <PageHeader
        eyebrow="Stories"
        title="Stories from people living it"
        intro="Volunteers write about cancer, about caring for someone who has it, and about what the science actually says. No jargon. No tidy endings required."
        illustration={<OpenBook className="h-32 w-44 sm:h-40 sm:w-56" />}
        tone="blush"
        nextTone="paper"
      >
        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
          <Button href="/blog/submit" size="lg">
            Share your story
          </Button>
          <Button href="#stories" variant="outline" size="lg" alt>
            Start reading
          </Button>
        </div>
      </PageHeader>

      <Section tone="paper" id="stories">
        <div className="flex flex-col items-center gap-6">
          <CategoryFilter active={active} counts={counts} total={all.length} />
          {activeLabel ? (
            <p className="font-hand text-lg text-brown-mid">
              Showing {activeLabel.toLowerCase()} stories.{" "}
              <Link
                href="/blog"
                className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
              >
                Show everything
              </Link>
            </p>
          ) : null}
        </div>

        {featured ? (
          <div className="mt-10">
            <h2 className="sr-only">Featured story</h2>
            <PostCard post={featured} featured headingLevel={3} />
          </div>
        ) : null}

        {gridPosts.length > 0 ? (
          <>
            {featured ? <HeartRule className="mt-12" /> : null}
            <h2 className={featured ? "mt-10 text-2xl sm:text-3xl" : "sr-only"}>
              {featured
                ? "More stories"
                : activeLabel
                  ? `${activeLabel} stories`
                  : "All stories"}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <li key={post.slug} className="flex">
                  <PostCard post={post} headingLevel={3} className="w-full" />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {posts.length === 0 ? (
          <EmptyState title="Nothing here yet" className="mt-10">
            <p>
              {activeLabel
                ? `No ${activeLabel.toLowerCase()} stories have been published yet. Yours could be the first one.`
                : "No stories have been published yet. Yours could be the first one."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button href="/blog" variant="outline" size="sm">
                Read all stories
              </Button>
              <Button href="/blog/submit" size="sm">
                Share your story
              </Button>
            </div>
          </EmptyState>
        ) : null}
      </Section>

      <TornEdge color={sectionHex.cream} className="-mt-px" />

      <Section tone="cream">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl text-center md:text-left">
            <SectionHeading
              eyebrow="Your turn"
              title="You don't have to be a writer"
              subtitle="If you have something you'd like other people to read — about being sick, about looking after someone who is, or about something you learned the hard way — send it to us."
              align="left"
              level={2}
            />
            <p className="mt-6 text-brown-mid">
              An editor reads every submission. We may suggest small edits for clarity, and
              we&apos;ll always send them back to you first. Nothing is published without your OK,
              and you can ask to appear under a first name only.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button href="/blog/submit" size="lg">
                Send us your story
              </Button>
              <Button href={`mailto:${contact.editor}`} variant="outline" size="lg" alt>
                Email the editors
              </Button>
            </div>
          </div>

          <div className="shrink-0">
            <Crayon className="h-36 w-12 animate-wiggle-slow sm:h-44 sm:w-14" />
          </div>
        </div>
      </Section>
    </>
  );
}
