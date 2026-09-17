# Pre-launch checklist

Audited **17 September 2026** against `localhost` (code) and `www.hearts4hands.org`
(headers, DNS, robots). Re-run the automated parts with `scripts/qa-*.mjs`.

Legend: **PASS** verified · **FIXED** was broken, now verified · **TODO** outstanding ·
**WATCH** fine now, can rot

---

## 1. Security — the application

| # | Check | Status | Evidence |
|---|---|---|---|
| 1.1 | No open redirects on `?next=` | **FIXED** | `/login?next=https://evil` sent signed-in users off-site. One `safeNextPath()` in `lib/utils.ts` now guards all five sinks; absolute, `//`, `/\` and `https:/` forms all rejected |
| 1.2 | Service-role key never reaches the browser | PASS | Only in `supabase/env.ts`; no `"use client"` file imports it; `server-only` guard in place |
| 1.3 | Every `NEXT_PUBLIC_*` var is safe to publish | PASS | 11 vars, all intentionally public (anon key, contact emails, donation URLs) |
| 1.4 | Secrets not in git | PASS | `.env.local` ignored; only `.env.example` tracked, all values blank |
| 1.5 | Stored markdown can't inject script | PASS | 10 XSS payloads (`<script>`, `onerror`, `javascript:`, `data:`, `<iframe>`, `<form>`) — **0 survived** `lib/markdown.ts` |
| 1.6 | Uploads restricted by type and size | PASS | Bucket `volunteer-proof`: `public: false`, 8 MB cap, MIME allow-list |
| 1.7 | Private files not publicly readable | PASS | Anonymous fetch of a real proof photo → refused; admins use short-lived signed URLs |
| 1.8 | No IDOR on certificates | PASS | Volunteer B requesting A's certificate → **404** |
| 1.9 | Privilege separation holds | PASS | Editor blocked from all 6 owner pages + overview; guards on page, route handler **and** every action |
| 1.10 | Last-owner lockout impossible | PASS | Demote/remove refused, with an explanation |
| 1.11 | Login doesn't confirm which accounts exist | PASS | One vague message for both bad email and bad password |
| 1.12 | Dependencies free of known CVEs | **FIXED** | Next 16.3.0 had a **critical** unauthenticated RCE in the image optimiser (GHSA-2xp9-vwfh-vxw4). Upgraded to 16.3.5 → **0 vulnerabilities** |
| 1.13 | Rate limiting on auth and public forms | WATCH | Works, but **in-memory** — per serverless instance, not global. Documented in `lib/rate-limit.ts`. Swap for Upstash if abuse grows |

## 2. Security — transport and headers

| # | Check | Status | Evidence (production) |
|---|---|---|---|
| 2.1 | HTTPS enforced | PASS | `http://` → **308** → `https://` |
| 2.2 | HSTS | PASS | `max-age=63072000` (2 years) |
| 2.3 | Content-Security-Policy | PASS | `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'` |
| 2.4 | Clickjacking | PASS | `X-Frame-Options: DENY` + `frame-ancestors 'none'` |
| 2.5 | MIME sniffing | PASS | `X-Content-Type-Options: nosniff` |
| 2.6 | Referrer leakage | PASS | `strict-origin-when-cross-origin` — story URLs never leak in a referrer |
| 2.7 | Unused browser APIs disabled | PASS | `Permissions-Policy`: camera, mic, geolocation, payment, USB all `()` |
| 2.8 | Framework not advertised | PASS | No `x-powered-by` |
| 2.9 | HSTS `includeSubDomains` / `preload` | TODO (optional) | Absent. Only add once every subdomain is HTTPS-only — mail subdomains would break |

## 3. Database and access control

| # | Check | Status | Evidence |
|---|---|---|---|
| 3.1 | RLS on every table | PASS | Anonymous read of 10 tables → only `site_stats` returns rows |
| 3.2 | No public write path | PASS | Anonymous insert into 6 tables incl. `admins` and `certificates` → **401** on all |
| 3.3 | Draft posts invisible to the public | PASS | Draft created → anon sees `[]`; published → anon sees it |
| 3.4 | Public verification can't leak identity | PASS | `verify_certificate()` is `security definer` with a fixed projection — cannot return `user_id` |
| 3.5 | Queries filter explicitly, not just by RLS | PASS | Policies are OR'd; every `lib/account-data.ts` query states its own scope (see CLAUDE.md §11) |
| 3.6 | Database backups | TODO | **Not verifiable from here.** Confirm PITR / daily backups in the Supabase dashboard |

## 4. Bots, spam and abuse

| # | Check | Status | Evidence |
|---|---|---|---|
| 4.1 | Honeypot on public forms | PASS | `AntiSpamFields` — offscreen `website` field, must be empty |
| 4.2 | Minimum fill time | PASS | `MIN_FILL_MS = 2500` |
| 4.3 | Per-client rate limits | PASS | Contact 5/15min, stories 4/30min, login 10/15min, signup 5/30min — the login limit tripped during testing, as designed |
| 4.4 | Determined spam still gets through | WATCH | **10 spam messages arrived over 5 weeks.** Slow-drip submissions defeat rate limits and pass a honeypot. Options: accept it (volume is low), add content heuristics, or add Turnstile — which costs conversion and needs a CSP change |
| 4.5 | Account creation abused | PASS | Email confirmation required; signup rate-limited |

## 5. Crawling, indexing and SEO

