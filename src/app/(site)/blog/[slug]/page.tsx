import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryArt, categoryTagTone } from "@/components/blog/category-art";
import { PostCard } from "@/components/blog/PostCard";
import { HeartRule, TornEdge } from "@/components/illustrations/Dividers";
import { Envelope } from "@/components/illustrations/Objects";
import { Button } from "@/components/ui/Button";
import { Card, Tag } from "@/components/ui/Card";
import { Section, SectionHeading, sectionHex } from "@/components/ui/Section";
import { renderMarkdown, toPlainText } from "@/lib/markdown";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { categoryLabel, contact, site } from "@/lib/site";
import { excerptFrom, formatDate, isoDate, readingTime } from "@/lib/utils";

/** Same as the index: published stories appear within five minutes. */
export const revalidate = 300;

type PostParams = { params: Promise<{ slug: string }> };

function descriptionFor(excerpt: string | null, body: string) {
  return excerpt ?? excerptFrom(toPlainText(body));
}

export async function generateMetadata({ params }: PostParams): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Story not found", robots: { index: false, follow: true } };
  }

  const description = descriptionFor(post.excerpt, post.body);

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: [post.author_name],
      section: categoryLabel(post.category),
    },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function PostPage({ params }: PostParams) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // `renderMarkdown` parses and then sanitizes against an allow-list
  // (see src/lib/markdown.ts), which is why this is safe to inject directly.
  const html = await renderMarkdown(post.body);
  const related = await getRelatedPosts(post, 2);
  const minutes = readingTime(toPlainText(post.body));

  return (
    <>
      {/* --- Header band ------------------------------------------------- */}
      <div className="relative">
        <div className="relative overflow-hidden bg-blush grain-soft px-5 pt-8 pb-14 sm:px-8 sm:pt-10">
          <div className="relative mx-auto w-full max-w-4xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-hand text-lg text-red-deep hover:text-berry"
            >
              <span aria-hidden="true">←</span> All stories
            </Link>

            <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <Tag tone={categoryTagTone(post.category)}>{categoryLabel(post.category)}</Tag>

                <h1 id="story-title" className="mt-4 text-3xl sm:text-4xl lg:text-5xl">
                  {post.title}
                </h1>

                <p className="mt-5 font-hand text-lg text-brown-mid">
                  <span className="text-berry">By {post.author_name}</span>
                  {post.author_location ? <span> · {post.author_location}</span> : null}
                </p>
                <p className="font-hand text-lg text-brown-mid">
                  {post.published_at ? (
                    <>
                      <time dateTime={isoDate(post.published_at)}>
                        {formatDate(post.published_at)}
                      </time>
                      {" · "}
                    </>
                  ) : null}
                  {minutes} min read
                </p>
              </div>

              <div
                className="hidden shrink-0 animate-float md:block"
                style={{ ["--tilt" as string]: "-3deg" }}
              >
                <CategoryArt category={post.category} className="h-28 w-40" />
              </div>
            </div>
          </div>
        </div>

        <TornEdge color={sectionHex.paper} className="-mt-px" />
      </div>

      {/* --- Body ---------------------------------------------------------- */}
      <Section tone="paper" width="narrow">
        <div className="mx-auto max-w-[68ch]">
          <article
            aria-labelledby="story-title"
            className="prose prose-lg prose-storybook max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <HeartRule className="mt-12" />

          {/* Calm, plain footer note. No hotlines we can't stand behind, no
              medical advice — just a person to email. */}
          <div className="mt-10 rough-2 border-2 border-brown-faint bg-cream px-5 py-5">
            <p className="font-display text-lg font-bold text-berry">
              If you&apos;re going through this too
            </p>
            <p className="mt-1.5 text-brown-mid">
              Everything here is one person&apos;s own experience, not medical advice — for
              anything about your health or treatment, your care team is the right place to ask.
              If you just want to tell someone, you can write to us at{" "}
              <a
                className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
                href={`mailto:${contact.editor}`}
              >
                {contact.editor}
              </a>
              . A real person reads it. You don&apos;t have to be sending us a story.
            </p>
          </div>

          {/* --- Byline card ------------------------------------------------ */}
          <Card
            seed={`${post.slug}-author`}
            tone="blush"
            className="mt-8 flex items-center gap-5 p-5 sm:p-6"
          >
            <CategoryArt
              category={post.category}
              className="h-16 w-20 shrink-0 sm:h-20 sm:w-24"
            />
            <div>
              <p className="font-hand text-lg text-red-deep">Written by</p>
              <p className="font-display text-xl font-bold text-berry">{post.author_name}</p>
              {post.author_location ? (
                <p className="text-brown-mid">{post.author_location}</p>
              ) : null}
              <p className="mt-2 text-sm text-brown-mid">
                A Hearts4Hands volunteer. Stories are shared with their author&apos;s permission.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* --- Keep reading --------------------------------------------------- */}
      {related.length > 0 ? (
        <>
          <TornEdge color={sectionHex.cream} className="-mt-px" />
          <Section tone="cream">
            <SectionHeading
              eyebrow="Keep reading"
              title="More from our volunteers"
              align="center"
              level={2}
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug} className="flex">
                  <PostCard post={item} headingLevel={3} className="w-full" />
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <Button href="/blog" variant="outline">
                Browse all stories
              </Button>
            </div>
          </Section>
          <TornEdge color={sectionHex.blush} className="-mt-px" />
        </>
      ) : (
        <TornEdge color={sectionHex.blush} className="-mt-px" />
      )}

      {/* --- Submit CTA ------------------------------------------------------ */}
      <Section tone="blush" width="narrow">
        <div className="flex flex-col items-center gap-6 text-center">
          <Envelope className="h-20 w-28" />
          <h2 className="text-2xl sm:text-3xl">Have a story of your own?</h2>
          <p className="max-w-xl text-brown-mid">
            You don&apos;t have to be a writer, and it doesn&apos;t have to be finished. An editor
            reads everything that comes in, and nothing goes live without your OK.
          </p>
          <Button href="/blog/submit" size="lg">
            Share your story
          </Button>
        </div>
      </Section>
    </>
  );
}
