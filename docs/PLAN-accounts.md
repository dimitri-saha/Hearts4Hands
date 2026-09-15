# Plan — volunteer accounts, groups, and certificates

**Status: awaiting approval. No code written yet.**

This supersedes PRD §6's "no volunteer accounts/dashboards" — a deliberate reversal, recorded here
so it reads as a decision rather than drift.

---

## 1. What gets removed

The Presidential Volunteer Service Award framing goes entirely: the Bronze/Silver/Gold tiers, the
`pvsaTiers` constant, the live "38 more hours to Bronze" hint on the hours field, and the
eligibility grouping on `/admin/volunteers`.

**Why, beyond your instruction:** the PVSA is issued through authorised Certifying Organizations.
Unless Hearts4Hands holds that status, implying hours "count toward" it is a promise the site
can't keep. The page already hedged with *"we can't hand out awards ourselves"*, which was the
tell.

Replaced by: **we send you a certificate.** Same motivation for a student, honest about what it is,
entirely in your control.

Touches: `lib/site.ts`, `(site)/volunteer/page.tsx`, `components/volunteer/VolunteerForm.tsx`,
`admin/volunteers/page.tsx`, `components/home/HowToHelp.tsx`, `components/home/ImpactSnapshot.tsx`.

---

## 2. Accounts

**Supabase Auth**, public sign-ups enabled (currently off), email confirmation required.

Two ways in, user's choice:
- **Email + password** — with a forgot-password flow.
- **Magic link** — one-tap from the inbox, no password.

Both land in the same account. Email is always verified, which matters later: a certificate is
worthless if the address on it was never confirmed.

**Email delivery.** Supabase's built-in mailer is enough to build and test against — it's
rate-limited to a handful per hour and not for production. Swap in Resend (Supabase → Project
Settings → Authentication → SMTP) before real volunteers arrive. Supabase Auth is the identity
system; Resend is only the delivery van.

### Sign-up asks for

| Field | Notes |
|---|---|
| Volunteer's name | Goes on the certificate |
| Age bracket | Determines the rules below |
| Email + password *or* magic link | For under-13s, this is the **guardian's** email |
| Country | Already collected today |
| Agreement to the terms | Links to `/terms` and `/privacy` |

### Under-13 rules

- The account carries **the child's name** — they earned the hours, and the certificate names them.
- The **credentials are the guardian's**: their email, their password, their inbox. The child never
  holds login details.
- **No story submission.** Publishing a child's writing under their name is public disclosure,
  which needs far stricter parental consent than an email round-trip. Blocked at the form and in
  the server action.
- Sign-up states plainly that a parent, guardian or teacher must be the one completing it.

13–17 sign up themselves and can do everything.

---

## 3. Groups (school clubs)

A club advisor or president creates a group and invites members with a code or link. Each member
still has their own account and logs their own hours; the group is an aggregation layer.

```
groups
  id, name, organisation, invite_code (short, unique, rotatable)
  created_by, created_at, archived

group_members
  group_id, user_id, role ('leader' | 'member'), joined_at
  primary key (group_id, user_id)
```

- An hour entry is **stamped with the group at logging time** (`volunteer_signups.group_id`), not
  attributed by current membership. So leaving a club doesn't retroactively strip its total, and a
  member of two clubs picks which one an entry counts toward.
- The invite code is short and human-readable (`H4H-7QK4M2`) so it can be read aloud in a
  classroom, and it's also embedded in a join link for group chats. Rotatable if it leaks.
- **The club never reports a number.** The total is computed from members' already-approved
  entries, so it's verified by construction.

### What a leader can see

Deliberately narrow, because a club president is often a minor and the members frequently are:

- ✅ member name, their approved hours, their card count
- ❌ email addresses, locations, uploaded photos, stories, pending or rejected entries

Members see the group name and its total, not each other's details.

### Certificates for clubs

Deferred with individual certificates, but the schema above supports "total hours by this group
over this period" when we get there.

---

## 4. What requires an account

| Action | Account? |
|---|---|
| Logging volunteer hours / cards | **Yes** |
| Submitting a story | **Yes** (and 13+) |
| Contact form | **No** — hospitals, donors, parents and press must reach you freely |
| Reading anything | No |

All the *informational* pages stay public. Only the submit actions are gated, so someone can read
the whole card-making guide before being asked to sign up.

