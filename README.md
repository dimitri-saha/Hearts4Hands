# Hearts4Hands

The website for **Hearts4Hands** — a student-led volunteer initiative that makes handmade cards
for kids in children's hospitals, publishes volunteer-written stories about cancer and caregiving,
and raises money split between card materials and cancer research.

> *"Creativity is a form of courage."*

Product spec: [`docs/PRD.md`](docs/PRD.md) · Developer/agent guide: [`CLAUDE.md`](CLAUDE.md)

---

## What's in here

| Area | Route | What it does |
|---|---|---|
| Home | `/` | Mission, live impact numbers, what we do, recent stories, donate band |
| About | `/about` | Story, milestones, values, team, who we serve |
| Volunteer | `/volunteer` | Ways to help, how to make a card, award info, **sign-up + hour log form** |
| Donate | `/donate` | Running total, materials/research split, links out to GoFundMe / Venmo / PayPal |
| Stories | `/blog` · `/blog/[slug]` · `/blog/submit` | Published posts, category filters, submission form |
| Contact | `/contact` | Who to email, general contact form, partner info |
| Privacy | `/privacy` | What's collected, retention periods, deletion requests |
| Admin | `/admin` | Editor sign-in, review volunteer hours, publish stories, edit impact numbers, read messages |

**No payment processing on-site** and **no volunteer logins** — both are out of scope per PRD §6.
Donations link out; the admin area is for a handful of staff accounts created by hand.

---

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres, Auth, Storage) · Vercel
Optional: Resend for confirmation email.

All illustrations are hand-authored SVG in `src/components/illustrations/` — no icon library, no
stock art, no licensing to track.

---

## Running it locally

Node 20+ (this repo was built on 22.14).

```bash
npm install
cp .env.example .env.local     # optional — see below
npm run dev                    # http://localhost:3000
```

**It runs with an empty `.env.local`.** The site is built to degrade gracefully: the blog shows
starter content, impact numbers show placeholders, and the forms render but explain that they
aren't switched on yet. Nothing throws. See [`CLAUDE.md` §3](CLAUDE.md).

```bash
npm run build       # production build — run before every commit
npm run typecheck   # faster type-only check
npm run lint
```

---

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste all of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
   This creates every table, all RLS policies, and the private `volunteer-proof` storage bucket.
3. **Authentication → Providers → Email** → turn **off** "Enable Sign Ups".
   Admin accounts are created by hand; nobody should be able to self-register.
4. **Authentication → Users → Add user** for each editor (tick "Auto Confirm User").
5. **SQL Editor**, once per editor:
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'editor@example.com'
   on conflict (user_id) do nothing;
   ```
6. **Project Settings → API** → copy into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasses row-level security. It must never be prefixed with
> `NEXT_PUBLIC_`, never committed, and never imported into a client component.

### How the data is protected

Browsers never talk to Supabase directly. Public reads happen server-side with the anon key, and
RLS only exposes published posts and the single stats row. Writes happen inside server actions
using the service-role key, **after** honeypot, rate-limit, and Zod validation — so there are
deliberately no public `INSERT` policies at all.

---

## Deploying to Vercel

```bash
npm i -g vercel     # once
vercel login
vercel link         # from the repo root
vercel --prod
```

Or connect the Git repo at [vercel.com/new](https://vercel.com/new) — Next.js is detected
automatically, no build settings needed.

Then add the environment variables in **Project → Settings → Environment Variables** (Production
*and* Preview). At minimum:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.hearts4hands.org` — canonical URLs, sitemap, OG images, **and auth email links**. Must match Supabase's Redirect URLs exactly, `www` included |
| `NEXT_PUBLIC_SUPABASE_URL` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | |
| `SUPABASE_SERVICE_ROLE_KEY` | **not** `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_GOFUNDME_URL` / `NEXT_PUBLIC_VENMO_URL` / `NEXT_PUBLIC_PAYPAL_URL` | each donation channel hides itself when blank |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_EDITOR_EMAIL` / `NEXT_PUBLIC_PARTNERSHIPS_EMAIL` | |
| `RESEND_API_KEY` / `RESEND_FROM` / `NOTIFY_EMAIL` | optional — confirmation + notification email |

Redeploy after adding variables. Full list with descriptions: [`.env.example`](.env.example).

---

## Running the site day to day

Everything below is done at **`/admin`** by a signed-in editor — no code changes, no redeploy.

- **Volunteer hours** → `/admin/volunteers`. Approve or reject submissions, view the uploaded
  proof photo, leave a reviewer note. Approved hours are what count toward volunteer awards.
  Export the raw table from the Supabase dashboard when you need a spreadsheet.
- **Stories** → `/admin/stories`. Read a submission, edit it, publish it. Publishing creates the
  public post at `/blog/<slug>` and marks the submission approved. Turning a story down disables
  publishing for it and takes any post already made from it off the blog (kept as a draft). Use
  **Clear not-approved stories** to delete them all at once — that removes the unpublished drafts
  made from them too. Whatever you leave is removed automatically 30 days after the decision, see
  `supabase/migrations/0002_purge_rejected.sql`. Individual draft posts have their own **Delete**
  button; published ones must be unpublished first.
- **Impact numbers** → `/admin/stats`. Money raised, the materials/research split, cards made,
  volunteers, hours. These are manual by design (PRD §5.3) and feed the home page and Donate page.
- **Messages** → `/admin/messages`.

### Changing copy and links

Most editable content lives in one file: [`src/lib/site.ts`](src/lib/site.ts) — navigation, team
bios, milestones, blog categories, volunteer activities, award tiers, contact addresses, and the
fallback impact numbers. Donation URLs and contact emails can also be overridden from Vercel's
environment variables without touching code.

---

## Project layout

```
src/app/            routes, server actions, sitemap/robots/OG
src/components/     layout/ · ui/ · illustrations/ · per-page components
src/lib/            site config, data access, validation, auth, email, utils
src/content/        starter blog posts (fallback content)
supabase/           SQL migration
docs/               the PRD
```

See [`CLAUDE.md`](CLAUDE.md) for the design system, the crayon/paper visual language, coding
conventions, and the reasoning behind the deviations from the PRD's no-code recommendation.
