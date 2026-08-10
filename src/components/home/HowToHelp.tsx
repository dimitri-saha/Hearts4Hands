import { CircleScribble, CurvedArrow } from "@/components/illustrations/Doodles";
import { Section, SectionHeading } from "@/components/ui/Section";

const steps = [
  {
    title: "Pick a way to help",
    body: "Make a card at your kitchen table, run a bake sale, or write for the blog. Paper and something colorful is enough to start.",
  },
  {
    title: "Send a photo, log your hours",
    body: "Fill in the volunteer form with what you did and how long it took, and attach a picture of your cards.",
  },
  {
    title: "We deliver, your hours count",
    body: "Cards go out to kids in hospitals. Your logged hours go toward volunteer awards like the PVSA.",
  },
];

export function HowToHelp() {
  return (
    <Section tone="paper">
      <SectionHeading
        eyebrow="How to help"
        title="Three steps, start to finish"
        subtitle="No account, no meetings, no minimum. Do it once or do it every week."
      />

      <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((step, index) => (
          <li key={step.title} className="relative text-center md:text-left">
            <span className="relative inline-flex h-16 w-16 items-center justify-center">
              <CircleScribble
                color={index === 1 ? "#e79a93" : "#d24a5e"}
                className="absolute inset-0 h-full w-full"
              />
              <span className="font-display text-3xl font-bold text-red-deep">{index + 1}</span>
            </span>

            <h3 className="mt-4 text-xl sm:text-2xl">{step.title}</h3>
            <p className="mt-2 text-brown-mid">{step.body}</p>

            {index < steps.length - 1 ? (
              <CurvedArrow
                className="pointer-events-none absolute top-4 -right-10 hidden h-10 w-12 md:block"
                color="#d9c6b4"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}