---

## 5. The dashboard — `/account`

- **Total approved hours and cards**, plus lifetime totals.
- **Hour entries** with status: approved, pending, or not approved with the reviewer's note. Showing
  pending matters — otherwise a total looks wrong for no visible reason.
- **Stories**: published ones only, linked to the live post. Not drafts, not rejected, not pending
  — that keeps it clear of the 30-day purge.
- **Groups** you belong to, with the club total; leaders additionally get the roster and the invite
  code.
- **No messages.** Contact messages auto-delete 7 days after being handled, so showing them would
  contradict the retention policy on `/privacy`.
- Request a certificate (once that's built).

---

## 6. Hours → approval → stats

Unchanged workflow: a volunteer logs hours, an admin approves at `/admin/volunteers`.

**Change:** the public impact numbers for **volunteers, hours and cards** become computed live from
approved entries rather than typed into `/admin/stats`. They can't drift, and there's nothing to
remember to update. **Money raised stays manual** — that's the figure you genuinely maintain.

---

## 7. Database changes — migration `0004_accounts.sql`

New tables: `groups`, `group_members`.

New columns:
- `volunteer_signups.user_id` → `auth.users`, and `group_id` → `groups`
- `blog_submissions.user_id` → `auth.users`

New RLS policies — this is the part to test hardest, since today there are *no* public read
policies beyond published posts:

| Table | Volunteer can |
|---|---|
| `volunteer_signups` | read rows where `user_id = auth.uid()`. No insert/update directly — writes still go through server actions |
| `blog_submissions` | read own rows |
| `groups` | read groups they're a member of |
| `group_members` | read rows for groups they're in; leaders read the full roster |

Writes continue to go through server actions with the service-role key, which sets `user_id` from
the **session**, never from anything the client sends.

Existing rows have a null `user_id` and simply belong to nobody — admins still see them. Your
database is nearly empty, which is why this is the right moment.

---

## 8. New pages

```
/signup            create an account (age bracket decides the under-13 path)
/login             password or magic link
/forgot-password   request a reset
/reset-password    set a new one
/account           dashboard
/account/hours     log hours (moved from the public /volunteer form)
/account/groups    join or create a club, manage the roster
/terms             terms of use
```

`/account/*` gets its own layout — a third shell alongside the public site and `/admin` — and
`proxy.ts` extends to refresh sessions there too.

---

## 9. Legal pages

- **`/terms`** — acceptable use, permission to publish a submitted story, account termination,
  no warranty. Needed once you have accounts and user-generated content.
- **`/privacy` rewrite** — accounts change what's collected, add authentication data, and introduce
  account deletion.
- **Account deletion policy**: deleting an account **anonymises** hour records so impact totals
  survive, and leaves published stories up unless separately withdrawn. Written into `/privacy`.

Both will contain clearly-marked gaps only you can fill: the legal entity name, and whether you
have volunteers in the UK/EU (which adds GDPR obligations).

---

## 10. Build order

1. Remove PVSA — independent, no decisions needed
2. Migration 0004: tables, columns, RLS
3. Auth flows: sign-up, login (both methods), forgot/reset password
4. `/account` shell + dashboard
5. Move hour logging behind the account; gate story submission
6. Groups: create, invite, join, roster, totals
7. Live-computed stats
8. `/terms`, `/privacy` rewrite
9. Certificates — **separate piece of work, after all of the above**

---

## 11. Open risks

- **Sign-up friction.** Today: make cards → photograph → log hours in ninety seconds. An account
  wall lands at the moment someone is most enthusiastic. Magic links soften it; it remains a real
  cost to a recruitment funnel.
- **Public sign-ups become enabled.** The `admins` allow-list already gates `/admin` by table
  membership rather than "is authenticated", so a random sign-up gains nothing — but that
  behaviour needs an explicit re-test once anyone can register.
- **Email becomes load-bearing.** No mail delivery, no confirmations, no resets, no magic links.
  Supabase's default mailer covers development only.
- **One account per email.** A parent with two children under 13 needs two addresses (a `+alias`
  works). Groups solve the classroom case; siblings remain a small rough edge.
- **Approval becomes the bottleneck.** Certificates depend on approved hours, so unreviewed
  submissions block certificates. Worth revisiting auto-approval thresholds later.
