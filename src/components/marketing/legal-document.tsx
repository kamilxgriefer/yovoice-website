import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

export function LegalDocument({
  updatedOn,
  intro,
  sections,
}: {
  updatedOn: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <section className="px-5 pb-28 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
        <nav
          aria-label="Sections on this page"
          className="hidden lg:block"
        >
          <div className="sticky top-[calc(var(--header-height)+2rem)]">
            <p className="eyebrow">
              On this page
            </p>
            <ul className="mt-5 space-y-1 border-l border-[var(--border)] pl-4">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="focus-ring link-hover-accent block rounded py-1 text-sm transition"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="max-w-3xl">
          <p className="eyebrow">
            Last updated {updatedOn}
          </p>
          <div className="mt-4 text-base leading-[1.6] text-[var(--text-secondary)]">{intro}</div>

          <div className="mt-12 space-y-12">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-.025em] text-[var(--foreground)]">
                  {section.title}
                </h2>
                <div className="prose-legal mt-4 space-y-4 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                  {section.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
