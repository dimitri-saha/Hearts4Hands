import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Chrome for every public page. Kept out of the root layout so `/admin` can
 * render its own, denser workspace shell instead.
 */
/**
 * Deliberately does NOT read the session.
 *
 * Calling cookies() here would make every page in this group render on demand,
 * turning the whole public site dynamic for the sake of one header link. The
 * link points at /account unconditionally instead, and /account bounces a
 * signed-out visitor to /login. Pages that genuinely need to know — /volunteer
 * and /blog/submit, which hide a form — read it themselves and accept being
 * dynamic.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rough-pill focus:border-[3px] focus:border-brown focus:bg-paper focus:px-5 focus:py-2.5 focus:font-display focus:font-bold focus:text-berry"
      >
        Skip to content
      </a>

      <SiteHeader />
      <main id="main" className="relative z-10 flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
