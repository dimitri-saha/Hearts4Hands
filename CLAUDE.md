# CLAUDE.md — Hearts4Hands

Guidance for Claude Code (and any future agent) working in this repo.
**Read this before writing code.** It encodes decisions that aren't obvious from the source.

---

## 1. What this is

Marketing + volunteer-ops site for **Hearts4Hands**, a student-led nonprofit that:

1. makes handmade cards for kids in children's hospitals,
2. publishes volunteer-written stories about cancer, caregiving, and education,
3. raises money split between **materials** and **cancer research**.

The product spec is `docs/PRD.md`. Read it once. Section numbers below (§5.2 etc.) refer to it.

### Node

Node is installed **locally, not globally**, at `~/.local/nodejs` with symlinks in `~/.local/bin`.
If `node: command not found`, run:

```bash
export PATH="$HOME/.local/nodejs/bin:$PATH"
```

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, RSC) | `src/` dir, `@/*` → `src/*` |
| Language | TypeScript, `strict` | |
| Styling | Tailwind **v4** | CSS-first config in `src/app/globals.css`. **There is no `tailwind.config.js`** — custom colors/fonts/utilities live in `@theme` and `@utility` blocks |
| Backend | Supabase (Postgres + Auth + Storage) | schema in `supabase/migrations/0001_init.sql` |
| Forms | React 19 server actions + `useActionState` | no client form library |
| Validation | Zod v4 | `src/lib/validation.ts` |
| Email | Resend via `fetch` (optional) | `src/lib/email.ts`, no SDK dependency |
| Hosting | Vercel | |

### Deviations from the PRD — deliberate

The PRD (§7) recommends Squarespace + Google Forms because it assumed no dev resources.
The user specified Next.js/Supabase instead, so:

- **Volunteer sign-up and blog submission are native forms writing to Postgres**, not Google Forms. The PRD's *intent* — no volunteer logins, submissions land somewhere an admin can review and export — is preserved. Supabase's dashboard exports CSV, which covers the "spreadsheet backend" requirement for award tracking.
- **Blog posts live in Postgres with a draft/published flag**, not a manual copy-paste into a site builder. Editor review is a real workflow at `/admin`.
- Everything still out of scope per §6: no volunteer accounts, no on-site payments, no automated awards, no blog comments.

---

## 3. The single most important architectural rule

> **The site must build, deploy, and look finished with no environment variables set.**

Supabase credentials will not exist on day one. Every data path therefore degrades instead of throwing:

| Path | Configured | Not configured |
|---|---|---|
| Blog list / post | reads `posts` | falls back to `src/content/starter-posts.ts` |
| Impact numbers | reads `site_stats` | falls back to `fallbackStats` in `src/lib/site.ts` |
| Any public form | inserts a row | renders normally, returns a warm "not switched on yet, email us" error |
| `/admin` | Supabase Auth | shows setup instructions instead of a broken login |

Check with `isSupabaseConfigured` (reads) / `isSupabaseWritable` (writes) from `src/lib/supabase/env.ts`.
**Never** `throw` on missing env vars, and never let a Supabase error take down a page — log it and return the fallback.

---

## 4. Design system

The brief (§4) is *"a well-illustrated, crayon-drawn children's book"*. Kids in hospitals and their
families are part of the audience, so warmth beats polish. Concretely:

### Colors — `@theme` in `globals.css`

```
paper #fffcf8   paper-deep #fdf7f0   cream #fbf1e6   kraft #f2e2cf
blush #fbe8e4   blush-deep #f7d9d5   pink #f2c3bc    pink-deep #e79a93
red   #d24a5e   red-deep #b03a4e     berry #8d2a3d
brown #4a342a   brown-mid #7a5a47    brown-soft #a78970   brown-faint #d9c6b4
tan #c79a6b     honey #e8c39e        leaf #7fa86a    sky #9cc4d8   sun #f2c14e
```

