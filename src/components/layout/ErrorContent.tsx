"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Cloud } from "@/components/illustrations/Doodles";
import { contact } from "@/lib/site";

/** Shared by both error boundaries — see `NotFoundContent` for why. */
export function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <Section tone="cream" width="narrow" className="text-center">
      <Cloud className="mx-auto h-24 w-40 animate-float" />
      <h1 className="mt-6 text-4xl">Something went sideways</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-brown-mid">
        That&apos;s on us, not you. Try again — and if it keeps happening, email{" "}
        <a
          href={`mailto:${contact.general}`}
          className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
        >
          {contact.general}
        </a>
        .
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-brown-soft">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="outline" alt>
          Go home
        </Button>
      </div>
    </Section>
  );
}
