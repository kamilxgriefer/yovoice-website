"use client";

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { AudioLines } from "lucide-react";
import {
  easeInOut,
  easeOut,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";

import { useSceneProgress } from "@/components/animations/cinema";
import styles from "@/components/story/app-story.module.css";
import {
  CHAPTERS,
  CHAPTER_LENGTH,
  FINALE_START,
  FINALE_TINT,
  INTRO_END,
  PHONE_CAPTURE,
  chapterAt,
  chapterMid,
  chapterStart,
  type StoryChapter,
} from "@/components/story/story-chapters";
import { StoryCta, StoryHeading } from "@/components/story/story-shared";

/**
 * The pinned app story — the homepage's product scene.
 *
 * A tall track with a sticky, full-height stage. The visitor's scroll through
 * the track is the only clock: the heading, a phone that rises and turns, a
 * flood of each destination's dock colour, four chapters whose screens wipe
 * in from the bottom like a swipe inside the app, and the hero's line, giant,
 * behind the phone. Scrolling back plays it backwards; stopping holds it.
 */

/* Chapter boundaries: where one screen hands over to the next. */
const B1 = chapterStart(1);
const B2 = chapterStart(2);
const B3 = chapterStart(3);
const F = FINALE_START;

/** Half-width of the phone's swing around a boundary. */
const SWING = 0.024;
/** The screen wipe runs from just before to just after a boundary. */
const WIPE_IN = 0.026;
const WIPE_OUT = 0.022;

/* The phone's pose over the whole scene. It drifts a few degrees inside a
   chapter and swings to the other side at each boundary, alternating like a
   hand turning a phone to show it. */
const POSE_AT = [
  0, INTRO_END,
  B1 - SWING, B1 + SWING,
  B2 - SWING, B2 + SWING,
  B3 - SWING, B3 + SWING,
  F - 0.03, F + 0.08, 1,
];
const ROTATE_Y = [-24, -16, -12, 14, 10, -12, -8, 16, 12, 0, 0];
const ROTATE_Z = [-6, -2.4, -1.2, 2.8, 1.8, -3, -1.8, 2.6, 1.4, 0, 0];

/* Tilt and scale breathe at each boundary, then the finale lifts the phone
   a touch toward the visitor. */
const LIFT_AT = [
  0, INTRO_END,
  B1 - SWING, B1, B1 + SWING,
  B2 - SWING, B2, B2 + SWING,
  B3 - SWING, B3, B3 + SWING,
  F - 0.03, F + 0.1, 1,
];
const ROTATE_X = [22, 0, 0, 5, 0, 0, 5, 0, 0, 5, 0, 0, 0, 0];
const SCALE = [0.8, 1, 1, 0.955, 1, 1, 0.955, 1, 1, 0.955, 1, 1, 1.07, 1.07];

export function AppStoryCinema() {
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useSceneProgress(trackRef);
  const [active, setActive] = useState(() => chapterAt(progress.get()));

  useMotionValueEvent(progress, "change", (value) => {
    const next = chapterAt(value);
    setActive((current) => (current === next ? current : next));
  });

  const goToChapter = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const distance = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + chapterMid(index) * distance, behavior: "smooth" });
  }, []);

  return (
    <section id="inside" aria-labelledby="inside-heading" className={`relative ${styles.section}`}>
      <div ref={trackRef} className={styles.track}>
        <div className={styles.stage}>
          <Flood progress={progress} />
          <div className={styles.shade} aria-hidden="true" />
          <Intro progress={progress} />
          <GiantWords progress={progress} />

          <ol className={styles.text} aria-label="Four places in YO Voice">
            {CHAPTERS.map((chapter, index) => (
              <ChapterText key={chapter.screen.id} chapter={chapter} index={index} progress={progress} />
            ))}
          </ol>

          <div className={`${styles.slot} ${styles.coreSlot}`} aria-hidden="true">
            <div className={styles.slotInner}>
              <Cores progress={progress} />
              <VoiceRings progress={progress} />
            </div>
          </div>

          <div className={`${styles.slot} ${styles.phoneSlot}`}>
            <div className={styles.slotInner}>
              <Phone progress={progress} />
            </div>
          </div>

          <Rail progress={progress} active={active} onSelect={goToChapter} />
        </div>
      </div>

      <StoryCta className="pb-20 pt-10 sm:pb-24 sm:pt-12" />
    </section>
  );
}

/* ---- Backdrop ------------------------------------------------------------ */

/** The flood opens out of the phone as it arrives, then takes on each
 * chapter's colour in turn and returns to deep violet for the finale. */
