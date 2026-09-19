"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { title: string; items: FaqItem[] };

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="eyebrow">
            {group.title}
          </h2>
          {/* No `overflow-hidden`: the rows have no fill to clip at the corners,
              and clipping would cut the question buttons' 4px-offset focus
              ring down to a hairline. */}
          <div className="panel mt-4 divide-y divide-[var(--border)]">
            {group.items.map((item) => {
              const id = `${group.title}-${item.question}`;
              const isOpen = openId === id;
              return (
                <div key={id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : id)}
                    aria-expanded={isOpen}
                    className="focus-ring flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <span className="text-[15px] font-semibold text-[var(--foreground)]">{item.question}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-[var(--text-tertiary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen ? (
                    <p className="px-5 pb-5 text-sm leading-[1.6] text-[var(--text-secondary)] sm:px-6">{item.answer}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
