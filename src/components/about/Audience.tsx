import type { ReactNode } from "react";

import { Envelope, Globe } from "@/components/illustrations/Objects";
import { Heart } from "@/components/illustrations/Hearts";
import { Card } from "@/components/ui/Card";

const groups: { title: string; body: string; art: ReactNode }[] = [
  {
    title: "Students, anywhere",
    body: "You do not need to live near us, or near a hospital. Volunteers make cards at their own kitchen tables and log the hours from wherever they are.",
    art: <Globe className="h-14 w-14" />,
  },
  {
    title: "Hospitals and partner organizations",
    body: "If you work with patients in treatment and want cards, tell us how many and how you would like them delivered. We will work to your rules, not ours.",
    art: <Envelope className="h-14 w-18" />,
  },
  {
    title: "Donors and sponsors",
    body: "Small gifts buy paper and postage. Larger ones go to cancer research. Either way you get to see the split.",
    art: <Heart className="h-14 w-14" />,
  },
];

export function Audience() {
  return (
    <ul className="mt-10 grid gap-6 md:grid-cols-3">
      {groups.map((group) => (
        <li key={group.title} className="h-full">
          <Card tone="paper" seed={group.title} className="flex h-full flex-col p-6 sm:p-7">
            <div className="flex h-14 items-end">{group.art}</div>
            <h3 className="mt-4 text-xl">{group.title}</h3>
            <p className="mt-2 text-brown-mid">{group.body}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
