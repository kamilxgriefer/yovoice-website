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
          <div className="sticky top-28">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/30">
              On this page
            </p>
            <ul className="mt-5 space-y-3 border-l border-white/10 pl-4">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="focus-ring block rounded text-sm text-white/45 transition hover:text-white"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/35">
            Last updated {updatedOn}
          </p>
          <div className="mt-6 text-sm leading-7 text-white/55">{intro}</div>

          <div className="mt-14 space-y-14">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-.03em] text-white">
                  {section.title}
                </h2>
                <div className="prose-legal mt-4 space-y-4 text-sm leading-7 text-white/55">
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