Use them as normal Tailwind classes: `bg-blush`, `text-berry`, `border-brown`.
White backgrounds, red accents, pink highlights, brown text — per §4.2.
**Light mode only.** Do not add dark-mode variants; they fight the paper metaphor.

### Type — three faces, loaded via `next/font`

- `font-display` → **Baloo 2**. All headings, buttons, labels. Rounded and storybook-ish.
- `font-hand` → **Patrick Hand**. Eyebrows, captions, tags, small asides. The logo's voice.
- `font-body` → **Nunito**. Paragraphs. Set 17px/1.7 by default.

Never mix in a fourth font.

### The crayon vocabulary

Five mechanisms do all the work. Reuse them; don't invent new ones per page.

1. **Wobbly radii** — `rough-1` … `rough-4`, `rough-pill`, `rough-pill-alt`, `rough-blob`.
   Asymmetric `border-radius` so shapes read as hand-cut. `Card` picks one of the four
   deterministically from a `seed` prop so a grid doesn't repeat one silhouette.
2. **Offset flat shadow** — `sticker-shadow`, `sticker-shadow-sm`, `sticker-shadow-red`.
   A hard offset shadow with no blur = paper peeled onto the page. Buttons slide into their
   own shadow on `:active`.
3. **Paper grain** — `paper-grain-overlay` (fixed, whole page, in the root layout) and
   `grain-soft` (per-section). Inline `feTurbulence` data URIs, zero network requests.
4. **SVG crayon filters** — `url(#crayon)`, `#crayon-loose`, `#crayon-tight`, `#crayon-wax`,
   `#paper-shadow`. Defined once by `<CrayonDefs />` in the root layout.
   `feTurbulence` + `feDisplacementMap` pushes every edge along a noise field, so perfect
   curves come out humanly imperfect. **Keep `scale` between 1 and 4** — past that, strokes
   tear apart. Apply to small illustrations only, never to a whole section (perf).
5. **Torn / scalloped section edges** — `TornEdge`, `ScallopEdge`, `WaveEdge` from
   `components/illustrations/Dividers`. Pass the *next* section's background hex via `color`;
   `sectionHex` in `components/ui/Section.tsx` maps tone names to hex.

### Illustrations — draw, don't import

There are no icon libraries and no stock SVGs. Everything in `src/components/illustrations/`
is authored in this repo, in one consistent language: **chunky brown outline (3–4.5px, round
caps and joins), flat warm fill, one or two highlight strokes, crayon filter on the group.**

Available: `Heart` `HeartOutline` `HeartTrio` `PawHeart` `HandsHeart` · `Bear` `BearHead` ·
`GreetingCard` `Crayon` `CrayonBundle` `Envelope` `CoinJar` `OpenBook` `AwardRibbon` `Globe`
`Megaphone` `PaperPlane` · `Sparkle` `Star` `Sun` `Cloud` `Rainbow` `Underline` `CurvedArrow`
`Squiggle` `CheckMark` `CircleScribble` `Tape` · `TornEdge` `ScallopEdge` `WaveEdge` `HeartRule`.

**Prefer composing these over drawing new ones.** If you must add one, match the language above,
put brand hexes through the `ink` object in `illustrations/types.ts`, and spread `a11y(title)`
so it's `aria-hidden` unless given an accessible name.

### Copy tone (§4.4)

Warm, short sentences, plain words. Encouraging, never clinical, never guilt-tripping.
"A hospital room is a strange place to be a kid" — not "Pediatric oncology patients experience
significant psychosocial burden." Avoid exclamation-mark pile-ups. Second person is fine.

---

## 5. Layout of the code

