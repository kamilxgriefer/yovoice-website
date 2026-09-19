import type { ReactNode } from "react";

/**
 * Subpage header: eyebrow, the page's single H1 and an optional description.
 * No grid texture and no radial glow; the hero on Start is the only
 * decorated section. The top padding clears the fixed 56 px header
 * (`--header-height`) with the compact variant sitting 56 px below it.
 */
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
      className={`relative ${
        compact ? "pb-10 pt-28 sm:pb-12" : "pb-14 pt-34 sm:pt-38"
      }`}
    >
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1
          className={`font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-[1.1] tracking-[-.025em] text-[var(--foreground)] sm:text-[2.5rem] ${
            compact ? "mt-4" : "mt-5"
          }`}
        >
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-[1.6] text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
