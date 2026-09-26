import Image from "next/image";

import {
  CHAPTERS,
  PHONE_CAPTURE,
  type StoryChapter,
} from "@/components/story/story-chapters";
import { StoryCta, StoryHeading } from "@/components/story/story-shared";

/**
 * The app story without the cinema: the server render, the no-JS render and
 * what reduced motion, large text and short windows get.
 *
 * The same heading, the same four chapters and the same captures as the
 * pinned scene, laid out as calm rows — the phone and its chapter side by
 * side, alternating on wide screens, stacked on phones.
 */
export function AppStoryStatic() {
  return (
    <section
      id="inside"
      aria-labelledby="inside-heading"
      className="relative overflow-x-clip px-5 pt-20 sm:px-8 sm:pt-24 lg:px-12 lg:pt-28"
    >
      <div className="mx-auto max-w-[1120px]">
        <StoryHeading className="max-w-2xl" titleClassName="section-title" />

        <ol className="mt-12 grid gap-16 sm:mt-16 lg:gap-24" aria-label="Four places in YO Voice">
          {CHAPTERS.map((chapter, index) => (
            <li
              key={chapter.screen.id}
              className="grid items-center gap-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <StaticPhone
                chapter={chapter}
                className={index % 2 === 1 ? "lg:order-2" : undefined}
              />
              <div
                className={`min-w-0 max-w-[30rem] ${
                  index % 2 === 1 ? "lg:order-1 lg:justify-self-end" : ""
                }`}
              >
                <p
                  className="flex items-center gap-3 text-[0.75rem] font-bold uppercase tracking-[.14em]"
                  style={{ color: chapter.ink }}
                >
                  <span className="tabular-nums">{chapter.number}</span>
                  <span className="h-px w-8 bg-current" aria-hidden="true" />
                  <span>{chapter.screen.label}</span>
                </p>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] font-extrabold leading-[1.05] tracking-[-.03em] text-[var(--foreground)]">
                  {chapter.title}
                </h3>
                <p className="mt-4 text-base leading-[1.65] text-[var(--text-secondary)] sm:text-[1.0625rem]">
                  {chapter.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <StoryCta className="pb-20 pt-16 sm:pb-24 sm:pt-20" />
    </section>
  );
}

function StaticPhone({ chapter, className }: { chapter: StoryChapter; className?: string }) {
  return (
    <div
      className={`relative mx-auto w-[min(62vw,15rem)] sm:w-[13.5rem] lg:w-[17rem] ${className ?? ""}`}
    >
      {/* The chapter's dock colour, low and soft, behind the phone only. */}
      <div
        className="pointer-events-none absolute inset-x-[-34%] inset-y-[-6%] opacity-60"
        style={{
          background: `radial-gradient(closest-side, ${chapter.core}, transparent 72%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative rounded-[2.6rem] border border-[#342a43] bg-[#0b0714] p-[7px] shadow-[0_38px_120px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.07)]">
        <div
          className="relative overflow-hidden rounded-[2.2rem] bg-[#08040f]"
          style={{ aspectRatio: `${PHONE_CAPTURE.width} / ${PHONE_CAPTURE.height}` }}
        >
          <Image
            src={chapter.screen.phone}
            alt={chapter.screen.alt}
            width={PHONE_CAPTURE.width}
            height={PHONE_CAPTURE.height}
            sizes="(min-width: 1024px) 272px, (min-width: 640px) 216px, 62vw"
            className="size-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}
