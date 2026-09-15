import type { Metadata } from "next";

import { AuthShell } from "@/components/account/AuthShell";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";

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
export default function ResetPasswordPage() {
  return (
    <AuthShell eyebrow="Almost done" title="Choose a new password">
      <ResetPasswordForm />
    </AuthShell>
  );
}
