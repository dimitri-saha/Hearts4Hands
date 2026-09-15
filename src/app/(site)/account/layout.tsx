import type { Metadata } from "next";

import { requireVolunteer } from "@/lib/volunteer-auth";
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
  await requireVolunteer("/account");

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <AccountNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
