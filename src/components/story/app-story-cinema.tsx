"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import {
  easeInOut,
  easeOut,
  frame,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionStyle,
  type MotionValue,
  type Transition,
  type Variants,
} from "framer-motion";

import {
  DUR,
  EASE_IN,
  EASE_OUT,
  EXIT,
  RISE,
  STAGGER,
  useSceneProgress,
  useScrollLean,
} from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import { SceneOpener } from "@/components/animations/scene-opener";
import { mix } from "@/components/animations/tint";
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
import { StoryPhoneGL } from "@/components/story/story-phone-canvas";
import { FAN } from "@/components/story/story-pose";
import {
  STORY_EYEBROW,
  STORY_INK,
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
 * The phone is drawn twice. The CSS phone below is the baseline; where
 * WebGL 2 runs on a real GPU, a lit 3D phone takes over from it once loaded
 * (`StoryPhoneGL`, fetched once the visitor scrolls toward the story), turns
 * further, catches each dock colour on its bevel, and on wide screens ends
 * the story on the whole range — the four destinations fanned out under
 * "Start talking.". The CSS phone stays mounted underneath and takes the
 * stage back if the 3D phone cannot keep up or loses its context.
 *
 * Every animated value is a transform, an opacity or a clip-path, with one
 * exception: the weight of the decorative "Start talking." as it lands,
 * inside a box held at its heaviest width (`GiantWords`).
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
/** One change of the progress larger than this is the scene landing
 * somewhere new (see `useTextStep`); the spring following a scroll moves it
 * far less per frame. */
const RELOCATION = 0.15;

/** Triggered text, in the page's motion language: in with the ease-out,
 * out quicker with the ease-in (a cut, not a drift). */
const TEXT_IN: Transition = { duration: DUR.text, ease: EASE_OUT };
const TEXT_OUT: Transition = { duration: EXIT.duration, ease: EASE_IN };
/** … or at once, when the scene lands somewhere new. */
const LAND: Transition = { duration: 0 };

export function AppStoryCinema() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const progress = useSceneProgress(trackRef);

  // Mounted mid-page (client Back to the homepage, the cinema re-arming), the
  // scene starts where the page already is, before its first frame is drawn:
  // the spring has not measured the scroll yet and would otherwise read 0 —
  // the opening pose, with the heading over whatever chapter is really there.
  useLayoutEffect(() => {
    const at = trackProgress(trackRef.current);
    if (at !== null) progress.jump(at);
  }, [progress]);

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

        <div ref={stageRef} className={styles.stage}>
          <Flood progress={progress} />
          <div className={styles.shade} aria-hidden="true" />
          <Intro progress={progress} />
          <GiantWords progress={progress} />
          <ChapterTexts progress={progress} />

          <CoreSlot progress={progress}>
            <Rig progress={progress}>
              <Cores progress={progress} />
              <VoiceRings progress={progress} />
            </Rig>
          </CoreSlot>

          <div ref={slotRef} className={`${styles.slot} ${styles.phoneSlot}`} aria-hidden="true">
            <div className={styles.slotInner}>
              <Rig progress={progress}>
                <Phone progress={progress} />
              </Rig>
            </div>
          </div>
          <StoryPhoneGL progress={progress} trackRef={trackRef} stageRef={stageRef} slotRef={slotRef} />
          <Floor progress={progress} />

          <Rail progress={progress} onSelect={goToChapter} />
        </div>
      </div>

      {/* On the seam violet the stage fades into, which Welcome's top
          continues: one colour from the story's foot into the next section. */}
      <div className="bg-[var(--seam)]">
        <Reveal distance={RISE.block}>
          <StoryCta large className="pb-12 pt-6 sm:pb-16 sm:pt-8" />
        </Reveal>
      </div>
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
 * chapter's colour in turn and returns to deep violet for the finale.
 *
 * On phones the 3D phone arrives tilted further back than the CSS phone, so
 * its lower edge sits higher while the iris is still small: there the iris
 * opens that much higher (`--iris-gl-lift`, while `data-gl` is set), until
 * the two phones stand alike. */
function Flood({ progress }: { progress: MotionValue<number> }) {
  const radius = useTransform(progress, [0.004, INTRO_END + 0.006], [0, 150], { ease: easeInOut });
  const drop = useTransform(progress, [0, INTRO_END], [55, 0], { ease: easeOut });
  const glLift = useTransform(progress, [0.03, 0.075], [1, 0], { ease: easeInOut });
  const clipPath = useMotionTemplate`circle(${radius}% at 50% calc(var(--iris-y) + ${drop}% - var(--iris-gl) * var(--iris-gl-lift) * ${glLift}))`;

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

/**
 * The bright core's place behind the phone. With the 3D phone's range on
 * wide screens, the glow fades out as the four phones fan out (`--core-fan`,
 * read only while `data-gl` is set), so no glow is left in a gap between
 * them.
 */
function CoreSlot({ progress, children }: { progress: MotionValue<number>; children: ReactNode }) {
  const fan = useTransform(progress, [FAN[0], FAN[0] + (FAN[1] - FAN[0]) * 0.6], [1, 0]);
  return (
    <motion.div
      className={`${styles.slot} ${styles.coreSlot}`}
      style={{ "--core-fan": fan } as MotionStyle}
      aria-hidden="true"
    >
      <div className={styles.slotInner}>{children}</div>
    </motion.div>
  );
}

/** As the phone steps back it sinks into the page: the stage's floor fades
 * to the page's own background in front of it, so when the stage lets go
 * its lower edge meets the section below without a line through the phone
 * (wide screens only; see `.floor`). */
function Floor({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [...RETREAT], [0, 1]);
  return <motion.div className={styles.floor} style={{ opacity }} aria-hidden="true" />;
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

/** 1 once the heading has left the stage, 0 while it holds it. */
const headingStepAt = (value: number) => (value > HEADING_OUT ? 1 : 0);

/**
 * The stage's picture of the heading: the page's section opener, on the
 * frame. The first time it comes into view the rule draws and the title's
 * words rise out of their baseline; once the phone comes up under it, it
 * leaves the stage with the opener's exit cue and comes back the same way
 * (`away`), never left half-faded. It also steps back a little with the
 * scroll (transform only).
 *
 * When the scene lands somewhere new (a link, a restored position) a fresh
 * opener is drawn in its new state at once (`landing` keys it), like the
 * chapter text, instead of fading its way there.
 */
function Intro({ progress }: { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 0.06], [0, -32]);
  const { step, landing } = useTextStep(progress, headingStepAt);

  return (
    <motion.div className={styles.intro} style={{ y }} aria-hidden="true">
      <SceneOpener
        key={landing}
        eyebrow={STORY_EYEBROW}
        title={STORY_TITLE}
        ink={STORY_INK}
        size="scene"
        away={step === 1}
        titleClassName={styles.introTitle}
      />
    </motion.div>
  );
}

/* ---- Chapters ------------------------------------------------------------ */

/**
 * Where the scroll has brought a triggered piece of text: the chapter the
 * stage shows (`textStepAt`), or whether the heading has left.
 *
 * - While the visitor scrolls, it follows the scene's spring and changes
 *   only once the progress is `HOLD` past a threshold, so a spring settling
 *   right on one cannot flick the text back and forth. Its transition runs.
 * - When the progress arrives in one move rather than frame by frame (a jump
 *   bigger than the hold band: an in-page link, a restored position), it is
 *   read straight from where the progress now is, even inside a hold band.
 *   A move bigger than `RELOCATION`, or the first one after the scene mounts
 *   (the spring starting where the page already is), is the scene landing
 *   somewhere new: `land` is set, and the text lands with the picture, in
 *   the same frame, instead of fading through the way there.
 */
function useTextStep(
  progress: MotionValue<number>,
  stepAt: (value: number) => number = textStepAt,
): { step: number; land: boolean; landing: number } {
  const [state, setState] = useState(() => ({ step: stepAt(progress.get()), land: true, landing: 0 }));
  const last = useRef<number | null>(null);

  useMotionValueEvent(progress, "change", (value) => {
    const moved = last.current === null ? Number.POSITIVE_INFINITY : Math.abs(value - last.current);
    last.current = value;
    let step = stepAt(value);
    if (moved <= 2 * HOLD) {
      const before = stepAt(value - HOLD);
      if (before !== stepAt(value + HOLD)) return;
      step = before;
    }
    const land = moved > RELOCATION;
    const update = () =>
      setState((current) =>
        current.step === step ? current : { step, land, landing: current.landing + (land ? 1 : 0) },
      );
    if (land) commitInThisFrame(update);
    else update();
  });

  return state;
}

/**
 * Commits a landing in the frame the picture lands in. The spring lands
 * while the scroll's notifications run; the update is committed right after
 * them, in the same pass of the frame loop (never inside them, where a render
 * would re-subscribe the very transforms being notified), so the text's
 * instant change is drawn with this frame's picture rather than the next.
 */
function commitInThisFrame(update: () => void) {
  frame.preUpdate(() => flushSync(update), false, true);
}

/** How far the stage is through its track right now (0..1, the scene
 * progress without the spring), read from the layout. */
function trackProgress(track: HTMLElement | null): number | null {
  if (!track) return null;
  const box = track.getBoundingClientRect();
  const travel = box.height - document.documentElement.clientHeight;
  if (travel <= 0) return null;
  return Math.min(1, Math.max(0, -box.top / travel));
}

/** The stage's picture of the chapter text. All four share one cell; the
 * one the scroll has reached is shown, the others wait below it (still to
 * come) or have left above it (already read), hidden outright once out. */
function ChapterTexts({ progress }: { progress: MotionValue<number> }) {
  const { step, land } = useTextStep(progress);
  const lines = land ? LANDED_LINES : LINES;
  return (
    <div className={styles.text} aria-hidden="true">
      {CHAPTERS.map((chapter, index) => (
        <motion.div
          key={chapter.screen.id}
          className={styles.chapter}
          initial={false}
          animate={index === step ? "shown" : index > step ? "coming" : "gone"}
        >
          <motion.p className={styles.chapterMeta} style={{ color: chapter.ink }} variants={lines[0]}>
            <span className="tabular-nums">{chapter.number}</span>
            <span className={styles.chapterRule} />
            <span>{chapter.screen.label}</span>
          </motion.p>
          <motion.p className={styles.chapterTitle} variants={lines[1]}>
            {chapter.title}
          </motion.p>
          <motion.p className={styles.chapterText} variants={lines[2]}>
            {chapter.text}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}

/** One line of a chapter: in from below (or from above, scrolling back), a
 * line's beat after the line above it, out the other way with the exit cue.
 * The title also clears a short blur. Either way the transition runs to its
 * end — or, when the scene lands somewhere new (`land`), there is none. */
function lineVariants(order: number, blur: boolean, land: boolean): Variants {
  const outDelay = order * STAGGER.word;
  const out = (y: number) => ({
    opacity: 0,
    y,
    ...(blur ? { filter: `blur(${EXIT.blur}px)` } : {}),
    // Hidden outright once faded (out of find in page's way). Set as a
    // value of its own, so it also cancels a "visible" still waiting on an
    // entrance's delay when the visitor scrolls straight through.
    visibility: "hidden",
    transition: land
      ? LAND
      : {
          ...TEXT_OUT,
          delay: outDelay,
          visibility: { duration: 0, delay: outDelay + (TEXT_OUT.duration ?? 0) },
        },
  });
  return {
    shown: {
      opacity: 1,
      y: 0,
      ...(blur ? { filter: "blur(0px)" } : {}),
      visibility: "visible",
      transition: land
        ? LAND
        : { ...TEXT_IN, delay: 0.16 + order * STAGGER.line, visibility: { duration: 0, delay: 0 } },
    },
    coming: out(RISE.line),
    gone: out(EXIT.y),
  };
}

const LINES = [0, 1, 2].map((order) => lineVariants(order, order === 1, false));
const LANDED_LINES = [0, 1, 2].map((order) => lineVariants(order, order === 1, true));

/* ---- Phone --------------------------------------------------------------- */

/** Slabs behind the glass give the turning phone its thickness. */
const EDGE_DEPTHS = [3, 6, 9, 12, 15];

function Phone({ progress }: { progress: MotionValue<number> }) {
  // It starts just under the heading, so the first pinned frame already
  // shows most of it, and rises into place as the heading leaves: `--rise`
  // runs 1 → 0, times a distance the stylesheet sets for the layout
  // (`--rise-from` on `.phone`).
  const rise = useTransform(progress, [0, INTRO_END], [1, 0], { ease: easeOut });
  const rotateY = useTransform(progress, POSE_AT, ROTATE_Y, { ease: easeInOut });
  const rotateZ = useTransform(progress, POSE_AT, ROTATE_Z, { ease: easeInOut });
  const rotateX = useTransform(progress, LIFT_AT, ROTATE_X, { ease: easeInOut });
  const scale = useTransform(progress, LIFT_AT, SCALE, { ease: easeInOut });

  // The reflection slides across the glass against the turn, and is
  // strongest when the phone is turned furthest from the visitor.
  const sheenX = useTransform(rotateY, [-24, 24], ["-20%", "20%"]);
  const sheenOpacity = useTransform(rotateY, [-24, -10, 0, 10, 24], [1, 0.75, 0.3, 0.75, 1]);

  return (
    <motion.div
      className={styles.phone}
      style={{ "--rise": rise, rotateX, rotateY, rotateZ, scale } as MotionStyle}
    >
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

/** The words lean at most this far (degrees) with the speed of the scroll. */
const LEAN = 7;

/** "Start talking." arrives quiet and lands loud: its weight over its slide,
 * in steps of `WEIGHT_STEP`, so the text is re-set about twenty times a pass
 * rather than every frame. */
const QUIET = 300;
const LOUD = 800;
const WEIGHT_STEP = 25;

/** The hero's line, giant and behind the phone. Decorative: the hero's own
 * heading already says it, so this copy is hidden from assistive tech. Each
 * word slides in from its own side — on wide screens across a soft edge
 * (`.giant`'s mask) — and the phone then steps back below the line (`Rig`),
 * or, with the 3D phone, the whole range fans out under it.
 *
 * The words speak: both lean into the direction of the scroll with its
 * speed and straighten the moment it stops (a transform), and the solid
 * line gets louder as it lands, from a light weight to the heavy one. Its
 * box is held at the heavy weight's width by an invisible copy, so the
 * changing weight never moves anything around it. The lean follows the
 * scroll only while the words are out and on screen (`Lean`); anywhere else
 * on the page it is not listening, so it asks for no frames there. */
function GiantWords({ progress }: { progress: MotionValue<number> }) {
  const giantRef = useRef<HTMLDivElement>(null);
  // In viewport widths, so each word starts wholly off its own side of the
  // stage whatever the width of the box it is centred in.
  const leftVw = useTransform(progress, [F + 0.005, F + 0.09], [-110, 0], { ease: easeOut });
  const rightVw = useTransform(progress, [F + 0.02, F + 0.105], [110, 0], { ease: easeOut });
  const left = useMotionTemplate`${leftVw}vw`;
  const right = useMotionTemplate`${rightVw}vw`;
  const skewX = useMotionValue(0);
  const leaning = useFinaleInView(progress, giantRef);
  // Quiet while it is still most of a screen away, loud as it lands; in
  // steps, so the text is only re-set when the weight really changes.
  const fontWeight = useTransform(rightVw, (vw) => {
    const k = Math.max(0, 1 - Math.abs(vw) / 90);
    return Math.round((QUIET + (LOUD - QUIET) * k * k) / WEIGHT_STEP) * WEIGHT_STEP;
  });
  // Always at full strength: a word is either off stage or sliding in whole,
  // never a faint copy wherever the scroll stops. Until it sets off it is
  // not drawn at all, which also keeps it out of find in page.
  const leftVisibility = useTransform(progress, (value) => (value > F + 0.005 ? "visible" : "hidden"));
  const rightVisibility = useTransform(progress, (value) => (value > F + 0.02 ? "visible" : "hidden"));

  return (
    <div ref={giantRef} className={styles.giant} aria-hidden="true">
      {leaning && <Lean skewX={skewX} />}
      <motion.span
        className={`${styles.giantWord} ${styles.giantOutline}`}
        style={{ x: left, visibility: leftVisibility }}
      >
        <motion.span className={styles.lean} style={{ skewX }}>
          Stop scrolling.
        </motion.span>
      </motion.span>
      <motion.span
        className={`${styles.giantWord} ${styles.giantSolid}`}
        style={{ x: right, visibility: rightVisibility }}
      >
        <motion.span className={`${styles.lean} ${styles.loud}`} style={{ skewX }}>
          <span className={styles.loudBox}>Start talking.</span>
          <motion.span className={styles.loudWord} style={{ fontWeight }}>
            Start talking.
          </motion.span>
        </motion.span>
      </motion.span>
    </div>
  );
}

/** Whether the giant words may be out and on screen: the finale reached
 * (just before the first word sets off, while both are still off stage and
 * hidden) and the stage in the window. */
function useFinaleInView(progress: MotionValue<number>, ref: RefObject<HTMLElement | null>): boolean {
  const [reached, setReached] = useState(() => progress.get() > F - 0.01);
  const [inView, setInView] = useState(false);
  useMotionValueEvent(progress, "change", (value) => setReached(value > F - 0.01));
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return reached && inView;
}

/** The lean, mounted only while the words can be seen: it drives both
 * words' skew and sets it straight again when it lets go (off screen, or
 * with both words back off stage). */
function Lean({ skewX }: { skewX: MotionValue<number> }) {
  const lean = useScrollLean(LEAN);
  useMotionValueEvent(lean, "change", (degrees) => skewX.set(-degrees));
  useEffect(() => () => skewX.set(0), [skewX]);
  return null;
}

/* ---- Rail ---------------------------------------------------------------- */

/**
 * The numbered chapter rail: links to the chapters' own anchors, so they
 * work as plain in-page links too (a new tab, a copied address, the
 * keyboard). A pointer's click glides to the middle of that chapter instead
 * of jumping; a link followed from the keyboard lands on the chapter's
 * anchor, which is at that same middle.
 *
 * It appears with the first chapter and steps aside for the finale's line
 * once the chapters are done (a CSS fade on `data-shown`), and is drawn
 * whenever it holds keyboard focus, so a link is never focused unseen.
 */
function Rail({
  progress,
  onSelect,
}: {
  progress: MotionValue<number>;
  onSelect: (index: number) => void;
}) {
  // The same step as the chapter text: current while its text is shown,
  // done once read, all done in the finale. When the scene lands somewhere
  // new, the rail is drawn in its new state at once (`data-land`).
  const { step: current, land } = useTextStep(progress);
  const fill = useTransform(progress, [chapterMid(0), chapterMid(CHAPTERS.length - 1)], [0, 1]);

  const select = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    // A pointer's click glides; the keyboard (`detail` 0) follows the link
    // itself, so focus, a screen reader's position and the address move to
    // the chapter too (it lands in the same place). Let the browser open a
    // new tab or window as usual.
    if (event.detail === 0) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onSelect(index);
  };

  return (
    <nav
      className={styles.rail}
      aria-label="Inside YO Voice chapters"
      data-shown={current >= 0 && current < CHAPTERS.length ? "true" : "false"}
      data-land={land ? "true" : undefined}
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
