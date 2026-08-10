import { LinkCard, Tag } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { Section, SectionHeading } from "@/components/ui/Section";
import { categoryLabel } from "@/lib/site";
import type { Post } from "@/lib/supabase/types";
import { excerptFrom, formatDate, isoDate } from "@/lib/utils";

export function StoriesPreview({ posts }: { posts: Post[] }) {
  return (
    <Section tone="blush">
      <SectionHeading
        eyebrow="Stories"
        title="Written by volunteers"
        subtitle="Personal experience, caregiving, and plain-language cancer education. Anyone can send one in."
      />

      {posts.length === 0 ? (
        <EmptyState title="The first story is on its way" className="mt-10">
          <p>
            Nothing is published yet. If you have something to say about cancer, caregiving, or what
            helped you, we would like to read it.
          </p>
        </EmptyState>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const published = post.published_at ?? post.created_at;
            return (
              <li key={post.slug} className="h-full">
                <LinkCard
                  href={`/blog/${post.slug}`}
                  label={post.title}
                  seed={post.slug}
                  className="flex h-full flex-col p-6"
                >
                  <div>
                    <Tag>{categoryLabel(post.category)}</Tag>
                  </div>

                  <h3 className="mt-3 text-xl group-hover:text-red-deep">{post.title}</h3>

                  <p className="mt-2 text-brown-mid">
                    {post.excerpt ?? excerptFrom(post.body, 140)}
                  </p>

                  <p className="mt-auto pt-5 font-hand text-base text-brown-soft">
                    {post.author_name}
                    {published ? (
                      <>
                        {" · "}
                        <time dateTime={isoDate(published)}>{formatDate(published)}</time>
                      </>
                    ) : null}
                  </p>
                </LinkCard>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-10 flex justify-center">
        <Button href="/blog" variant="outline">
          Read all the stories
        </Button>
      </div>
    </Section>
  );
}
