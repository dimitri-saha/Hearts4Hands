import Image from "next/image";

import { HeartRule } from "@/components/illustrations/Dividers";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function ClosingCta() {
  return (
    <Section tone="paper" width="narrow" className="text-center">
      <Image
        src="/bears/bear_card.png"
        alt="The Hearts4Hands bear, holding up a card with a heart on it"
        width={205}
        height={420}
        className="mx-auto h-40 w-auto animate-float sm:h-48"
      />
      <h2 className="mt-6 text-3xl sm:text-4xl">
        Somewhere there is a patient who would love your handwriting
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-lg text-brown-mid">
        Start with one card. We will show you where to send it and count the
        hour you spent making it.
      </p>
      <div className="mt-8 flex justify-center">
        <Button href="/volunteer" size="lg">
          Volunteer with us
        </Button>
      </div>
      <HeartRule className="mt-10" />
    </Section>
  );
}
