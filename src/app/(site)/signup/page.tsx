import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getVolunteer } from "@/lib/volunteer-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AuthShell } from "@/components/account/AuthShell";
import { SignUpForm } from "@/components/account/SignUpForm";
import { Alert } from "@/components/ui/Feedback";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a Hearts4Hands account to log your volunteer hours, send stories, and ask for a certificate.",
};

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  if (await getVolunteer()) redirect("/account");

  return (
    <AuthShell
      eyebrow="Join in"
      title="Create your account"
      intro="You need one to log hours and send stories, so we can keep an accurate record and give you a certificate for it."
      footer={
        <p className="text-sm">
          Just want to send us a message?{" "}
          <Link
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href="/contact"
          >
            No account needed for that
          </Link>
          .
        </p>
      }
    >
      {isSupabaseConfigured ? (
        <SignUpForm />
      ) : (
        <Alert tone="note" title="Accounts aren't switched on yet">
          <p>We&apos;re still setting this up. Check back shortly.</p>
        </Alert>
      )}
    </AuthShell>
  );
}
