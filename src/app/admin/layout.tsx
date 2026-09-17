import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

import { signOut } from "@/app/actions/admin";
import { getAdminUser } from "@/lib/auth";
import { AdminNav, type AdminNavItem } from "@/components/admin/AdminNav";

/**
 * The editor workspace — PRD §5.4 (review and publish submissions) and §5.2
 * (review logged volunteer hours). Not a public feature: accounts are created
 * by hand in Supabase, so there's nothing here for a search engine to index.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Hearts4Hands admin" },
  robots: { index: false, follow: false },
};

/**
 * Nothing under /admin may be prerendered: every page renders per-session data
 * behind an auth check, and a build-time snapshot would be both wrong and
 * leaky. Applies to the whole segment.
 */
export const dynamic = "force-dynamic";

/**
 * An editor sees only the stories queue.
 *
 * This is presentation, not protection — every page and action behind these
 * links calls `requireOwner()` itself. Hiding a link somebody can't use is
 * courtesy; relying on a hidden link for security would not be.
 */
const ownerNav: AdminNavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/volunteers", label: "Volunteer hours" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/stats", label: "Impact numbers" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/team", label: "Admin accounts" },
  { href: "/", label: "View site ↗", separated: true },
];

const editorNav: AdminNavItem[] = [
  { href: "/admin/stories", label: "Stories" },
  { href: "/", label: "View site ↗", separated: true },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Deliberately NOT requireAdmin(): the login page lives under /admin/login,
  // and guarding the whole segment here would redirect it to itself. Each
  // protected page calls requireAdmin() for its own route.
  const user = await getAdminUser();

  // Signed out (or Supabase isn't configured yet): render the login page bare,
  // with no nav chrome pointing at pages it can't reach.
  if (!user) return <>{children}</>;

  const navItems = user.role === "owner" ? ownerNav : editorNav;

  return (
    <div className="min-h-dvh bg-paper-deep">
      <div className="border-b-2 border-brown-faint bg-paper">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2 no-underline"
            aria-label="Hearts4Hands admin — overview"
          >
            <Image
              src="/bears/bear_sit.png"
              alt=""
              width={312}
              height={310}
              className="h-8 w-8 shrink-0 object-contain"
            />
            <span className="font-hand text-xl leading-none text-red-deep">
              hearts4hands{" "}
              <span className="text-brown-mid">
                {user.role === "owner" ? "admin" : "editor"}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user.email ? (
              <span className="hidden max-w-[16rem] truncate text-sm text-brown-mid sm:inline">
                Signed in as{" "}
                <span className="font-bold text-brown">{user.email}</span>
              </span>
            ) : null}
            <form action={signOut}>
              <button
                type="submit"
                className="cursor-pointer rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid transition-colors hover:border-red hover:bg-blush hover:text-berry"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:gap-8 lg:py-8">
        <AdminNav items={navItems} className="lg:w-52 lg:shrink-0" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
