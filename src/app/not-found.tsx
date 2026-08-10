import type { Metadata } from "next";

import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Root 404 — reached by URLs that matched no route group at all, so it has to
 * bring its own chrome (the public header/footer live in `(site)/layout.tsx`).
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative z-10 flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
