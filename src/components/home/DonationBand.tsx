import { HeartTrio } from "@/components/illustrations/Hearts";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { AllocationBar, ProgressBar } from "@/components/ui/Stats";
import { allocationSplit, goalProgress, type ImpactStats } from "@/lib/stats";
import { formatCurrency } from "@/lib/utils";

/**
 * Short donation band. The Donate page carries the detail — this is only here
 * so the split between materials and research is visible from the front door.
 */
export function DonationBand({ stats }: { stats: ImpactStats }) {
  const split = allocationSplit(stats);
  const progress = goalProgress(stats);
  const showProgress = stats.totalRaisedCents > 0 && stats.goalCents > 0;

  return (
    <Section tone="kraft">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr]">
        <div>
          <HeartTrio className="h-16 w-24" />
          <h2 className="mt-4 text-3xl sm:text-4xl">Every dollar has a job</h2>
          <p className="mt-4 text-lg text-brown-mid">
            Part of what you give buys the paper, envelopes, and stamps that get a card to a kid.
            The rest goes to cancer research. We update the totals by hand and show the split.
          </p>
          <div className="mt-7">
            <Button href="/donate" size="lg">
              Donate
            </Button>
          </div>
        </div>

        <div className="rough-2 border-[2.5px] border-brown/60 bg-paper p-6 sticker-shadow sm:p-7">
          <h3 className="text-xl">Where donations go</h3>
          <AllocationBar
            className="mt-4"
            materialsPct={split.materialsPct}
            researchPct={split.researchPct}
            isProjected={split.isProjected}
          />

          {showProgress ? (
            <ProgressBar
              className="mt-6"
              value={progress}
              label={
                <>
                  <span className="font-display font-bold text-berry">
                    {formatCurrency(stats.totalRaisedCents)} raised
                  </span>
                  <span className="font-hand text-base text-brown-soft">
                    goal {formatCurrency(stats.goalCents)}
                  </span>
                </>
              }
            />
          ) : null}
        </div>
      </div>
    </Section>
  );
}
