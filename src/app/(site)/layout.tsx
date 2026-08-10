import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Chrome for every public page. Kept out of the root layout so `/admin` can
 * render its own, denser workspace shell instead.
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
