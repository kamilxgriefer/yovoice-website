import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-40 sm:pt-44">
      <div className="grid-background absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(192,38,255,.16),transparent_38%)]" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-.05em] text-white sm:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/50">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
