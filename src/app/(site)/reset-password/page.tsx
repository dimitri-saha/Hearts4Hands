import type { Metadata } from "next";

import { AuthShell } from "@/components/account/AuthShell";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Reached from the emailed recovery link, which passes through
 * /auth/callback first — so by the time this renders the visitor already has
 * a session and `updateUser` can set the password.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; welcome?: string }>;
}) {
  const params = await searchParams;
  // Invitations land here too — somebody who has never had a password
  // shouldn't be told to "choose a new" one.
  const welcome = params.welcome === "1";
  const next = safeNextPath(params.next);

  return (
    <AuthShell
      eyebrow={welcome ? "Welcome to Hearts4Hands" : "Almost done"}
      title={welcome ? "Choose a password" : "Choose a new password"}
    >
      <ResetPasswordForm next={next} />
    </AuthShell>
  );
}
