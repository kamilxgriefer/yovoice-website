"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
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
  type Transition,
  type Variants,
} from "framer-motion";

import { EASE_OUT, useSceneProgress } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import styles from "@/components/story/app-story.module.css";
import {
  CHAPTERS,
  FINALE_START,
  FINALE_TINT,
  INTRO_END,
  PHONE_CAPTURE,
  chapterMid,
  chapterStart,
  textStepAt,
  type StoryChapter,
} from "@/components/story/story-chapters";
import {
  STORY_EYEBROW,
  STORY_TITLE,
  StoryCta,
  StoryHeading,
} from "@/components/story/story-shared";

/**
 * The pinned app story — the homepage's product scene.
 *
 * A tall track with a sticky, full-height stage. The visitor's scroll through
 * the track is the only clock: the heading, a phone that rises and turns, a
 * flood of each destination's dock colour, four chapters whose screens wipe
 * in from the bottom like a swipe inside the app, and the hero's line, giant,
 * behind the phone. Scrolling back plays it backwards; stopping holds it.
 *
 * Only pictures are scrubbed (the flood, the phone, the wipes, the rings, the
 * giant words). Text never rests half-faded: the heading, each chapter's text
 * and the rail change on the chapter the scroll has reached, with a short
 * triggered transition that always runs to the end.
 *
 * What assistive technology reads is not the stage. The stage is a picture of
 * the story, hidden from it; the story itself — the heading and one heading
 * and sentence per chapter — sits in the track at the scroll position where
 * the stage shows it (`StoryText`). A screen reader moving to "Chats", a
 * magnifier following it, find in page or a link to `#inside-chats` all
 * scroll to where the Chats chapter is on screen.
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
   hand turning a phone to show it, and faces the visitor for the finale. */
const POSE_AT = [
  0, INTRO_END,
  B1 - SWING, B1 + SWING,
  B2 - SWING, B2 + SWING,
  B3 - SWING, B3 + SWING,
  F - 0.03, F + 0.07, 1,
];
const ROTATE_Y = [-24, -16, -12, 14, 10, -12, -8, 16, 12, 0, 0];
const ROTATE_Z = [-6, -2.4, -1.2, 2.8, 1.8, -3, -1.8, 2.6, 1.4, 0, 0];

/* Tilt and scale breathe at each boundary, then the finale lifts the phone
   a touch toward the visitor as the giant words arrive. */
const LIFT_AT = [
  0, INTRO_END,
  B1 - SWING, B1, B1 + SWING,
  B2 - SWING, B2, B2 + SWING,
  B3 - SWING, B3, B3 + SWING,
  F - 0.03, F + 0.06, 1,
];
const ROTATE_X = [22, 0, 0, 5, 0, 0, 5, 0, 0, 5, 0, 0, 0, 0];
const SCALE = [0.8, 1, 1, 0.955, 1, 1, 0.955, 1, 1, 0.955, 1, 1, 1.04, 1.04];

/** Once the words have landed, the phone steps back below them (wide
 * screens; see `.rig` in the stylesheet), and the scene rests from its end
 * until the stage lets go. */
const RETREAT = [F + 0.075, F + 0.16] as const;

/** The heading leaves once the phone starts to come up under it. */
const HEADING_OUT = 0.03;
/** How far past a threshold the progress must be before text changes, so a
 * spring settling right on one cannot flick it back and forth. */
const HOLD = 0.005;

/** Triggered text: in with the site's ease-out, out a little quicker. */
const TEXT_IN: Transition = { duration: 0.55, ease: EASE_OUT };
const TEXT_OUT: Transition = { duration: 0.32, ease: EASE_OUT };

export function AppStoryCinema() {
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useSceneProgress(trackRef);

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
        <StoryText />

        <div className={styles.stage}>
          <Flood progress={progress} />
          <div className={styles.shade} aria-hidden="true" />
          <Intro progress={progress} />
          <GiantWords progress={progress} />
          <ChapterTexts progress={progress} />

          <div className={`${styles.slot} ${styles.coreSlot}`} aria-hidden="true">
            <div className={styles.slotInner}>
              <Rig progress={progress}>
                <Cores progress={progress} />
                <VoiceRings progress={progress} />
              </Rig>
            </div>
          </div>

          <div className={`${styles.slot} ${styles.phoneSlot}`} aria-hidden="true">
            <div className={styles.slotInner}>
              <Rig progress={progress}>
                <Phone progress={progress} />
              </Rig>
            </div>
          </div>

          <Rail progress={progress} onSelect={goToChapter} />
        </div>
      </div>

      <Reveal distance={28}>
        <StoryCta large className="pb-12 pt-6 sm:pb-16 sm:pt-8" />
      </Reveal>
    </section>
  );
}

/* ---- What assistive technology reads ------------------------------------ */

/**
 * The story as text, in the track rather than on the stage: the heading at
 * the top, each chapter at its middle (`--at`, a fraction of the track's
 * travel). Every box here is one screen tall with its words half-way down,
 * so whatever brings one into view — a screen reader's cursor, a magnifier,
 * find in page, `scrollIntoView` or a `#inside-chats` link, aligning to the
 * top, the centre or the bottom — stops with the stage showing that very
 * text. Visually hidden: the stage draws it.
 */
