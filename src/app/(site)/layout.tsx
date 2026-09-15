import { getVolunteer } from "@/lib/volunteer-auth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Chrome for every public page. Kept out of the root layout so `/admin` can
 * render its own, denser workspace shell instead.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Only ever a boolean past this point — the header is a client component and
  // has no business receiving an email address or profile.
  const signedIn = Boolean(await getVolunteer());

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rough-pill focus:border-[3px] focus:border-brown focus:bg-paper focus:px-5 focus:py-2.5 focus:font-display focus:font-bold focus:text-berry"
      >
        Skip to content
      </a>

      <SiteHeader signedIn={signedIn} />
      <main id="main" className="relative z-10 flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
