"use client";

import { ErrorContent } from "@/components/layout/ErrorContent";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/** Root error boundary — brings its own chrome, same reasoning as `not-found`. */
export default function GlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative z-10 flex-1">
        <ErrorContent {...props} />
      </main>
      <SiteFooter />
    </>
  );
}
