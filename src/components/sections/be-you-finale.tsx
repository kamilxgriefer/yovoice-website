"use client";

import { useLayoutEffect, useRef, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { SCENE_SPRING, useCinema, useRelocationJump, useScrollLean } from "@/components/animations/cinema";
import { ScrollWave } from "@/components/animations/scroll-wave";

/**
 * The page's last word: "Be You." — YO Voice's own tagline — set as wide as
 * the page, with the page's voice under it.
 *
 * As the visitor reaches the bottom, the letters rise one after another out
 * of the line they stand on, drawn as outlines, and then fill up from the
 * bottom like a level meter until the whole tagline is solid. Once a letter
 * is solid it stays solid: scrolling back up lowers the word back into its
 * line but never erases it, and it is only drawn as outlines again after it
 * has left the screen at the bottom. The waveform beneath is shaped like the
 * two syllables being said, and the page's voice line (`VoiceLine`) turns
 * under it to become the line its bars stand on (`data-voice-line-end`).
 *
 * The page's colour comes back for the last word (the colour arc): the
 * violet the story ends on floods the room behind it, rising with the fill
 * and staying lit with it, so the film ends where its brightest scene did.
 * The word leans into the scroll with its speed and stands straight the
 * moment the scroll stops, like the story's giant words, pivoting on its own
 * baseline. Everything here is decorative (the tagline is also the site's
 * title), so it is hidden from assistive technology. Without the cinema the
 * word is drawn solid, at rest, on the page's ground.
 *
 * The page ends here, so the bottom of the page is where the word is last
 * seen, and it must be seen whole there: never cut by the fixed header.
 * The word is as wide as the content (container-query units, 320px
 * included) where the window is tall enough for that, and otherwise as tall
 * as the room left between the header and everything below it (wave and
 * footer) at the very bottom of the page. A window too short to keep even a
 * 6rem word in that room — phones, whose footer is taller than the screen,
 * and short laptop windows — keeps the full-width word instead and ends
 * with it scrolled cleanly off the top: a spacer under it makes sure it is
 * never left half under the header.
 */
export function BeYouFinale() {
  const cinema = useCinema();
  const bars = useWaveBars();
  const root = useRef<HTMLDivElement>(null);
  const wave = useRef<HTMLDivElement>(null);
  // How far the word has filled (latched): the word drives it, the flood
  // behind it follows it.
  const fill = useMotionValue(0);
  useTailMeasure(root, wave);

  return (
    <div ref={root} aria-hidden="true" className={`relative mt-20 select-none sm:mt-28 lg:mt-32 ${ROOM_VARS}`}>
      {cinema ? <FinaleFlood fill={fill} /> : null}
      {/* The container the word's width is measured against. Positioned, so
          the word paints over the flood. */}
      <div className="relative [container-type:inline-size]">
        {cinema ? <SpokenWord fillOut={fill} /> : <Word />}
      </div>
      <div style={{ height: SPACER }} />
      <div ref={wave} data-voice-line-end="" className="relative mt-[var(--finale-gap)]">
        <ScrollWave bars={bars} envelope={BE_YOU_ENVELOPE} className="h-[var(--finale-wave)]" />
      </div>
    </div>
  );
}

/**
 * The finale's flood: the colour the story ends on (its last tint, as a
 * flood with one bright core), so the film is bookended. Full-bleed,
 * bottom-anchored on the page's floor (the footer's hairline) and as tall
 * as the room, its core low behind the word. It lies behind everything in
 * the Download section (which is its own stacking context), so the cards
 * and the identity panel above the word sit on it, never under it. It comes
 * up with the word's fill and, like the fill, stays lit at the bottom of the
 * page.
 *
 * Contrast on the brightest pixel behind the word at full light: "Be"
 * #f8f5fc on #451a93 is 11.9:1 and "You." #d986ff 4.9:1 (large text needs
 * 3:1). In forced colours the flood is left out.
 */
const FLOOD =
  "radial-gradient(75% 60% at 50% 62%, #451a93 0%, #2a1061 34%, #1a0a44 55%, rgb(26 10 68 / 0) 82%)";

function FinaleFlood({ fill }: { fill: MotionValue<number> }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 -z-1 h-[min(110svh,70rem)] forced-colors:hidden"
      style={{ insetInline: "calc(50% - 50vw)", background: FLOOD, opacity: fill }}
    />
  );
}