```
src/
  app/
    layout.tsx              root: html/body, fonts, grain overlay, CrayonDefs — NO header/footer
    (site)/                 every public page; its layout.tsx adds header, footer, skip link
      layout.tsx  page.tsx (home)  about/  volunteer/  donate/  contact/
      blog/                 list · [slug] · submit
      error.tsx  not-found.tsx
    admin/                  login + review dashboards (auth-gated, own chrome, force-dynamic)
    actions/public.ts       volunteer / blog / contact server actions
    actions/admin.ts        admin-only server actions
    icon.svg · opengraph-image.tsx · sitemap.ts · robots.ts · error.tsx · not-found.tsx
  components/
    layout/    SiteHeader SiteFooter Logo PageHeader
    ui/        Button Card/LinkCard/Tag Section/SectionHeading Field/Input/Textarea/Select/
               CheckboxRow/Fieldset  FormBits(SubmitButton, AntiSpamFields, FileField,
               CharacterCount)  Feedback(Alert, SuccessPanel, EmptyState)  Stats(StatTile,
               ProgressBar, AllocationBar)
    illustrations/
  content/starter-posts.ts  fallback blog content
  lib/
    site.ts          ALL editable content constants — nav, links, team, categories, fallbacks
    utils.ts         cn, formatters, slugify, hashFraction
    validation.ts    zod schemas + fieldErrors()
    action-state.ts  ActionState shape shared by every form
    posts.ts stats.ts markdown.ts email.ts rate-limit.ts auth.ts
    supabase/        env.ts client.ts server.ts types.ts
  proxy.ts           refreshes the Supabase auth cookie on /admin/* (Next 16 renamed
                     the `middleware` convention to `proxy`)
supabase/migrations/0001_init.sql
```

**`src/lib/site.ts` is the content file.** Nav labels, donation URLs, contact emails, team bios,
blog categories, volunteer activities, PVSA tiers, fallback stats. A non-developer changing copy
should be able to work almost entirely in there. Put new constants there, not inline in a page.

---

## 6. Conventions

- **Server Components by default.** `"use client"` only for: the mobile nav, forms using
  `useActionState`, and the admin login. If a page is a client component, that's a bug.
- **Forms** all follow the same shape:
  ```tsx
  const [state, action] = useActionState(submitX, idleState);
  // state.status: "idle" | "success" | "error"
  // state.errors?.fieldName -> message under the field
  // state.values -> repopulate defaultValue after an error (valueOf/valuesOf helpers)
  ```
  Always include `<AntiSpamFields />` and a `<SubmitButton>`. On success, replace the form with
  `<SuccessPanel>` rather than showing a toast — this audience needs an unambiguous confirmation.
- **Every public form** must: honeypot + min-fill-time (`looksAutomated`), rate limit, zod parse,
  then write. That order. See `app/actions/public.ts`.