function Flood({ progress }: { progress: MotionValue<number> }) {
  const radius = useTransform(progress, [0.004, INTRO_END + 0.006], [0, 150], { ease: easeInOut });
  const drop = useTransform(progress, [0, INTRO_END], [55, 0], { ease: easeOut });
  const clipPath = useMotionTemplate`circle(${radius}% at 50% calc(var(--iris-y) + ${drop}%))`;

  return (
    <motion.div className={styles.flood} style={{ clipPath }} aria-hidden="true">
      {CHAPTERS.map((chapter, index) => (
        <TintLayer
          key={chapter.screen.id}
          progress={progress}
          from={index === 0 ? -1 : chapterStart(index)}
          className={styles.floodLayer}
          background={floodPaint(chapter)}
        />
      ))}
      <TintLayer
        progress={progress}
        from={F + 0.012}
        className={styles.floodLayer}
        background={floodPaint(FINALE_TINT)}
      />
    </motion.div>
  );
}

/** A deep full-bleed tint, lifted toward the phone. */
function floodPaint({ flood, core, lift }: { flood: string; core: string; lift: number }): string {
  const centre = mix(flood, core, 0.44 * lift);
  const middle = mix(flood, core, 0.16 * lift);
  return `radial-gradient(78% 82% at 50% var(--iris-y), ${centre} 0%, ${middle} 55%, ${flood} 100%)`;
}

/** `amount` of `to` over `from`, both #rrggbb (no color-mix(), so older
 * browsers still paint the flood). */
