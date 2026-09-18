import type { ReactNode } from "react";

import { Crayon, CoinJar } from "@/components/illustrations/Objects";
import { HeartTrio, PawHeart } from "@/components/illustrations/Hearts";
import { Card } from "@/components/ui/Card";

const values: { title: string; body: string; art: ReactNode }[] = [
  {
    title: "Handmade beats perfect",
    body: "A crooked heart drawn by a twelve-year-old lands better than anything printed. We never ask a volunteer to make it neater.",
    art: <Crayon className="h-14 w-6" color="#d24a5e" />,
  },
  {
    title: "Every patient gets the same care",
    body: "We do not sort patients by diagnosis, hospital, or country. If a card can reach them, they are on the list.",
    art: <HeartTrio className="h-14 w-20" />,
  },
  {
    title: "Show the money",
    body: "Donations are split between materials and cancer research, and the split is printed on the Donate page. If the numbers change, so does the page.",
    art: <CoinJar className="h-14 w-13" />,
  },
  {
    title: "Volunteers run this",
    body: "There is no head office. The people making cards, editing stories, and organizing chapters are students doing it around school.",
    art: <PawHeart className="h-14 w-14" />,
  },
];

export function Values() {
  return (
    <ul className="mt-10 grid gap-6 sm:grid-cols-2">
      {values.map((value) => (
        <li key={value.title} className="h-full">
          <Card tone="paper" seed={value.title} className="flex h-full flex-col p-6 sm:p-7">
            <div className="flex h-14 items-end">{value.art}</div>
            <h3 className="mt-4 text-xl sm:text-2xl">{value.title}</h3>
            <p className="mt-2 text-brown-mid">{value.body}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
