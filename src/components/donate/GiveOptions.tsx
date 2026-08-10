import { contact, donationLinks } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { CoinJar, Envelope, GreetingCard } from "@/components/illustrations/Objects";
import { cn } from "@/lib/utils";

/** Handle rendered so one tap selects the whole thing, ready to copy. */
function CopyableHandle({ value }: { value: string }) {
  return (
    <span className="inline-block select-all rough-pill border-2 border-brown-faint bg-cream px-3 py-0.5 font-hand text-base tracking-wide text-berry">
      {value}
    </span>
  );
}

function NewTabNote() {
  return (
    <span className="font-hand text-sm text-brown-soft">opens in a new tab</span>
  );
}

/**
 * The three external giving channels (PRD §5.3 — no payment processing here).
 *
 * Each card only appears once its link is set, so the page never shows a dead
 * button. If none are set yet, the whole block collapses into one friendly
 * note instead of three empty boxes.
 */
export function GiveOptions() {
  const { gofundme, venmo, venmoHandle, paypal } = donationLinks;
  const hasAnyLink = Boolean(gofundme || venmo || paypal);

  if (!hasAnyLink) {
    return (
      <Alert tone="note" title="Our donation links are being set up" className="mt-10">
        <p>
          We&apos;re finishing the paperwork on our GoFundMe, Venmo, and PayPal. They&apos;ll be
          right here as soon as they&apos;re live — please check back soon.
        </p>
        {venmoHandle ? (
          <p className="mt-3">
            If you&apos;d rather not wait, our Venmo handle is <CopyableHandle value={venmoHandle} />{" "}
            — message us there first and we&apos;ll confirm it&apos;s us.
          </p>
        ) : null}
        <p className="mt-3">
          You can also email{" "}
          <a
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href={`mailto:${contact.general}`}
          >
            {contact.general}
          </a>{" "}
          and we&apos;ll sort out the best way for you to give.
        </p>
      </Alert>
    );
  }

  const count = [gofundme, venmo || venmoHandle, paypal].filter(Boolean).length;

  return (
    <ul
      className={cn(
        "mt-12 grid list-none gap-6",
        count === 2 && "sm:grid-cols-2",
        count >= 3 && "sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {gofundme ? (
        <Card
          as="li"
          seed="gofundme"
          tone="paper"
          className="flex flex-col items-start gap-3 px-6 py-7"
        >
          <CoinJar className="h-20 w-20" />
          <h3 className="text-2xl">GoFundMe</h3>
          <p className="text-brown-mid">
            Our main campaign. Best if you want a receipt in your inbox, or want to leave a note
            with your gift.
          </p>
          <p className="text-sm text-brown-soft">GoFundMe deducts a transaction fee from each gift.</p>
          <div className="mt-auto flex flex-col items-start gap-2 pt-4">
            <Button href={gofundme} target="_blank" rel="noopener noreferrer">
              Give on GoFundMe
            </Button>
            <NewTabNote />
          </div>
        </Card>
      ) : null}

      {venmo || venmoHandle ? (
        <Card
          as="li"
          seed="venmo"
          tone="paper"
          className="flex flex-col items-start gap-3 px-6 py-7"
        >
          <GreetingCard className="h-20 w-24" />
          <h3 className="text-2xl">Venmo</h3>
          <p className="text-brown-mid">
            The quickest one, if you already have the app. Any amount is welcome — a few dollars
            buys crayons.
          </p>
          {venmoHandle ? (
            <p className="text-brown-mid">
              Our handle: <CopyableHandle value={venmoHandle} />
            </p>
          ) : null}
          <p className="text-sm text-brown-soft">
            Venmo shows any fee before you confirm — paying by card can add one.
          </p>
          <div className="mt-auto flex flex-col items-start gap-2 pt-4">
            {venmo ? (
              <>
                <Button href={venmo} variant="secondary" target="_blank" rel="noopener noreferrer">
                  Open Venmo
                </Button>
                <NewTabNote />
              </>
            ) : (
              <p className="font-hand text-base text-brown-mid">
                Search that handle in the Venmo app.
              </p>
            )}
          </div>
        </Card>
      ) : null}

      {paypal ? (
        <Card
          as="li"
          seed="paypal"
          tone="paper"
          className="flex flex-col items-start gap-3 px-6 py-7"
        >
          <Envelope className="h-20 w-24" />
          <h3 className="text-2xl">PayPal</h3>
          <p className="text-brown-mid">
            Good for giving from outside the US, or if you&apos;d like to set up something monthly.
          </p>
          <p className="text-sm text-brown-soft">PayPal deducts a processing fee from each gift.</p>
          <div className="mt-auto flex flex-col items-start gap-2 pt-4">
            <Button href={paypal} variant="outline" target="_blank" rel="noopener noreferrer">
              Give with PayPal
            </Button>
            <NewTabNote />
          </div>
        </Card>
      ) : null}

    </ul>
  );
}