/**
 * The gap and wave under the word are smaller on a window under 60rem tall
 * (every laptop), which leaves the word more of the height. `--finale-tail`
 * is everything from the top of the wave to the end of the page (the wave,
 * the footer); `useTailMeasure` sets it, and these are close estimates for
 * the server render and a visit without JavaScript.
 */
const ROOM_VARS = [
  "[--finale-gap:1rem] [--finale-wave:3rem]",
  "sm:[@media(min-height:60rem)]:[--finale-gap:2rem] sm:[@media(min-height:60rem)]:[--finale-wave:4rem]",
  "lg:[@media(min-height:60rem)]:[--finale-wave:5rem]",
  "[--finale-tail:62rem] sm:[--finale-tail:46rem] lg:[--finale-tail:32rem]",
].join(" ");

/** The line height of the word, as a fraction of its size. */
const LINE = 0.9;
/** The smallest word worth fitting under the header; below it the word leaves instead. */
const FLOOR = "6rem";
/**
 * The height the word may take at the very bottom of the page: the viewport
 * (the small one, with any browser toolbar showing) less the header with
 * 16px clear under it (its 1px border included), the gap and the tail.
 */
const ROOM = "(100svh - var(--header-height) - 18px - var(--finale-gap) - var(--finale-tail))";
/** 0 when a word of at least FLOOR fits in ROOM, a huge length when not. */
const TOO_SHORT = `clamp(0px, (${FLOOR} - ${ROOM} / ${LINE}) * 100000, 100000px)`;
/** As wide as the content, but no taller than ROOM, unless ROOM is TOO_SHORT. */
const WORD_SIZE = `min(28.4cqw, max(${ROOM} / ${LINE}, ${TOO_SHORT}))`;
/**
 * When the word cannot fit, the space that takes it right off the top of the
 * (large) viewport at the bottom of the page; nothing when it fits, or when
 * the tail alone is taller than the screen (the word has left by then).
 */
const SPACER = `clamp(0px, (${FLOOR} - ${ROOM} / ${LINE}) * 100000, max(0px, 100lvh - var(--finale-gap) - var(--finale-tail)))`;

const WORD_STYLE: CSSProperties = { fontSize: WORD_SIZE };

/**
 * Keeps `--finale-tail` equal to the distance from the top of the wave to
 * the end of the document. It changes when the footer reflows (a new width,
 * web fonts arriving) and never with the word itself, so observing the
 * document's size is enough.
 *
 * The word's size is derived from the tail, and the page's height is a
 * whole number of pixels while the wave's top is not: a new word size moves
 * the measured tail by a fraction of a pixel, which used to resize the word
 * again, every frame, forever. Only a change of 2px or more is written, so
 * a reflowed footer still lands and rounding never feeds back.
 */