function StoryText() {
  return (
    <>
      <div className={styles.anchor} style={{ "--at": 0 } as CSSProperties}>
        <StoryHeading />
      </div>
      <ol className={styles.anchors} aria-label="Four places in YO Voice">
        {CHAPTERS.map((chapter, index) => (
          <li
            key={chapter.screen.id}
            id={`inside-${chapter.screen.id}`}
            className={styles.anchor}
            style={{ "--at": chapterMid(index) } as CSSProperties}
          >
            <p>
              {chapter.number} {chapter.screen.label}
            </p>
            <h3>{chapter.title}</h3>
            <p>{chapter.text}</p>
          </li>
        ))}
      </ol>
    </>
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

/**
 * The finale's step back: on wide screens the phone (and the glow behind
 * it) shrinks and drops below the giant words once they have landed, so the
 * line reads whole. The distance is worked out in CSS from the phone's
 * height and the words' size (`.rig`); here it is only a 0 → 1 amount.
 */
function Rig({ progress, children }: { progress: MotionValue<number>; children: ReactNode }) {
  const retreat = useTransform(progress, [...RETREAT], [0, 1], { ease: easeInOut });
  return (
    <motion.div className={styles.rig} style={{ "--retreat": retreat } as MotionStyle}>
      {children}
    </motion.div>
  );
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

/** The stage's picture of the heading. It steps back with the scroll
 * (transform only), and leaves — or comes back — in one short triggered
 * fade, so it is never left half-faded. */
function Intro({ progress }: { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 0.06], [0, -32]);
  const [away, setAway] = useState(() => progress.get() > HEADING_OUT);

  useMotionValueEvent(progress, "change", (value) => {
    if (value > HEADING_OUT + HOLD) setAway(true);
    else if (value < HEADING_OUT - HOLD) setAway(false);
  });

  return (
    <motion.div className={styles.intro} style={{ y }} aria-hidden="true">
      <motion.div
        initial={false}
        animate={
          away
            ? {
                opacity: 0,
                scale: 0.97,
                filter: "blur(6px)",
                transition: TEXT_OUT,
                transitionEnd: { visibility: "hidden" },
              }
            : {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                visibility: "visible",
                transition: TEXT_IN,
              }
        }
      >
        <p className={styles.introEyebrow}>
          <AudioLines className="size-4 text-[var(--accent)]" aria-hidden="true" />
          {STORY_EYEBROW}
        </p>
        <p className={styles.introTitle}>{STORY_TITLE}</p>
      </motion.div>
    </motion.div>
  );
}

/* ---- Chapters ------------------------------------------------------------ */

/** The chapter the scroll has reached, held steady across a boundary. */
function useTextStep(progress: MotionValue<number>): number {
  const [step, setStep] = useState(() => textStepAt(progress.get()));
  useMotionValueEvent(progress, "change", (value) => {
    const before = textStepAt(value - HOLD);
    const after = textStepAt(value + HOLD);
    if (before === after) setStep(before);
  });
  return step;
}

/** The stage's picture of the chapter text. All four share one cell; the
 * one the scroll has reached is shown, the others wait below it (still to
 * come) or have left above it (already read), hidden outright once out. */
function ChapterTexts({ progress }: { progress: MotionValue<number> }) {
  const step = useTextStep(progress);
  return (
    <div className={styles.text} aria-hidden="true">
      {CHAPTERS.map((chapter, index) => (
        <motion.div
          key={chapter.screen.id}
          className={styles.chapter}
          initial={false}
          animate={index === step ? "shown" : index > step ? "coming" : "gone"}
        >
          <motion.p className={styles.chapterMeta} style={{ color: chapter.ink }} variants={LINES[0]}>
            <span className="tabular-nums">{chapter.number}</span>
            <span className={styles.chapterRule} />
            <span>{chapter.screen.label}</span>
          </motion.p>
          <motion.p className={styles.chapterTitle} variants={LINES[1]}>
            {chapter.title}
          </motion.p>
          <motion.p className={styles.chapterText} variants={LINES[2]}>
            {chapter.text}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}

/** One line of a chapter: in from below (or from above, scrolling back), a
 * beat after the line above it, out the other way. The title also clears a
 * short blur. Either way the transition runs to its end. */
function lineVariants(order: number, blur: boolean): Variants {
  const out = (y: number) => ({
    opacity: 0,
    y,
    ...(blur ? { filter: "blur(6px)" } : {}),
    transition: { ...TEXT_OUT, delay: order * 0.03 },
    transitionEnd: { visibility: "hidden" as const },
  });
  return {
    shown: {
      opacity: 1,
      y: 0,
      ...(blur ? { filter: "blur(0px)" } : {}),
      visibility: "visible",
      transition: { ...TEXT_IN, delay: 0.16 + order * 0.07 },
    },
    coming: out(26),
    gone: out(-22),
  };
}

const LINES = [lineVariants(0, false), lineVariants(1, true), lineVariants(2, false)];

/* ---- Phone --------------------------------------------------------------- */

/** Slabs behind the glass give the turning phone its thickness. */
const EDGE_DEPTHS = [3, 6, 9, 12, 15];

function Phone({ progress }: { progress: MotionValue<number> }) {
  // It starts just under the heading, so the first pinned frame already
  // shows most of it, and rises into place as the heading leaves.
  const y = useTransform(progress, [0, INTRO_END], ["40%", "0%"], { ease: easeOut });
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
        <div key={depth} className={styles.edge} style={{ transform: `translateZ(-${depth}px)` }} />
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
          <motion.div className={styles.sheen} style={{ x: sheenX, opacity: sheenOpacity }} />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * One capture. It is revealed from the bottom edge at its chapter's start
 * while it slides up into place, like the next screen being swiped in; at
 * the next boundary it is pushed up and dimmed under the one that follows.
 *
 * Decorative here (the whole phone is hidden from assistive technology): the
 * hero describes each screen, and the chapter text says what it is for.
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
      {/* Drawn at most ~346px wide on wide screens (a 768px-tall phone) and
          about a quarter of the window's height on phones. */}
      <Image
        src={chapter.screen.phone}
        alt=""
        width={PHONE_CAPTURE.width}
        height={PHONE_CAPTURE.height}
        sizes="(min-width: 1024px) min(34vh, 346px), 26vh"
      />
      <motion.div className={styles.dim} style={{ opacity: dim }} />
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
 * heading already says it, so this copy is hidden from assistive tech. On
 * wide screens each word fades in across a soft edge (`.giant`'s mask) as it
 * slides in, and the phone then steps back below the line (`Rig`). */
function GiantWords({ progress }: { progress: MotionValue<number> }) {
  // In viewport widths, so each word starts wholly off its own side of the
  // stage whatever the width of the box it is centred in.
  const left = useTransform(progress, [F + 0.005, F + 0.09], ["-110vw", "0vw"], { ease: easeOut });
  const right = useTransform(progress, [F + 0.02, F + 0.105], ["110vw", "0vw"], { ease: easeOut });
  // A short fade on the way in, done while the word is still mostly off
  // stage, so a letter crossing the edge never pops.
  const leftOpacity = useTransform(progress, [F + 0.005, F + 0.03], [0, 1]);
  const rightOpacity = useTransform(progress, [F + 0.02, F + 0.045], [0, 1]);
  // Out of find in page's way until they are on stage.
  const leftVisibility = useTransform(leftOpacity, (value) => (value > 0 ? "visible" : "hidden"));
  const rightVisibility = useTransform(rightOpacity, (value) => (value > 0 ? "visible" : "hidden"));

  return (
    <div className={styles.giant} aria-hidden="true">
      <motion.span
        className={`${styles.giantWord} ${styles.giantOutline}`}
        style={{ x: left, opacity: leftOpacity, visibility: leftVisibility }}
      >
        Stop scrolling.
      </motion.span>
      <motion.span
        className={`${styles.giantWord} ${styles.giantSolid}`}
        style={{ x: right, opacity: rightOpacity, visibility: rightVisibility }}
      >
        Start talking.
      </motion.span>
    </div>
  );
}

/* ---- Rail ---------------------------------------------------------------- */

/**
 * The numbered chapter rail: links to the chapters' own anchors, so they
 * work as plain in-page links too (a new tab, a copied address). A click
 * glides to the middle of that chapter instead of jumping.
 *
 * It appears with the first chapter (a CSS fade on `data-shown`), and is
 * drawn whenever it holds keyboard focus, so a link is never focused unseen.
 */
function Rail({
  progress,
  onSelect,
}: {
  progress: MotionValue<number>;
  onSelect: (index: number) => void;
}) {
  // The same step as the chapter text: current while its text is shown,
  // done once read, all done in the finale.
  const current = useTextStep(progress);
  const fill = useTransform(progress, [chapterMid(0), chapterMid(CHAPTERS.length - 1)], [0, 1]);

  const select = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    // Let the browser open a new tab or window as usual.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onSelect(index);
  };

  return (
    <nav
      className={styles.rail}
      aria-label="Inside YO Voice chapters"
      data-shown={current >= 0 ? "true" : "false"}
    >
      <div className={styles.railList}>
        <span className={styles.railTrack} aria-hidden="true">
          <motion.span className={styles.railFill} style={{ "--rail-fill": fill } as MotionStyle} />
        </span>
        <ol className={styles.railItems}>
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.screen.id}>
              <a
                href={`#inside-${chapter.screen.id}`}
                className={`${styles.railLink} focus-ring`}
                aria-current={current === index ? "step" : undefined}
                data-done={current > index ? "true" : undefined}
                onClick={(event) => select(event, index)}
                style={{ "--rail-ink": chapter.ink } as CSSProperties}
              >
                <span className={styles.railDot} aria-hidden="true" />
                <span className={styles.railNumber}>{chapter.number}</span>
                <span className={styles.railLabel}>{chapter.screen.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
