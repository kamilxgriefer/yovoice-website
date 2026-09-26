"use client";

import { useRef, useSyncExternalStore, type RefObject } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

import { SCENE_SPRING, useCinema } from "@/components/animations/cinema";
import { ScrollWave } from "@/components/animations/scroll-wave";

/**
 * The page's last word: "Be You." — YO Voice's own tagline — set as wide as
 * the page, with the page's voice under it.
 *
 * As the visitor reaches the bottom, the letters rise one after another out
 * of the line they stand on, drawn as outlines, and then fill up from the
 * bottom like a level meter until the whole tagline is solid. The waveform
 * beneath is shaped like the two syllables being said. Everything here is
 * decorative (the tagline is also the site's title), so it is hidden from
 * assistive technology. Without the cinema the word is drawn solid, at rest.
 *
 * The size is in container-query units, so the word fills the content width
 * exactly at any viewport, 320px included, and never overflows it.
 */
export function BeYouFinale() {
  const cinema = useCinema();
  const bars = useWaveBars();
  return (
    <div aria-hidden="true" className="mt-20 select-none sm:mt-28 lg:mt-32">
      {cinema ? <SpokenWord /> : <Word />}
      <ScrollWave bars={bars} envelope={BE_YOU_ENVELOPE} className="mt-6 h-12 sm:mt-8 sm:h-16 lg:h-20" />
    </div>
  );
}

/**
 * "Be" in the foreground, "You." in the accent — the same split every
 * section heading on the page uses. The space is a letter slot of its own so
 * the rise can be staggered letter by letter; "o" tucks under the arm of the
 * "Y" by hand because kerning does not reach across separate boxes.
 */
const LETTERS = [
  { char: "B", accent: false },
  { char: "e", accent: false },
  { char: " ", accent: false },
  { char: "Y", accent: true },
  { char: "o", accent: true, kern: "-0.07em" },
  { char: "u", accent: true },
  { char: ".", accent: true },
] as const;

/** A loudness contour of "Be You." said once: two syllables and a stop. */
const BE_YOU_ENVELOPE = [
  0.12, 0.46, 0.9, 1, 0.82, 0.5, 0.2, 0.08, 0.3, 0.78, 1, 0.94, 0.8, 0.62, 0.38, 0.16, 0.06,
] as const;

const WORD =
  "flex w-full justify-center whitespace-nowrap font-[family-name:var(--font-display)] text-[length:28.4cqw] font-extrabold leading-[0.9] tracking-[-0.04em]";
const FOREGROUND = "#f8f5fc";
const ACCENT = "#d986ff";

function Word() {
  return (
    <div className="[container-type:inline-size]">
      <div className={WORD}>
        {LETTERS.map((letter, index) => (
          <span
            key={index}
            className="inline-block"
            style={{
              color: letter.accent ? ACCENT : FOREGROUND,
              marginLeft: "kern" in letter ? letter.kern : undefined,
            }}
          >
            {letter.char}
          </span>
        ))}
      </div>
    </div>
  );
}

function SpokenWord() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useFinaleProgress(ref);
  const lift = useTransform(progress, (value) => `${16 * (1 - easeOutCubic(clamp01(value / 0.8)))}%`);

  return (
    <div ref={ref} className="[container-type:inline-size]">
      {/* The line the letters rise out of: clipped at its foot only. */}
      <motion.div className={`${WORD} [clip-path:inset(-20%_-10%_0_-10%)]`} style={{ y: lift }}>
        {LETTERS.map((letter, index) => (
          <SpokenLetter
            key={index}
            index={index}
            count={LETTERS.length}
            progress={progress}
            color={letter.accent ? ACCENT : FOREGROUND}
            kern={"kern" in letter ? letter.kern : undefined}
          >
            {letter.char}
          </SpokenLetter>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * 0 as the word's top edge enters the screen, 1 once its foot has risen to
 * 60 % of the screen's height — a little below the middle, where it is read.
 *
 * The page may end before that on a very tall screen (the footer is all that
 * is left below the word), so reaching the bottom of the page completes the
 * word as well: it is never left half filled at the end of the page.
 */
function useFinaleProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollYProgress: word } = useScroll({ target: ref, offset: ["start end", "end 0.6"] });
  const { scrollYProgress: page } = useScroll();
  const raw = useTransform([word, page], ([value, end]: number[]) => (end > 0.998 ? 1 : value));
  return useSpring(raw, SCENE_SPRING);
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c = 1.2;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function SpokenLetter({
  index,
  count,
  progress,
  color,
  kern,
  children,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  color: string;
  kern?: string;
  children: string;
}) {
  const step = index / (count - 1);
  // Rise: letters leave the line one after another.
  const riseStart = step * 0.26;
  const y = useTransform(progress, (value) => {
    const t = clamp01((value - riseStart) / 0.3);
    return `${104 * (1 - easeOutBack(t))}%`;
  });
  // Fill: outline to solid, bottom up, like a level meter.
  const fillStart = 0.34 + step * 0.36;
  const clipPath = useTransform(progress, (value) => {
    const level = easeOutCubic(clamp01((value - fillStart) / 0.28));
    return `inset(${(100 * (1 - level)).toFixed(2)}% -4% -4% -4%)`;
  });

  return (
    <motion.span className="relative inline-block" style={{ y, marginLeft: kern }}>
      <span
        className="block"
        style={{ color: "transparent", WebkitTextStroke: `max(1px, 0.012em) ${color}` }}
      >
        {children}
      </span>
      <motion.span className="absolute inset-0 block" style={{ color, clipPath }}>
        {children}
      </motion.span>
    </motion.span>
  );
}

/**
 * Roughly one bar per 11–16 px of width; `ScrollWave` keeps a fixed gap
 * between bars, so a phone needs fewer of them than a desktop.
 */
const WAVE_QUERIES = [
  ["(min-width: 64rem)", 88],
  ["(min-width: 40rem)", 60],
] as const;
const PHONE_BARS = 32;

function subscribeWaveBars(onChange: () => void) {
  const queries = WAVE_QUERIES.map(([query]) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}

function useWaveBars(): number {
  return useSyncExternalStore(
    subscribeWaveBars,
    () => WAVE_QUERIES.find(([query]) => window.matchMedia(query).matches)?.[1] ?? PHONE_BARS,
    () => PHONE_BARS,
  );
}
