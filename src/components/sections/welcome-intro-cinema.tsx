"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import {
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

import { EASE_OUT, useSceneProgress } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import { ScrollWave } from "@/components/animations/scroll-wave";
import { WordReveal } from "@/components/animations/word-reveal";
import type { WelcomeRow } from "@/components/sections/welcome-intro";

/**
 * The welcome as a spoken moment.
 *
 * The heading comes forward as it rises into view and its last three words —
 * "talk out loud." — arrive one after another, as if said. Under it the
 * page's voice (`ScrollWave`) speaks while you scroll, and the sentence that
 * explains YO Voice is set large and lights up word by word as it is read
 * (`WordReveal`). The three answers rise in after it.
 *
 * Only mounted while the scroll cinema is on; `WelcomeIntro` renders the
 * static layout otherwise, with the same heading, id, sentence and rows.
 * Scrubbed motion here is transform-only, plus `WordReveal`'s colour, whose
 * unlit words still read at 4.6:1, so every line meets WCAG AA wherever the
 * visitor stops. The only fades are triggered entrances (the accent words,
 * the rows) that run once and finish on their own within a second and a half.
 */
export function WelcomeIntroCinema({
  sentence,
  rows,
}: {
  sentence: string;
  rows: readonly WelcomeRow[];
}) {
  const bars = useWaveBars();
  return (
    <section
      id="welcome"
      aria-labelledby="welcome-heading"
      className="relative overflow-x-clip border-t border-[var(--border)] bg-[var(--background)] px-5 pb-24 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:px-12 lg:pb-32 lg:pt-36"
    >
      <div className="mx-auto min-w-0 max-w-[1240px]">
        <p className="eyebrow">Welcome</p>
        <SpokenHeading />

        <ScrollWave bars={bars} className="mt-10 h-14 sm:mt-14 sm:h-16 lg:h-20" />

        <div className="lg:pl-[calc(100%/6)]">
          <WordReveal
            text={sentence}
            className="mt-12 max-w-[26em] break-words text-[clamp(1.5rem,0.95rem+1.7vw,2.625rem)] font-semibold leading-[1.3] tracking-[-0.02em] sm:mt-16"
          />

          <ul
            className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-20 md:grid-cols-3"
            aria-label="What YO Voice is for"
          >
            {rows.map(({ icon: Icon, title, text }, index) => (
              <Reveal
                as="li"
                key={title}
                delay={index * 0.1}
                className="min-w-0 border-t border-[var(--border)] pt-6"
              >
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="mt-5 break-words font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.02em] text-[var(--foreground)]">
                  {title}
                </h3>
                <p className="mt-2 max-w-[22rem] break-words text-base leading-[1.6] text-[var(--text-secondary)]">
                  {text}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * How many bars the welcome's waveform draws: roughly one per 9–13 px of
 * width.
 * `ScrollWave` keeps a fixed gap between bars, so a phone-width wave with the
 * desktop's 96 bars would have no room left for the bars themselves.
 */
const WAVE_QUERIES = [
  ["(min-width: 64rem)", 96],
  ["(min-width: 40rem)", 64],
] as const;
const PHONE_BARS = 40;

function subscribeWaveBars(onChange: () => void) {
  const queries = WAVE_QUERIES.map(([query]) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}

function waveBarsSnapshot() {
  return WAVE_QUERIES.find(([query]) => window.matchMedia(query).matches)?.[1] ?? PHONE_BARS;
}

function useWaveBars(): number {
  return useSyncExternalStore(subscribeWaveBars, waveBarsSnapshot, () => PHONE_BARS);
}

const ACCENT_WORDS = ["talk", "out", "loud."] as const;

/** The accent words' entrance, in seconds, and the site's ease-out curve. */
const ARRIVAL_SECONDS = 1.5;
const WORD_GAP_SECONDS = 0.14;
const easeOut = cubicBezier(...EASE_OUT);

/**
 * "Small communities that talk out loud." at display size. The whole heading
 * settles from 92 % to full size as it climbs from the bottom of the window
 * to a third of the way down (scrubbed, transform only), and the accent words
 * arrive one after another the first time the line comes into view.
 *
 * The arrival is one triggered clock for the whole line, like `Reveal`: it is
 * never scrubbed, so a visitor who stops scrolling mid-way never sees "loud."
 * without "talk", and a line that is already on screen when the cinema arms
 * is simply left at rest.
 */
function SpokenHeading() {
  const ref = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const progress = useSceneProgress(ref, ["start end", "start 0.35"]);
  const scale = useTransform(progress, [0, 1], [0.92, 1]);
  const y = useTransform(progress, [0, 1], [36, 0]);
  // 1 is at rest; the entrance runs it from 0 to 1 in ARRIVAL_SECONDS.
  const arrival = useMotionValue(1);

  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    if (line.getBoundingClientRect().top < window.innerHeight) return;

    arrival.set(0);
    let running: AnimationPlaybackControls | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        running = animate(arrival, 1, { duration: ARRIVAL_SECONDS, ease: "linear" });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(line);

    return () => {
      observer.disconnect();
      running?.stop();
      arrival.set(1);
    };
  }, [arrival]);

  return (
    <motion.h2
      ref={ref}
      id="welcome-heading"
      style={{ scale, y, originX: 0, originY: 1 }}
      className="mt-6 break-words font-[family-name:var(--font-display)] text-[clamp(2.5rem,0.6rem+5.4vw,6.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-balance text-[var(--foreground)]"
    >
      <span className="sm:block">Small communities that</span>{" "}
      <span ref={lineRef} className="text-[var(--accent)] sm:block">
        {ACCENT_WORDS.map((word, index) => (
          <span key={word}>
            {index > 0 ? " " : null}
            <AccentWord arrival={arrival} index={index}>
              {word}
            </AccentWord>
          </span>
        ))}
      </span>
    </motion.h2>
  );
}

/**
 * One accent word, a beat after the word before it: from a little to the
 * right, blurred, transparent and slightly large, to rest. Each word starts a
 * touch larger than the one before, so "loud." lands the loudest.
 */
function AccentWord({
  arrival,
  index,
  children,
}: {
  arrival: MotionValue<number>;
  index: number;
  children: string;
}) {
  const at = (seconds: number) => Math.min(1, (0.1 + index * WORD_GAP_SECONDS + seconds) / ARRIVAL_SECONDS);
  const options = { ease: easeOut };
  const opacity = useTransform(arrival, [at(0), at(0.6)], [0, 1], options);
  const x = useTransform(arrival, [at(0), at(0.95)], [56, 0], options);
  const scale = useTransform(arrival, [at(0), at(1.1)], [1 + (index + 1) * 0.06, 1], options);
  const blur = useTransform(arrival, [at(0), at(0.7)], [10, 0], options);
  const filter = useTransform(blur, (value) => (value > 0.05 ? `blur(${value}px)` : "none"));

  return (
    <motion.span
      className="inline-block"
      style={{ opacity, x, scale, filter, originX: 0, originY: 0.8 }}
    >
      {children}
    </motion.span>
  );
}