function useTailMeasure(root: RefObject<HTMLElement | null>, wave: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const node = root.current;
    const waveNode = wave.current;
    if (!node || !waveNode) return;
    const page = document.documentElement;
    let written = Number.NaN;
    const measure = () => {
      const top = waveNode.getBoundingClientRect().top + window.scrollY;
      const tail = Math.max(0, Math.round(page.scrollHeight - top));
      if (Math.abs(tail - written) < 2) return;
      written = tail;
      node.style.setProperty("--finale-tail", `${tail}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(page);
    return () => {
      observer.disconnect();
      node.style.removeProperty("--finale-tail");
    };
  }, [root, wave]);
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
  // A no-break space: a plain one would collapse to nothing in its own box.
  { char: "\u00a0", accent: false },
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
  "flex w-full justify-center whitespace-nowrap font-[family-name:var(--font-display)] font-extrabold leading-[0.9] tracking-[-0.04em]";
const FOREGROUND = "#f8f5fc";
const ACCENT = "#d986ff";

function Word() {
  return (
    <div style={WORD_STYLE}>
      <div data-finale-word="" className={WORD}>
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

/** The word leans at most this far (degrees) with the speed of the scroll. */
const LEAN = 6;
/** Where it leans from: its baseline, 90 % down its 0.9em line box. */
const BASELINE = 0.9;

function SpokenWord({ fillOut }: { fillOut: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { progress, fill } = useFinaleProgress(ref);
  const lift = useTransform(progress, (value) => `${16 * (1 - easeOutCubic(clamp01(value / 0.8)))}%`);
  // Into the direction of the scroll, like the story's giant words.
  const lean = useScrollLean(LEAN);
  const skewX = useTransform(lean, (degrees) => -degrees);
  useMotionValueEvent(fill, "change", (value) => fillOut.set(value));
  useLayoutEffect(() => fillOut.set(fill.get()), [fill, fillOut]);

  return (
    <div ref={ref} style={WORD_STYLE}>
      <motion.div className="will-change-transform" style={{ skewX, originY: BASELINE }}>
        {/* The line the letters rise out of: clipped at its foot only. */}
        <motion.div
          data-finale-word=""
          className={`${WORD} [clip-path:inset(-20%_-10%_0_-10%)]`}
          style={{ y: lift }}
        >
          {LETTERS.map((letter, index) => (
            <SpokenLetter
              key={index}
              index={index}
              count={LETTERS.length}
              progress={progress}
              fill={fill}
              color={letter.accent ? ACCENT : FOREGROUND}
              kern={"kern" in letter ? letter.kern : undefined}
            >
              {letter.char}
            </SpokenLetter>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * `progress`: 0 as the word's top edge enters the screen, 1 once its foot
 * has risen to 60 % of the screen's height — a little below the middle,
 * where it is read. The page may end before that on a very tall screen (the
 * footer is all that is left below the word), so reaching the bottom of the
 * page completes the word as well: it is never left half filled at the end
 * of the page.
 *
 * `fill`: the furthest `progress` has reached, so the letters' fill is
 * latched. It starts over only once the word has left the screen at the
 * bottom (scrolled back above it), where nobody sees it reset.
 */
function useFinaleProgress(ref: RefObject<HTMLElement | null>): {
  progress: MotionValue<number>;
  fill: MotionValue<number>;
} {
  const { scrollYProgress: word } = useScroll({ target: ref, offset: ["start end", "end 0.6"] });
  const { scrollYProgress: page } = useScroll();
  const raw = useTransform([word, page], ([value, end]: number[]) => (end > 0.998 ? 1 : value));
  const progress = useSpring(raw, SCENE_SPRING);
  useRelocationJump(raw, progress);

  const reached = useMotionValue(0);
  useMotionValueEvent(progress, "change", (value) => {
    if (value > reached.get() && word.get() > 0) reached.set(value);
  });
  useMotionValueEvent(word, "change", (value) => {
    if (value <= 0) reached.set(0);
  });
  const fill = useTransform([progress, reached], ([value, most]: number[]) => Math.max(value, most));
  return { progress, fill };
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
  fill,
  color,
  kern,
  children,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  fill: MotionValue<number>;
  color: string;
  kern?: string;
  children: string;
}) {
  const step = index / (count - 1);
  // Rise: letters leave the line one after another, and sink back into it
  // when the visitor scrolls back up.
  const riseStart = step * 0.26;
  const y = useTransform(progress, (value) => {
    const t = clamp01((value - riseStart) / 0.3);
    return `${104 * (1 - easeOutBack(t))}%`;
  });
  // Fill: outline to solid, bottom up, like a level meter. Latched.
  const fillStart = 0.34 + step * 0.36;
  const clipPath = useTransform(fill, (value) => {
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
