import { Bear } from "@/components/illustrations/Bear";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

/**
 * Shared by both 404 boundaries: `(site)/not-found.tsx` renders it inside the
 * public chrome, and the root `not-found.tsx` supplies that chrome itself for
 * URLs that never matched a route group.
 */
export function NotFoundContent() {
  return (
    <Section tone="blush" width="narrow" className="text-center">
      <Bear className="mx-auto h-56 w-40 animate-float" />
      <p className="mt-6 font-hand text-2xl text-red-deep">Well, this is awkward.</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">We couldn&apos;t find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-brown-mid">
        It might have moved, or the link might have a typo. Our bear looked everywhere.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Back to the home page</Button>
        <Button href="/blog" variant="outline" alt>
          Read some stories
        </Button>
      </div>
    </Section>
  );
}
