import type { Metadata } from "next";

import { AuthShell } from "@/components/account/AuthShell";
import { ForgotPasswordForm } from "@/components/account/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgotten password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="No trouble"
      title="Forgotten your password?"
      intro="Tell us the address on the account and we'll send a link to set a new one."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
