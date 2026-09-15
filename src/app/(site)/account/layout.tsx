import type { Metadata } from "next";

import { requireVolunteer } from "@/lib/volunteer-auth";
import { Card } from "@/components/ui/Card";
import { CompleteProfileForm } from "@/components/account/CompleteProfileForm";
import { AccountNav } from "@/components/account/AccountNav";

export const metadata: Metadata = {
  title: { default: "Your account", template: "%s · Your account" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Kept inside the `(site)` group deliberately, so the dashboard keeps the
 * public header and footer. A volunteer moving between their hours and the
 * card-making guide is still on the same site — unlike /admin, which is a
 * different job and gets its own denser shell.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const volunteer = await requireVolunteer("/account");

  // An account can exist without a profile — anything created by hand in the
  // Supabase dashboard, for instance. Rendering the setup form here rather
  // than redirecting avoids a loop, and covers every page in the section at
  // once so no route can be reached in a half-configured state.
  if (!volunteer.profile) {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="text-3xl">Finish setting up your account</h1>
        <Card tone="paper" seed="complete-profile" className="mt-6 px-5 py-7 sm:px-8">
          <CompleteProfileForm email={volunteer.email} />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <AccountNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
