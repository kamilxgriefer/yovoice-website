import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden ${
        compact ? "pb-10 pt-32 sm:pb-12 sm:pt-36" : "pb-16 pt-40 sm:pt-44"
      }`}
    >
      <div className="grid-background absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(192,38,255,.16),transparent_38%)]" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1
          className={`font-[family-name:var(--font-display)] font-bold tracking-[-.05em] text-white ${
            compact ? "mt-4 text-4xl sm:text-5xl" : "mt-6 text-4xl sm:text-6xl"
          }`}
        >
          {title}
        </h1>
        {description ? (
          <p className={`mx-auto max-w-2xl text-base text-white/65 ${compact ? "mt-4 leading-7" : "mt-6 leading-8"}`}>
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
