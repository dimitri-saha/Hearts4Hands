import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AwardRibbon } from "@/components/illustrations/Objects";

const linkClass =
  "font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4";

/**
 * Shown where a public form used to be.
 *
 * The wall is a real cost to a recruitment funnel, so it explains *why* rather
 * than just demanding a login: hours we can't attribute to a person can't be
 * certified, and the certificate is the whole point.
 */
export function SignInPrompt({
  signedIn,
  title,
  reason,
  href,
  cta,
}: {
  signedIn: boolean;
  title: string;
  reason: string;
  href: string;
  cta: string;
}) {
  if (signedIn) {
    return (
      <Card tone="paper" seed={title} className="flex flex-col items-center gap-4 px-6 py-8 text-center">
        <AwardRibbon className="h-20 w-16" />
        <p className="font-display text-xl font-bold text-berry">You&apos;re signed in.</p>
        <Button href={href} size="lg">
          {cta}
        </Button>
      </Card>
    );
  }

  return (
    <Card tone="paper" seed={title} className="flex flex-col items-center gap-4 px-6 py-9 text-center">
      <AwardRibbon className="h-24 w-20" />
      <h3 className="text-2xl">{title}</h3>
      <p className="max-w-md text-brown-mid">{reason}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button href={`/signup`} size="lg">
          Create an account
        </Button>
        <Button href={`/login?next=${encodeURIComponent(href)}`} variant="outline" size="lg" alt>
          I already have one
        </Button>
      </div>
      <p className="mt-2 text-sm text-brown-mid">
        It takes a minute, and you only do it once. Just want to{" "}
        <Link className={linkClass} href="/contact">
          send us a message
        </Link>
        ? No account needed for that.
      </p>
    </Card>
  );
}
