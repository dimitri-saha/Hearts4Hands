import type { Post } from "@/lib/supabase/types";

/**
 * Starter posts.
 *
 * These render on the blog only while the `posts` table is empty or Supabase
 * isn't configured yet, so the site never launches with a blank Stories page.
 * The moment an editor publishes a real post, these disappear entirely.
 *
 * To retire them permanently, delete this file's entries and the fallback
 * branch in `src/lib/posts.ts`.
 */

const iso = (d: string) => new Date(`${d}T12:00:00Z`).toISOString();

function post(p: Omit<Post, "created_at" | "updated_at" | "status" | "submission_id" | "id"> & { id: string }): Post {
  return {
    ...p,
    created_at: p.published_at ?? iso("2026-01-01"),
    updated_at: p.published_at ?? iso("2026-01-01"),
    status: "published",
    submission_id: null,
  };
}

export const starterPosts: Post[] = [
  post({
    id: "starter-what-is-hearts4hands",
    slug: "why-we-make-cards",
    title: "Why we make cards",
    category: "experience",
    author_name: "The Hearts4Hands team",
    author_location: null,
    featured: true,
    published_at: iso("2026-06-02"),
    excerpt:
      "A hospital room is a strange place to be a kid. A card is a small, stubborn reminder that the outside world is still thinking about you.",
    body: `A hospital room is a strange place to be a kid.

The lights hum. The days blur. Someone is always checking something. And in the middle of all of it, there is a person who would much rather be at recess.

We can't fix that. What we can do is send mail.

## What a card actually does

A card is small. It takes fifteen minutes and costs almost nothing. But it does something that a lot of bigger, more expensive things can't: it says *someone who has never met you spent their afternoon thinking about you.*

Nurses tell us the cards end up taped to the wall by the bed. They stay there for weeks. Kids read them to their visitors. Some kids write back.

## What we look for in a card

We are not looking for great art. We have never once been looking for great art.

- **Color.** Lots of it. Crayon, marker, colored pencil — whatever is in the drawer.
- **Something to look at twice.** A dog wearing a hat. A very tall cake. A dinosaur who is also a firefighter.
- **A short, warm note.** "I hope today is a good day" beats a paragraph every time.

## What we leave out

- No "get well soon." Some of these kids will be in treatment for a long time, and that phrase can land like a deadline.
- No glitter. Hospitals ask us not to — it gets everywhere, including places it really shouldn't.
- No mention of specific illnesses, and no religious messages, so every card works for every kid.

If you have paper and something colorful, you are already qualified. [Start here.](/volunteer)`,
  }),
  post({
    id: "starter-caregiving",
    slug: "notes-for-the-sibling-in-the-waiting-room",
    title: "Notes for the sibling in the waiting room",
    category: "caregiving",
    author_name: "The Hearts4Hands team",
    author_location: null,
    featured: false,
    published_at: iso("2026-05-18"),
    excerpt:
      "When someone in your family gets sick, a lot of attention moves. If you're the sibling, here are a few things worth hearing.",
    body: `When someone in your family is diagnosed with cancer, a lot of attention moves at once — toward appointments, toward scans, toward the person who is sick.

If you are the brother or the sister, you might find yourself in a lot of waiting rooms.

## A few things that are true

**You are allowed to be tired of it.** Loving someone and being worn out by their illness are not opposites. Both can be true on the same Tuesday.

**You do not have to be the easy one.** A lot of siblings quietly decide to stop needing things. That is a generous instinct, and it is not sustainable. Needing things is allowed.

**Small normal is still normal.** A soccer practice, a bad movie, a group chat. These are not betrayals of the person who is sick. They are how you stay a person.

## Things that help

- Ask one adult to be *your* person — someone whose job is to check on you specifically.
- Keep one thing on the calendar every week that has nothing to do with the hospital.
- Write things down. Not for anyone else. Just so it stops rattling around.

## If you want to write about it

We publish stories from siblings, and they are some of the most-read things on this site. You do not have to be a writer. You do not have to have a tidy ending.

[Send us your story.](/blog/submit) An editor reads every submission, and nothing goes up without your OK.`,
  }),
  post({
    id: "starter-education",
    slug: "where-cancer-research-money-actually-goes",
    title: "Where cancer research money actually goes",
    category: "education",
    author_name: "The Hearts4Hands team",
    author_location: null,
    featured: false,
    published_at: iso("2026-04-27"),
    excerpt:
      "\"Funding research\" sounds abstract. Here is a plain-language walk through what a donated dollar actually buys.",
    body: `"We're raising money for cancer research" is a sentence people nod along to without picturing anything specific. So here is the specific version.

## Research happens in stages

**Basic research** asks *how does this even work?* Scientists study cells in a lab to understand why a cancer grows, or why it resists a drug. Nothing here becomes a treatment for years. Almost every treatment that exists started here.

**Translational research** takes a lab finding and asks *could this be a medicine?* This is where a promising molecule either survives contact with reality or quietly doesn't.

**Clinical trials** test a treatment in people, in phases, starting very small. Phase I checks safety. Phase II checks whether it does anything. Phase III compares it to the current best option.

**Implementation** is the unglamorous last mile: making sure the treatment reaches people who aren't near a major research hospital.

## What a small donation actually funds

Small donations rarely fund a whole trial. What they do fund is real:

- Lab supplies — reagents, culture plates, the consumable stuff a lab burns through weekly
- Stipends for student and early-career researchers
- Travel and childcare grants so families can actually get to a trial site
- Sample and data collection that later studies build on

## Why childhood cancers need this specifically

Childhood cancers are, thankfully, rare. Rare also means a smaller commercial incentive to develop drugs for them, and fewer eligible patients per trial. Philanthropic funding fills gaps that markets don't.

## How we split what we raise

Every dollar we raise goes to one of two places, and we publish the split: **materials** (paper, envelopes, postage — the cards themselves) and **research**, which we grant to established cancer research organizations.

You can see the current breakdown on the [Donate page](/donate).`,
  }),
];

export const hasStarterContentOnly = (posts: Post[]) =>
  posts.length > 0 && posts.every((p) => p.id.startsWith("starter-"));