| # | Check | Status | Evidence |
|---|---|---|---|
| 5.1 | `robots.txt` correct | PASS | Disallows `/admin`, `/account`, `/verify`; points at the sitemap |
| 5.2 | Sitemap has no private routes | PASS | 14 URLs, all public |
| 5.3 | Private pages `noindex` | PASS | `/admin` → `X-Robots-Tag: noindex, nofollow, noarchive` + `no-store`; `/account` and `/verify` `noindex` in metadata |
| 5.4 | Certificate pages can't index a child's name | PASS | `/verify` is `noindex` **and** robots-disallowed — deliberate, see CLAUDE.md §11 |
| 5.5 | Canonical URLs | PASS | `alternates.canonical` on every public page |
| 5.6 | Social preview image | PASS | `/opengraph-image` — 1200×630, static, renders the bear |
| 5.7 | Every page has a unique title + description | PASS | Verified across 17 routes |
| 5.8 | 404 returns a real 404 | PASS | Status 404 with the branded page, not a soft 200 |
| 5.9 | Placeholder content is indexed | **TODO** | The sitemap advertises 3 **starter posts that live in code**, not the CMS. Publish real stories or remove them before launch |

## 6. Privacy and legal

| # | Check | Status | Evidence |
|---|---|---|---|
| 6.1 | Privacy policy matches reality | PASS | Page says 30 days / 7 days; cron uses `interval '30 days'` / `'7 days'` — exact match |
| 6.2 | Under-13 handling | PASS | Guardian-held accounts; story submission blocked in form, action **and** a DB trigger |
| 6.3 | Cookie consent needed? | PASS | **No cookies set for anonymous visitors.** Auth cookies are strictly necessary; Vercel Analytics is cookieless — no banner required |
| 6.4 | Account deletion removes personal data | WATCH | `volunteer_signups.user_id` is `ON DELETE SET NULL` — hours survive **anonymised**, not deleted. Deliberate (keeps approved totals honest) but check `/privacy` describes it |
| 6.5 | Email auth records | PASS | SPF, DKIM (`resend._domainkey`) and DMARC (`p=quarantine`) all present |
| 6.6 | Deliverability actually works | TODO | Send yourself the samples from `/admin/emails` **on production** and check the headers pass SPF/DKIM/DMARC |

## 7. Reliability and correctness

| # | Check | Status | Evidence |
|---|---|---|---|
| 7.1 | Build passes clean | PASS | Types, lint and production build all green |
| 7.2 | Page-level error boundary | PASS | `error.tsx` at root and in `(site)` |
| 7.3 | Root-layout error boundary | **FIXED** | `global-error.tsx` was missing — a layout crash showed Next's raw white error page. Now branded, with a support reference |
| 7.4 | Degrades with no env vars | PASS | Documented invariant (CLAUDE.md §3) |
| 7.5 | Every feature exercised end to end | PASS | 43/43 automated checks — see `scripts/qa-*.mjs` |
| 7.6 | Uptime / error monitoring | TODO | Nothing configured. Vercel logs only — consider Sentry or a free uptime ping |

## 8. Accessibility

| # | Check | Status | Evidence |
|---|---|---|---|
| 8.1 | Exactly one `<h1>` per page | PASS | 17/17 |
| 8.2 | All images have `alt` | PASS | 0 missing |
| 8.3 | All form fields labelled | PASS | 0 unlabelled across every public form |
| 8.4 | No console errors | PASS | 0 across 17 routes |
| 8.5 | Visible focus ring | PASS | 3px dashed red, global |
| 8.6 | Keyboard-reachable card links | PASS | Real focusable overlay links, never `aria-hidden` |
| 8.7 | Screen-reader pass with a real AT | TODO | Automated checks ≠ VoiceOver. Worth 20 minutes before launch |
| 8.8 | Colour contrast measured | TODO | Not machine-checked. Body text is kept off `pink-deep`/`red` by convention |

## 9. Content — before you launch

| # | Item | Status |
|---|---|---|
| 9.1 | Three blog posts are **placeholder content in code** | TODO |
| 9.2 | `milestones` on `/about` are invented ("The spark", "Growing", "Now") | TODO |
| 9.3 | Three role blurbs on `/leadership` are guesses (VP Intern, Social Media, Editor) | TODO |
| 9.4 | Test data in the database (3 rejected entries, 3 certificates, 1 club) | TODO |
| 9.5 | Supabase email templates pasted in (5 files in `supabase/email-templates/`) | TODO |
| 9.6 | A real story run through submit → review → publish | TODO |
| 9.7 | Second owner account, so one lost login isn't fatal | TODO |

---

## Re-running the automated checks

```bash
npm run dev                      # must be running first
node scripts/qa-public.mjs       # 17 public routes: status, a11y, console, links
node scripts/qa-volunteer.mjs    # signup → log hours → upload → validation
node scripts/qa-admin.mjs        # owner vs editor permissions, approve/reject
node scripts/qa-cert.mjs         # issue → download → verify → IDOR
node scripts/qa-redirect.mjs     # open-redirect regression
node scripts/qa-cleanup.mjs      # deletes everything the sweeps created
```

**Run these against `localhost`, never a deployed URL.** `RESEND_API_KEY` is set on
Vercel and empty locally, so a sweep against a deployment sends real email to real
people. The sweeps also write to the live Supabase — `qa-cleanup.mjs` removes every
row they create, including rows orphaned by `ON DELETE SET NULL`.