function mix(from: string, to: string, amount: number): string {
  const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16);
  return `#${[1, 3, 5]
    .map((at) => Math.round(channel(from, at) + (channel(to, at) - channel(from, at)) * amount))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** The bright core behind the phone, in the same colour as the flood. */
function Cores({ progress }: { progress: MotionValue<number> }) {
  const scale = useTransform(progress, [0, INTRO_END], [0.35, 1], { ease: easeOut });
  const opacity = useTransform(progress, [0.01, INTRO_END - 0.02], [0, 1]);

  return (
    <motion.div className={styles.core} style={{ scale, opacity }}>
      {CHAPTERS.map((chapter, index) => (
        <TintLayer
          key={chapter.screen.id}
          progress={progress}
          from={index === 0 ? -1 : chapterStart(index)}
          to={index === CHAPTERS.length - 1 ? F + 0.012 : chapterStart(index + 1)}
          className={styles.coreLayer}
          background={corePaint(chapter.core)}
        />
      ))}
      <TintLayer
        progress={progress}
        from={F + 0.012}
        className={styles.coreLayer}
        background={corePaint(FINALE_TINT.core)}
      />
    </motion.div>
  );
}

/**
 * At each hand-over — the phone arriving, each new screen, the finale — two
 * thin rings spread out from behind the phone like the sound of a voice, in
 * the colour of what comes next. Scrubbed, so they hold where the scroll
 * stops.
 */
const RING_MOMENTS = [
  { at: INTRO_END - 0.03, color: CHAPTERS[0].ink },
  ...CHAPTERS.slice(1).map((chapter, offset) => ({ at: chapterStart(offset + 1), color: chapter.ink })),
  { at: F + 0.01, color: "#d986ff" },
];

function VoiceRings({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      {RING_MOMENTS.flatMap(({ at, color }) =>
        [0, 0.018].map((lag) => (
          <VoiceRing key={`${at}-${lag}`} progress={progress} at={at + lag} color={color} />
        )),
      )}
    </>
  );
}

function VoiceRing({ progress, at, color }: { progress: MotionValue<number>; at: number; color: string }) {
  const scale = useTransform(progress, [at - 0.012, at + 0.085], [0.6, 1.55], { ease: easeOut });
  const opacity = useTransform(progress, [at - 0.012, at + 0.004, at + 0.085], [0, 0.7, 0]);
  return <motion.div className={styles.ring} style={{ scale, opacity, color }} />;
}

function corePaint(core: string): string {
  return `radial-gradient(closest-side, ${core}f0 0%, ${core}a8 30%, ${core}3d 62%, ${core}00 100%)`;
}

/**
 * One colour layer that fades in around `from` and, when it is translucent
 * and must not tint the next colour, fades out again around `to`.
 */
function TintLayer({
  progress,
  from,
  to = 3,
  className,
  background,
}: {
  progress: MotionValue<number>;
  from: number;
  to?: number;
  className: string;
  background: string;
}) {
  const opacity = useTransform(
    progress,
    [from - 0.022, from + 0.022, to - 0.022, to + 0.022],
    [0, 1, 1, 0],
  );
  return <motion.div className={className} style={{ opacity, background }} />;
}

/* ---- Heading ------------------------------------------------------------- */

function Intro({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.03, 0.068], [1, 0]);
  const y = useTransform(progress, [0, 0.068], [0, -40]);
  const scale = useTransform(progress, [0, 0.068], [1, 0.96]);
  const blur = useTransform(progress, [0.03, 0.068], [0, 8]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.div className={styles.intro} style={{ opacity, y, scale, filter }}>
      <StoryHeading
        eyebrowClassName={styles.introEyebrow}
        eyebrowIcon={<AudioLines className="size-4 text-[var(--accent)]" aria-hidden="true" />}
        titleClassName={styles.introTitle}
      />
    </motion.div>
  );
}

/* ---- Chapters ------------------------------------------------------------ */

function ChapterText({
  chapter,
  index,
  progress,
}: {
  chapter: StoryChapter;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = chapterStart(index);
  const end = start + CHAPTER_LENGTH;
  // The first chapter follows the heading out; the others follow the wipe.
  const enter = index === 0 ? INTRO_END - 0.02 : start + 0.002;
  const leave = end - 0.034;

  return (
    <li className={styles.chapter}>
      <Line progress={progress} enter={enter} leave={leave} delay={0}>
        <p className={styles.chapterMeta} style={{ color: chapter.ink }}>
          <span className="tabular-nums">{chapter.number}</span>
          <span className={styles.chapterRule} aria-hidden="true" />
          <span>{chapter.screen.label}</span>
        </p>
      </Line>
      <Line progress={progress} enter={enter} leave={leave} delay={0.005} blur>
        <h3 className={styles.chapterTitle}>{chapter.title}</h3>
      </Line>
      <Line progress={progress} enter={enter} leave={leave} delay={0.01}>
        <p className={styles.chapterText}>{chapter.text}</p>
      </Line>
    </li>
  );
}

/** One line of a chapter: in from below, out upward, a beat after the line
 * above it. Headings also clear a short blur. */
function Line({
  progress,
  enter,
  leave,
  delay,
  blur = false,
  children,
}: {
  progress: MotionValue<number>;
  enter: number;
  leave: number;
  delay: number;
  blur?: boolean;
  children: ReactNode;
}) {
  const stops = [enter + delay, enter + delay + 0.03, leave + delay * 0.5, leave + delay * 0.5 + 0.026];
  const opacity = useTransform(progress, stops, [0, 1, 1, 0]);
  const y = useTransform(progress, stops, [34, 0, 0, -30]);
  const blurPx = useTransform(progress, stops, [blur ? 7 : 0, 0, 0, blur ? 7 : 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  return <motion.div style={blur ? { opacity, y, filter } : { opacity, y }}>{children}</motion.div>;
}

/* ---- Phone --------------------------------------------------------------- */

/** Slabs behind the glass give the turning phone its thickness. */
const EDGE_DEPTHS = [3, 6, 9, 12, 15];

function Phone({ progress }: { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, INTRO_END], ["72%", "0%"], { ease: easeOut });
  const rotateY = useTransform(progress, POSE_AT, ROTATE_Y, { ease: easeInOut });
  const rotateZ = useTransform(progress, POSE_AT, ROTATE_Z, { ease: easeInOut });
  const rotateX = useTransform(progress, LIFT_AT, ROTATE_X, { ease: easeInOut });
  const scale = useTransform(progress, LIFT_AT, SCALE, { ease: easeInOut });

  // The reflection slides across the glass against the turn, and is
  // strongest when the phone is turned furthest from the visitor.
  const sheenX = useTransform(rotateY, [-24, 24], ["-20%", "20%"]);
  const sheenOpacity = useTransform(rotateY, [-24, -10, 0, 10, 24], [1, 0.75, 0.3, 0.75, 1]);

  return (
    <motion.div className={styles.phone} style={{ y, rotateX, rotateY, rotateZ, scale }}>
      {EDGE_DEPTHS.map((depth) => (
        <div
          key={depth}
          className={styles.edge}
          style={{ transform: `translateZ(-${depth}px)` }}
          aria-hidden="true"
        />
      ))}
      <div className={styles.body}>
        <div className={styles.screen}>
          {CHAPTERS.map((chapter, index) => (
            <ScreenLayer key={chapter.screen.id} chapter={chapter} index={index} progress={progress} />
          ))}
          {CHAPTERS.slice(1).map((chapter, offset) => (
            <WipeLine
              key={chapter.screen.id}
              boundary={chapterStart(offset + 1)}
              color={chapter.core}
              progress={progress}
            />
          ))}
          <motion.div
            className={styles.sheen}
            style={{ x: sheenX, opacity: sheenOpacity }}
            aria-hidden="true"
          />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * One capture. It is revealed from the bottom edge at its chapter's start
 * while it slides up into place, like the next screen being swiped in; at
 * the next boundary it is pushed up and dimmed under the one that follows.
 */
function ScreenLayer({
  chapter,
  index,
  progress,
}: {
  chapter: StoryChapter;
  index: number;
  progress: MotionValue<number>;
}) {
  const inAt = index === 0 ? -1 : chapterStart(index);
  const outAt = index === CHAPTERS.length - 1 ? 2 : chapterStart(index + 1);
  const inRange = [inAt - WIPE_IN, inAt + WIPE_OUT];
  const outRange = [outAt - WIPE_IN, outAt + WIPE_OUT];

  const clipPath = useTransform(progress, inRange, ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"], {
    ease: easeInOut,
  });
  const riseIn = useTransform(progress, inRange, [10, 0], { ease: easeInOut });
  const pushOut = useTransform(progress, outRange, [0, -12], { ease: easeInOut });
  const y = useTransform([riseIn, pushOut], ([rise, push]: number[]) => `${rise + push}%`);
  const dim = useTransform(progress, outRange, [0, 0.62], { ease: easeInOut });

  return (
    <motion.div className={styles.layer} style={{ clipPath, y }}>
      <Image
        src={chapter.screen.phone}
        alt={chapter.screen.alt}
        width={PHONE_CAPTURE.width}
        height={PHONE_CAPTURE.height}
        sizes="(min-width: 1024px) 340px, 240px"
      />
      <motion.div className={styles.dim} style={{ opacity: dim }} aria-hidden="true" />
    </motion.div>
  );
}

/** The glowing edge of a wipe, in the incoming destination's dock colour. */
function WipeLine({
  boundary,
  color,
  progress,
}: {
  boundary: number;
  color: string;
  progress: MotionValue<number>;
}) {
  const range = [boundary - WIPE_IN, boundary + WIPE_OUT];
  const y = useTransform(progress, range, ["110%", "0%"], { ease: easeInOut });
  const opacity = useTransform(
    progress,
    [range[0], range[0] + 0.006, range[1] - 0.008, range[1]],
    [0, 1, 1, 0],
  );
  return (
    <motion.div className={styles.wipe} style={{ y, opacity, color }} aria-hidden="true">
      <div className={styles.wipeLine} />
    </motion.div>
  );
}

/* ---- Finale -------------------------------------------------------------- */

/** The hero's line, giant and behind the phone. Decorative: the hero's own
 * heading already says it, so this copy is hidden from assistive tech. */
function GiantWords({ progress }: { progress: MotionValue<number> }) {
  // In viewport widths, so each word starts wholly off its own side of the
  // stage whatever the width of the box it is centred in.
  const left = useTransform(progress, [F + 0.005, F + 0.105], ["-110vw", "0vw"], { ease: easeOut });
  const right = useTransform(progress, [F + 0.025, F + 0.125], ["110vw", "0vw"], { ease: easeOut });
  // A short fade on the way in, so a letter cut by the edge never pops.
  const leftOpacity = useTransform(progress, [F + 0.005, F + 0.035], [0, 1]);
  const rightOpacity = useTransform(progress, [F + 0.025, F + 0.055], [0, 1]);

  return (
    <div className={styles.giant} aria-hidden="true">
      <motion.span
        className={`${styles.giantWord} ${styles.giantOutline}`}
        style={{ x: left, opacity: leftOpacity }}
      >
        Stop scrolling.
      </motion.span>
      <motion.span
        className={`${styles.giantWord} ${styles.giantSolid}`}
        style={{ x: right, opacity: rightOpacity }}
      >
        Start talking.
      </motion.span>
    </div>
  );
}

/* ---- Rail ---------------------------------------------------------------- */

function Rail({
  progress,
  active,
  onSelect,
}: {
  progress: MotionValue<number>;
  active: number;
  onSelect: (index: number) => void;
}) {
  const fill = useTransform(progress, [chapterMid(0), chapterMid(CHAPTERS.length - 1)], [0, 1]);

  return (
    <nav className={styles.rail} aria-label="App story chapters">
      <div className={styles.railList}>
        <span className={styles.railTrack} aria-hidden="true">
          <motion.span className={styles.railFill} style={{ "--rail-fill": fill } as MotionStyle} />
        </span>
        <ol className={styles.railItems}>
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.screen.id}>
              <button
                type="button"
                className={`${styles.railButton} focus-ring`}
                aria-current={active === index ? "step" : undefined}
                data-done={active > index ? "true" : undefined}
                onClick={() => onSelect(index)}
                style={{ "--rail-ink": chapter.ink } as CSSProperties}
              >
                <span className={styles.railDot} aria-hidden="true" />
                <span className={styles.railNumber}>{chapter.number}</span>
                <span className={styles.railLabel}>{chapter.screen.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
