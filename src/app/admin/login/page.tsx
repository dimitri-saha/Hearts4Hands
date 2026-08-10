import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "@/components/admin/LoginForm";
import { BearHead } from "@/components/illustrations/Bear";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const BOOTSTRAP_SQL = `insert into public.admins (user_id, email)
select id, email from auth.users where email = 'you@example.com'
on conflict (user_id) do nothing;`;

export default async function AdminLoginPage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise.
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.next) ? params.next[0] : params.next;
  // Only same-origin relative paths — mirrors the check inside `signIn`.
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/admin";

  // Already signed in? Skip the form.
  if (isSupabaseConfigured) {
    const user = await getAdminUser();
    if (user) redirect(next);
  }

  return (
    <div className="flex min-h-dvh items-start justify-center bg-paper-deep px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <BearHead className="h-14 w-16" />
          <h1 className="mt-3 font-display text-2xl font-bold text-berry">
            {isSupabaseConfigured ? "Editor sign-in" : "Admin isn't set up yet"}
          </h1>
          <p className="mt-1.5 text-[0.95rem] text-brown-mid">
            {isSupabaseConfigured
              ? "For Hearts4Hands editors. Accounts are created by hand — there's no sign-up."
              : "The site runs fine without a database. Reviewing submissions needs one."}
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-brown-faint bg-paper p-5 sm:p-6">
          {isSupabaseConfigured ? <LoginForm next={next} /> : <SetupInstructions />}
        </div>

        <p className="mt-5 text-center text-sm text-brown-mid">
          <Link
            href="/"
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
          >
            Back to the site
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Day-one state: no Supabase credentials, so there is no login to attempt.
 * Rendering a form that cannot possibly work would just be a dead end — these
 * are the four steps that turn the admin area on. Mirrors CLAUDE.md §8 and the
 * comment at the bottom of `supabase/migrations/0001_init.sql`.
 */
function SetupInstructions() {
  return (
    <div className="flex flex-col gap-5 text-left">
      <p className="text-[0.95rem] text-brown">
        There&apos;s no sign-in form here because there&apos;s nothing to sign in to yet. Four steps,
        once:
      </p>

      <ol className="flex list-none flex-col gap-5">
        <Step n={1} title="Create the database">
          <p>
            Make a Supabase project, open the SQL Editor, and run{" "}
            <Code>supabase/migrations/0001_init.sql</Code> from this repo. It creates every table,
            the row-level-security policies, and the private{" "}
            <Code>volunteer-proof</Code> storage bucket.
          </p>
        </Step>

        <Step n={2} title="Set the environment variables">
          <p>
            Copy <Code>.env.example</Code> to <Code>.env.local</Code> (or paste them into Vercel)
            and fill in three values from Supabase → Project settings → API:
          </p>
          <Pre>{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=`}</Pre>
          <p className="text-sm text-brown-mid">
            The first two switch on reads and this login screen. The service-role key is what lets
            forms save and editors approve — keep it server-side, never prefixed with{" "}
            <Code>NEXT_PUBLIC_</Code>.
          </p>
        </Step>

        <Step n={3} title="Add the first editor by hand">
          <p>
            Supabase → Authentication → Users → <strong>Add user</strong>, with &ldquo;Auto Confirm
            User&rdquo; on. Then Authentication → Providers → Email and turn{" "}
            <strong>Enable Sign Ups off</strong>, so nobody can create their own account.
          </p>
        </Step>

        <Step n={4} title="Put that user on the allow-list">
          <p>Back in the SQL Editor, with their email:</p>
          <Pre>{BOOTSTRAP_SQL}</Pre>
          <p className="text-sm text-brown-mid">
            Being signed in isn&apos;t enough — only rows in <Code>public.admins</Code> can reach
            these pages. Repeat this step for each new editor.
          </p>
        </Step>
      </ol>

      <p className="border-t border-brown-faint pt-4 text-sm text-brown-mid">
        Restart the dev server after changing env vars, then reload this page — the sign-in form
        will be here.
      </p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brown-faint bg-cream font-display text-sm font-bold text-brown-mid"
      >
        {n}
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="font-display text-base font-bold text-berry">
          <span className="sr-only">Step {n}: </span>
          {title}
        </h2>
        <div className="flex flex-col gap-2 text-[0.95rem] text-brown">{children}</div>
      </div>
    </li>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border border-brown-faint bg-cream px-1.5 py-0.5 font-mono text-[0.85em] break-words text-berry">
      {children}
    </code>
  );
}

function Pre({ children }: { children: string }) {
  return (
    // Wraps rather than scrolls: these snippets exist to be read and copied on
    // a setup screen, and a hidden horizontal scrollbar loses the end of a line.
    <pre className="overflow-x-auto rounded-lg border border-brown-faint bg-cream p-3 font-mono text-[0.8rem] leading-relaxed break-words whitespace-pre-wrap text-brown">
      <code>{children}</code>
    </pre>
  );
}
