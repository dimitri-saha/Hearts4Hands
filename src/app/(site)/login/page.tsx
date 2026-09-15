import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getVolunteer } from "@/lib/volunteer-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AuthShell } from "@/components/account/AuthShell";
import { LoginForm } from "@/components/account/LoginForm";
import { Alert } from "@/components/ui/Feedback";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Hearts4Hands account to log hours and see your volunteering.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  if (await getVolunteer()) redirect(params.next ?? "/account");

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      footer={
        <p className="text-sm">
          No account yet?{" "}
          <Link
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href="/signup"
          >
            Create one
          </Link>
          .
        </p>
      }
    >
      {isSupabaseConfigured ? (
        <LoginForm next={params.next} linkError={params.error === "link"} />
      ) : (
        <Alert tone="note" title="Accounts aren't switched on yet">
          <p>We&apos;re still setting this up. Check back shortly.</p>
        </Alert>
      )}
    </AuthShell>
  );
}
