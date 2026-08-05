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
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
            {group.title}
          </h2>
          <div className="mt-5 space-y-3">
            {group.items.map((item) => {
              const id = `${group.title}-${item.question}`;
              const isOpen = openId === id;
              return (
                <div key={id} className="glass-panel overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : id)}
                    aria-expanded={isOpen}
                    className="focus-ring flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-white">{item.question}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen ? (
                    <p className="px-6 pb-5 text-sm leading-7 text-white/50">{item.answer}</p>
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