- **Security**: public browsers never touch Supabase directly. Reads go through the anon key
  server-side with RLS allowing only published posts + stats; writes go through the service-role
  key inside server actions **after** validation. There are deliberately no public INSERT policies.
  Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client or import `supabase/server.ts` into a
  client component (it's guarded by `server-only`).
- **Markdown** from submissions is parsed and **sanitized** (`lib/markdown.ts`) before render.
  Never `dangerouslySetInnerHTML` raw stored text.
- **Accessibility**: real `<label>`s and `htmlFor`; `aria-invalid` + `aria-describedby` on errored
  fields; decorative SVGs `aria-hidden`; focus-visible ring is a 3px dashed red outline defined
  globally — don't remove it. Body text must stay on `paper`/`cream`/`blush`, never on `pink-deep`
  or `red` (contrast).
- **Images**: `next/image` for raster. `public/logo.jpeg` is the original logo. The header uses the
  redrawn SVG `BearHead`, not the JPEG (the JPEG has a baked-in pink square).

---

## 7. Environment variables

Copy `.env.example` → `.env.local`. Nothing is required to run `npm run dev`.

| Var | Needed for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | reads + admin auth |
| `SUPABASE_SERVICE_ROLE_KEY` | form writes, admin mutations (**server-only, never `NEXT_PUBLIC_`**) |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap, OG |
| `NEXT_PUBLIC_GOFUNDME_URL` / `NEXT_PUBLIC_VENMO_URL` / `NEXT_PUBLIC_VENMO_HANDLE` / `NEXT_PUBLIC_PAYPAL_URL` | Donate page — each channel hides itself when blank |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_EDITOR_EMAIL` / `NEXT_PUBLIC_PARTNERSHIPS_EMAIL` / `NEXT_PUBLIC_INSTAGRAM_URL` | contact + footer |
| `RESEND_API_KEY` / `RESEND_FROM` / `NOTIFY_EMAIL` | confirmation + notification email (optional) |

---

## 8. Supabase setup

1. Create a project → SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.
2. Auth → Providers → Email → **turn off "Enable Sign Ups"** (admin accounts are created by hand).
3. Auth → Users → Add user (auto-confirm) for each editor.
4. SQL Editor:
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```
5. Copy the project URL + anon key + service-role key into env vars.

Tables: `volunteer_signups` · `blog_submissions` · `posts` · `contact_messages` · `site_stats` (single row, id=1) · `admins`.
Storage: private bucket `volunteer-proof` for proof-of-cards uploads; admins read via signed URLs.

---

## 9. Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # must pass before any commit
npm run lint
npx tsc --noEmit     # faster than build for a type check
```

**Always run `npm run build` before declaring work done.** It's the only check that catches
RSC/client boundary violations.

---

## 10. Open questions from the PRD (§9) — current answers

| Question | Status |
|---|---|
| Who reviews volunteer hours, how often? | Any admin, via `/admin/volunteers`. Cadence is a policy decision, not a code one. |
| Who updates the donation total? | Any admin, via `/admin/stats`. Manual by design (§5.3). |
| Blog content guidelines / length? | Enforced minimum 200 chars, max 40,000. Editorial guidance lives on `/blog/submit`. |
| Translated content for international volunteers? | **Not built.** English only. Would need `next-intl` + a locale segment. |
| Custom vs. licensed illustrations? | **Answered: custom.** All artwork is hand-authored SVG in this repo. No licensing exposure. |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## 11. Gotchas learned the hard way

- **Dividers paint only the incoming colour.** `TornEdge`/`ScallopEdge`/`WaveEdge` fill the shape
  with `color` (the *next* section); the area above the shape is transparent. Always pass
  `from={sectionHex[outgoingTone]}` as well, or you get a paper-coloured stripe wherever the
  outgoing band isn't paper. `PageHeader` does this for you.
- **Every page must end on a `tone="paper"` section.** The footer's torn edge has no `from`,
  so it assumes paper above it.
- **`LinkCard` requires `label`.** The overlay link is real and focusable (an `aria-hidden`
  overlay makes the card keyboard-unreachable). Don't put a second `<Link>` to the same href
  inside — style a `<span aria-hidden>` as the "read more" affordance instead. Anything genuinely
  interactive inside the card needs `relative z-20`.
- **Row types in `supabase/types.ts` must be `type`, not `interface`.** Supabase's generics
  require `Record<string, unknown>` compatibility, and interfaces don't get an implicit index
  signature — using `interface` silently collapses every query result to `never`.
- **Satori (`next/og`) doesn't reliably render nested SVG with per-element transforms.** The OG
  image passes its artwork as a base64 data-URI `<img>` instead.
- **Next 16: `params` and `searchParams` are Promises.** Type them as such and `await`.

- **Route groups matter here.** Public pages live in `src/app/(site)/` and get their chrome from
  `(site)/layout.tsx`. `/admin` sits outside that group with its own shell. The root layout holds
  only `<html>`/`<body>`, fonts, the grain overlay, and `<CrayonDefs />`. A new public page goes
  **inside `(site)`**; putting it at `src/app/` gives it no header or footer.
- **Watch for duplicate DOM ids.** A `<Section id="message">` once shadowed a
  `<textarea id="message">`, so `CharacterCount`'s `getElementById` found the section and
  crashed the whole page on `.value.length`. Anchor ids and field ids share one namespace.
