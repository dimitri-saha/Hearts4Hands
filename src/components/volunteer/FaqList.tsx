import type { ReactNode } from "react";

import { ink } from "@/components/illustrations/types";

export type FaqItem = { question: string; answer: ReactNode };

/**
 * Plain `<details>`/`<summary>` accordion — keyboard-operable and findable by
 * browser search with no JavaScript. Styled to match the rest of the page:
 * a wobbly hand-cut border and a crayon chevron that flips when open.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <ul className="mt-10 flex list-none flex-col gap-4">
      {items.map((item, i) => (
        <li key={item.question}>
          <details
            className={`group border-[2.5px] border-brown/60 bg-paper sticker-shadow-sm ${
              i % 2 === 0 ? "rough-2" : "rough-3"
            }`}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-lg font-bold text-berry [&::-webkit-details-marker]:hidden">
              {item.question}
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
              >
                <path
                  d="M4 8 C 8 13 10 16 12 17 C 14 16 16 13 20 8"
                  fill="none"
                  stroke={ink.red}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#crayon-tight)"
                />
              </svg>
            </summary>
            <div className="border-t-2 border-dashed border-brown-faint px-5 py-4 text-brown-mid">
              {item.answer}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
