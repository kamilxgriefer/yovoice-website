"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  animate,
  cubicBezier,
  easeInOut,
  easeOut,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type Variants,
} from "framer-motion";

import { EASE_OUT, useSceneProgress } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import styles from "@/components/sections/welcome-features-cinema.module.css";
import {
  BrowserBar,
  FeatureRowBody,
  SCREEN_NOTE,
  SCREEN_VIEWS,
  type Feature,
  type ScreenView,
} from "@/components/sections/welcome-features-parts";

/**
 * "What you get" as the page's big-screen moment.
 *
 * YO Voice, in a browser on a large screen, starts small under the heading
 * and lying back like a laptop lid seen from above. As the visitor scrolls it
 * rises, faces them and grows until it fills the stage, then, while it is
 * big, Home wipes over to Chats and Chats to Friends, each with a short
 * caption. At the end it settles back a little and the stage lets go; the
 * five feature rows rise in under it.
 *
 * On a portrait window (a phone) the full-size screen is as tall as the stage
 * allows, so the capture is drawn big enough to read and is wider than the
 * window: the camera zooms in from the whole screen to its left edge, pans
 * across each view (Home left to right, Chats back, Friends across again),
 * wipes while it is parked at an end, and zooms back out to the whole screen
 * at the end. The pin is shorter there.
 *
 * The visitor's scroll is the only clock. Everything scrubbed here is a
 * transform, a clip-path on a capture or the opacity of a decorative layer
 * (glow, glare, the screen's dimmer). Words are never left half-faded: the
 * heading leaves by a short triggered fade the moment the rising screen
 * reaches it, the first caption arrives in the same moment (so the stage
 * always carries one line of words), and the captions change by a short
 * triggered crossfade.
 *
 * Only mounted while the scroll cinema is on; `WelcomeFeatures` renders the
 * static layout otherwise, with the same heading, sentence, rows and link.
 */

/**
 * The timeline over the pinned stage's progress `p`. `rise` is where the
 * screen reaches full size; `wipes` are Home → Chats and Chats → Friends;
 * `settle` is where it starts to settle back. `pans` is where the camera is
 * across the capture (0 its left end, 1 its right end) at the end of each
 * view; it only moves when the capture is wider than the window. `captionIn`
 * is where the first progress segment starts to fill, and `headingLatest`
 * the latest the heading stays, whatever the geometry says.
 */
type Timeline = {
  rise: number;
  wipes: readonly [readonly [number, number], readonly [number, number]];
  settle: number;
  pans: readonly [number, number, number];
  captionIn: number;
  headingLatest: number;
};

const LANDSCAPE: Timeline = {
  rise: 0.34,
  wipes: [
    [0.46, 0.54],
    [0.65, 0.73],
  ],
  settle: 0.86,
  pans: [1, 0, 0.6],
  captionIn: 0.08,
  headingLatest: 0.2,
};

/* A shorter pin (240svh against a landscape window's 320svh): the rise is
   quicker, and the three pans take most of it. */
const PORTRAIT: Timeline = {
  rise: 0.2,
  wipes: [
    [0.4, 0.47],
    [0.66, 0.73],
  ],
  settle: 0.88,
  /* Home across to its right end, Chats back to the rail, Friends over to
     its Add friend button and message buttons (its right end is empty). */
  pans: [1, 0, 0.6],
  captionIn: 0.04,
  headingLatest: 0.12,
};

/** Where the view changes: the middle of each wipe. */
function switches(timeline: Timeline): readonly [number, number] {
  const [first, second] = timeline.wipes;
  return [(first[0] + first[1]) / 2, (second[0] + second[1]) / 2];
}

function viewAt(p: number, timeline: Timeline): number {
  const [first, second] = switches(timeline);
  if (p < first) return 0;
  if (p < second) return 1;
  return 2;
}

/** How far past a boundary the progress must be before the caption changes. */
const HOLD = 0.006;
/** The same for the heading, in px of the screen's projected top edge. */
const HOLD_PX = 4;

/**
 * The two poses of the screen. `tilt` is how far it lies back (rotateX) at
 * the start; `scale` the most it starts at (on a portrait window it starts at
 * the window's width instead); `settleScale` and `settleTilt` where it
 * settles to (again at most the window's width). `perspective` is its
 * parent's, in px, and `originY` the height it pivots at. While the section
 * is still coming into view the screen trails a little (`preLift` of its
 * height), so it drifts up to its start under the heading rather than
 * arriving with it.
 *
 * Where it starts is measured, not guessed: its projected top edge starts
 * `START_GAP` px under the heading, whatever the window's height.
 */
const POSES = {
  landscape: {
    tilt: 52, preLift: 0.22, scale: 0.55,
    settleScale: 0.9, settleTilt: 7, perspective: 1600, originY: 0.72,
  },
  portrait: {
    tilt: 48, preLift: 0.14, scale: 0.72,
    settleScale: 0.94, settleTilt: 5, perspective: 1200, originY: 0.72,
  },
} as const;
type Pose = (typeof POSES)[keyof typeof POSES];

const START_GAP = 56;
/** The heading leaves once the screen's top edge comes this close to it. */
const EXIT_GAP = 24;
/** On a window narrower than the capture, the screen's edge stays this far in at either end. */
const EDGE_INSET = 16;
/** The heading steps back (scrubbed) over the first part of the rise. */
const HEADING_STEP = 0.08;

/** What the stage measured: layout boxes, untransformed, in px. */
type Geometry = {
  ready: boolean;
  /** The screen's laid-out size (its full size). */
  width: number;
  height: number;
  /** The room across: the window's width. */
  room: number;
  bezel: number;
  /** The screen's layout top, in the stage. */
  top: number;
  /** The heading's layout bottom and height, in the stage. */
  headingBottom: number;
  headingHeight: number;
  /** How far below its final place the screen starts. */
  start: number;
};

const UNMEASURED: Geometry = {
  ready: false, width: 1, height: 1, room: 1, bezel: 0, top: 0,
  headingBottom: 0, headingHeight: 0, start: 0,
};

/**
 * How far below its final place (px) the screen starts: the offset that puts
 * the projected top edge of the tilted, scaled screen `START_GAP` px under
 * the heading's box. The transform is `translateY scale rotateX` about
 * `originY`, seen through the frame's perspective from its top centre (a 2D
 * `scale` leaves depth alone).
 */
function startOffset(pose: Pose, scale: number, headingBottom: number, top: number, height: number) {
  const theta = (pose.tilt * Math.PI) / 180;
  const origin = pose.originY * height;
  const target = headingBottom + START_GAP - top;
  const unprojected = (target * (pose.perspective + origin * Math.sin(theta))) / pose.perspective;
  return unprojected - origin + origin * scale * Math.cos(theta);
}

/** The scale at which the whole screen fits across the window. */
function fitScale(geometry: Geometry) {
  return (geometry.room - 2 * EDGE_INSET) / geometry.width;
}

/**
 * The scale the screen starts at: the pose's, or less on a narrow window,
 * where the whole tilted screen fits across it — its near (bottom) edge
 * included, which the perspective draws wider than the rest.
 */
function startScale(geometry: Geometry, pose: Pose) {
  if (!geometry.ready) return pose.scale;
  const near = (1 - pose.originY) * geometry.height * Math.sin((pose.tilt * Math.PI) / 180);
  return Math.min(pose.scale, (fitScale(geometry) * (pose.perspective - near)) / pose.perspective);
}

const unit = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
/** A camera move: eased at both ends, close to even in the middle. */
const pan = cubicBezier(0.35, 0, 0.65, 1);

/** Where the camera is across the capture (0 left end, 1 right end) at `p`. */
function panAt(p: number, timeline: Timeline): number {
  const [first, second] = timeline.wipes;
  const [home, chats, friends] = timeline.pans;
  if (p < first[0]) return home * pan(unit(p, timeline.rise, first[0]));
  if (p <= first[1]) return home;
  if (p < second[0]) return lerp(home, chats, pan(unit(p, first[1], second[0])));
  if (p <= second[1]) return chats;
  return lerp(chats, friends, pan(unit(p, second[1], timeline.settle)));
}

/**
 * How far (px) the screen is shifted from centre to put the camera at `at`
 * across it, at `scale`. Zero whenever the screen fits across the window, so
 * a landscape window never pans; on a portrait one the shift grows as the
 * screen does, which keeps the near edge `EDGE_INSET` in while it zooms.
 */
function shiftAt(geometry: Geometry, scale: number, at: number) {
  if (!geometry.ready) return 0;
  const reach = Math.max(0, (scale * geometry.width - geometry.room) / 2 + EDGE_INSET);
  return reach * (1 - 2 * at);
}

type ScreenPose = { x: number; y: number; scale: number; rotateX: number };

function poseAt(p: number, enter: number, geometry: Geometry, pose: Pose, timeline: Timeline): ScreenPose {
  /* Rises, faces the visitor and grows, a little out of step so it reads as
     one gesture rather than three tweens. */
  const lift = easeOut(unit(p, 0, timeline.rise - 0.06));
  const face = 1 - easeInOut(unit(p, 0, timeline.rise - 0.03));
  const grow = easeInOut(unit(p, 0.02, timeline.rise));
  const settle = easeInOut(unit(p, timeline.settle, 1));
  const end = Math.min(pose.settleScale, geometry.ready ? fitScale(geometry) : 1);
  const scale = lerp(lerp(startScale(geometry, pose), 1, grow), end, settle);
  // As it settles back it also drifts to the middle of its box, which it
  // would otherwise shrink below (it pivots low, at `originY`).
  const centre = settle * (0.5 - pose.originY) * geometry.height * (1 - end);
  return {
    x: shiftAt(geometry, scale, panAt(p, timeline)),
    y: (1 - lift) * geometry.start + (1 - enter) * pose.preLift * geometry.height + centre,
    scale,
    rotateX: pose.tilt * face + pose.settleTilt * settle,
  };
}

/** The screen's projected top edge (px, in the stage) in `screen`. */
function projectedTop(screen: ScreenPose, geometry: Geometry, pose: Pose) {
  const theta = (screen.rotateX * Math.PI) / 180;
  const origin = pose.originY * geometry.height;
  const unprojected = origin + screen.y - screen.scale * origin * Math.cos(theta);
  return geometry.top + (unprojected * pose.perspective) / (pose.perspective + origin * Math.sin(theta));
}

/** The heading's scrubbed step back. */
function headingStepAt(p: number) {
  const step = unit(p, 0, HEADING_STEP);
  return { y: -24 * step, scale: 1 - 0.05 * step };
}

/**
 * How far (px) the screen's projected top edge is from the point where the
 * heading leaves: positive while it is still clear of the heading.
 */
function headingClearance(p: number, geometry: Geometry, pose: Pose, timeline: Timeline) {
  const step = headingStepAt(p);
  const bottom = geometry.headingBottom + step.y - ((1 - step.scale) * geometry.headingHeight) / 2;
  return projectedTop(poseAt(p, 1, geometry, pose, timeline), geometry, pose) - (bottom + EXIT_GAP);
}

/**
 * The part of the capture (0..1 across) the camera sees while a wipe runs,
 * parked at `at`. A wipe's edge runs across that part only, so on a phone it
 * crosses what is on screen instead of mostly happening out of sight.
 */
function wipeWindow(geometry: Geometry, at: number): readonly [number, number] {
  if (!geometry.ready) return [0, 1];
  const left = (geometry.room - geometry.width) / 2 + shiftAt(geometry, 1, at);
  const inner = geometry.width - 2 * geometry.bezel;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  return [clamp((-left - geometry.bezel) / inner), clamp((geometry.room - left - geometry.bezel) / inner)];
}

const PORTRAIT_QUERY = "(orientation: portrait)";

function subscribePortrait(onChange: () => void) {
  const query = window.matchMedia(PORTRAIT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePortrait(): boolean {
  return useSyncExternalStore(
    subscribePortrait,
    () => window.matchMedia(PORTRAIT_QUERY).matches,
    () => false,
  );
}

/**
 * The screen's width at full size: on a portrait window 1.6 times the height
 * the stage leaves it (header, bezel, bar and caption strip set aside); on a
 * landscape one the smaller of that and 92 % of the width.
 */
const IMAGE_SIZES = "(orientation: portrait) calc(160vh - 340px), min(92vw, calc(160vh - 320px))";

export function WelcomeFeaturesCinema({ features }: { features: readonly Feature[] }) {
  const portrait = usePortrait();
  const pose = portrait ? POSES.portrait : POSES.landscape;
  const timeline = portrait ? PORTRAIT : LANDSCAPE;
  const track = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const p = useSceneProgress(track);
  const enter = useSceneProgress(track, ["start end", "start start"]);

  /* The measurements live in a ref; `measured` ticks whenever they change,
     so every transform that reads them recomputes even while the scroll
     stands still. */
  const geometry = useRef<Geometry>(UNMEASURED);
  const measured = useMotionValue(0);

  const screen = useTransform([p, enter, measured], ([progress, entered]: number[]) =>
    poseAt(progress, entered, geometry.current, pose, timeline),
  );
  const x = useTransform(screen, (value) => value.x);
  const y = useTransform(screen, (value) => value.y);
  const scale = useTransform(screen, (value) => value.scale);
  const rotateX = useTransform(screen, (value) => value.rotateX);

  const grow = useTransform(p, [0.02, timeline.rise], [0, 1], { ease: easeInOut });
  const settle = useTransform(p, [timeline.settle, 1], [0, 1], { ease: easeInOut });
  const face = useTransform(p, [0, timeline.rise - 0.03], [1, 0], { ease: easeInOut });
  const glow = useTransform([grow, settle], ([g, s]: number[]) => 0.3 + 0.7 * g - 0.35 * s);
  const glare = useTransform(face, (f) => f * 0.9);
  // The screen wakes as it turns to face the visitor.
  const dimmer = useTransform(face, (f) => f * 0.4);

  /* The heading steps back as the screen comes up (scrubbed, transform
     only), then leaves the moment the screen's top edge reaches it — a short
     triggered fade, so it is never left half-faded — and comes back the same
     way when the visitor scrolls up again. */
  const headingY = useTransform(p, (value) => headingStepAt(value).y);
  const headingScale = useTransform(p, (value) => headingStepAt(value).scale);
  /* The first caption arrives in the same moment, so the stage is never
     without words. */
  const [headingAway, setHeadingAway] = useState(false);
  const [view, setView] = useState(0);

  useMotionValueEvent(p, "change", (value) => {
    const measuredNow = geometry.current;
    const clearance = measuredNow.ready
      ? headingClearance(value, measuredNow, pose, timeline)
      : Number.POSITIVE_INFINITY;
    if (clearance < -HOLD_PX || value > timeline.headingLatest + HOLD) setHeadingAway(true);
    else if (clearance > HOLD_PX && value < timeline.headingLatest - HOLD) setHeadingAway(false);
    // Hold the current view while the progress sits right on a boundary, so
    // a spring settling there cannot flick the caption back and forth.
    const before = viewAt(value - HOLD, timeline);
    const after = viewAt(value + HOLD, timeline);
    if (before === after) setView(before);
  });

  /* Measured after every transform above that reads the measurements is
     declared: a motion value derived from several others subscribes to them
     in a layout effect of its own, so a measurement taken in an earlier
     effect would not reach it until the scroll moved. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const heading = headingRef.current;
    const slot = slotRef.current;
    const frame = frameRef.current;
    const viewport = viewportRef.current;
    if (!stage || !heading || !slot || !frame || !viewport) return;
    const measure = () => {
      const width = frame.offsetWidth;
      const height = frame.offsetHeight;
      const room = slot.clientWidth;
      if (width === 0 || height === 0 || room === 0) return;
      // Layout boxes, not the (moving) transformed ones. The frame itself is
      // never transformed, and the stage is the heading's offset parent.
      const top = frame.getBoundingClientRect().top - stage.getBoundingClientRect().top;
      const headingBottom = heading.offsetTop + heading.offsetHeight;
      const next: Geometry = {
        ready: true,
        width,
        height,
        room,
        bezel: (width - viewport.offsetWidth) / 2,
        top,
        headingBottom,
        headingHeight: heading.offsetHeight,
        start: 0,
      };
      next.start = startOffset(pose, startScale(next, pose), headingBottom, top, height);
      geometry.current = next;
      measured.set(measured.get() + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(heading);
    observer.observe(slot);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [pose, measured]);

  return (
    <section
      id="features"
      aria-labelledby="welcome-features-heading"
      className="relative border-t border-[var(--border)] bg-[var(--surface-sunken)]"
    >
      <div ref={track} className={styles.track}>
        <div ref={stageRef} className={styles.stage}>
          <motion.div
            ref={headingRef}
            className={styles.heading}
            style={{ y: headingY, scale: headingScale }}
            initial={false}
            animate={
              headingAway
                ? { opacity: 0, filter: "blur(6px)" }
                : { opacity: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.45, ease: EASE_OUT }}
          >
            <p className="eyebrow">What you get</p>
            <h2
              id="welcome-features-heading"
              className="mx-auto mt-3 max-w-[13em] text-balance break-words font-[family-name:var(--font-display)] text-[clamp(1.875rem,1.2rem+3.4vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[var(--foreground)] lg:mt-4"
            >
              One place for the{" "}
              <span className="text-[var(--accent)]">people you talk to.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[34rem] text-balance text-[0.9375rem] leading-[1.5] text-[var(--text-secondary)] sm:text-base lg:mt-5 lg:text-lg">
              {SCREEN_NOTE}
            </p>
          </motion.div>

          <div className={styles.region}>
            {/* No name of its own: the sentence above already says what the
                picture is, and each capture's alt text what it shows. */}
            <figure className={styles.figure}>
              <div ref={slotRef} className={styles.slot}>
                <div
                  ref={frameRef}
                  className={styles.frame}
                  style={{ perspective: `${pose.perspective}px` }}
                >
                  <motion.div aria-hidden="true" className={styles.glow} style={{ opacity: glow }} />
                  <motion.div
                    className={styles.screen}
                    style={{ x, y, scale, rotateX, originY: pose.originY }}
                  >
                    <div aria-hidden="true" className={styles.shadow} />
                    <div className={styles.bezel}>
                      <div className={styles.window}>
                        <BrowserBar />
                        <div ref={viewportRef} className={styles.viewport}>
                          <div className={styles.layer}>
                            <Image
                              src={SCREEN_VIEWS[0].src}
                              alt={SCREEN_VIEWS[0].alt}
                              fill
                              sizes={IMAGE_SIZES}
                            />
                          </div>
                          <Wipe
                            progress={p}
                            range={timeline.wipes[0]}
                            at={timeline.pans[0]}
                            view={SCREEN_VIEWS[1]}
                            geometry={geometry}
                            measured={measured}
                          />
                          <Wipe
                            progress={p}
                            range={timeline.wipes[1]}
                            at={timeline.pans[1]}
                            view={SCREEN_VIEWS[2]}
                            geometry={geometry}
                            measured={measured}
                          />
                          <motion.div
                            aria-hidden="true"
                            className={`${styles.layer} bg-[#05030a]`}
                            style={{ opacity: dimmer }}
                          />
                        </div>
                      </div>
                      <motion.div aria-hidden="true" className={styles.glare} style={{ opacity: glare }} />
                    </div>
                  </motion.div>
                </div>
              </div>
              <Captions view={headingAway ? view : -1} progress={p} timeline={timeline} />
            </figure>
          </div>
        </div>
      </div>

      <div className="px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-[1240px]">
          <ul className="grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
            {features.map((feature, index) => (
              <Reveal as="li" key={feature.title} delay={index * 0.08} className="feature-row">
                <FeatureRowBody feature={feature} />
              </Reveal>
            ))}
          </ul>

          <RiseIn delay={features.length * 0.08} className="mt-10 w-fit">
            <Link href="/features" className="premium-button-secondary focus-ring">
              See every feature
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </RiseIn>
        </div>
      </div>
    </section>
  );
}

/**
 * The next capture wiping in from the left over the one before, with a
 * bright edge running across and a slight settle of the incoming picture.
 * The edge crosses the part of the capture the camera sees while it is
 * parked at `at` (all of it on a landscape window); what lies outside that
 * part is uncovered the moment the wipe starts or ends, out of sight.
 */
function Wipe({
  progress,
  range,
  at,
  view,
  geometry,
  measured,
}: {
  progress: MotionValue<number>;
  range: readonly [number, number];
  at: number;
  view: ScreenView;
  geometry: RefObject<Geometry>;
  measured: MotionValue<number>;
}) {
  const wiped = useTransform(progress, [range[0], range[1]], [0, 1], { ease: easeInOut });
  const edge = useTransform([wiped, measured], ([w]: number[]) => {
    const [from, to] = wipeWindow(geometry.current, at);
    return from + (to - from) * w;
  });
  const clipPath = useTransform([wiped, edge], ([w, e]: number[]) => {
    if (w <= 0) return "inset(0% 100% 0% 0%)";
    if (w >= 1) return "inset(0% 0% 0% 0%)";
    return `inset(0% ${(1 - e) * 100}% 0% 0%)`;
  });
  const scale = useTransform(wiped, [0, 1], [1.05, 1]);
  const edgeX = useTransform(edge, (e) => `${e * 100}%`);
  const edgeOpacity = useTransform(wiped, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const dim = useTransform(wiped, [0, 0.5, 1], [0, 0.4, 0]);

  return (
    <>
      <motion.div aria-hidden="true" className={`${styles.layer} bg-black`} style={{ opacity: dim }} />
      <motion.div className={styles.layer} style={{ clipPath }}>
        <motion.div className={styles.layer} style={{ scale }}>
          <Image src={view.src} alt={view.alt} fill sizes={IMAGE_SIZES} />
        </motion.div>
      </motion.div>
      <motion.div
        aria-hidden="true"
        className={styles.edge}
        style={{ x: edgeX, opacity: edgeOpacity }}
      />
    </>
  );
}

/** A caption comes in from below after the last one has gone up and out. */
const CAPTION: Variants = {
  shown: { opacity: 1, y: [10, 0], transition: { duration: 0.32, delay: 0.14, ease: EASE_OUT } },
  hidden: { opacity: 0, y: -8, transition: { duration: 0.16, ease: EASE_OUT } },
};

/**
 * The caption under the screen: which view it is, the progress segments
 * beside it, and one line about it. It repeats what the images' alt text
 * already says, so it is hidden from assistive technology. All three
 * captions are laid out in the same cell, so the strip keeps the height of
 * the tallest. The strip stands on an opaque floor the width of the stage,
 * which the tilted screen's near edge sinks behind while it rises (and the
 * glow and shadow end on), so the words are always on the plain page colour;
 * each change is a short triggered crossfade, so they are either fully there
 * or not there.
 */
function Captions({
  view,
  progress,
  timeline,
}: {
  view: number;
  progress: MotionValue<number>;
  timeline: Timeline;
}) {
  const [first, second] = switches(timeline);
  const segments = [
    [timeline.captionIn, first],
    [first, second],
    [second, timeline.settle],
  ] as const;
  return (
    <div aria-hidden="true" className={styles.strip}>
      <span className={styles.labels}>
        {SCREEN_VIEWS.map((item, index) => (
          <motion.span
            key={item.id}
            className="flex items-baseline gap-3"
            variants={CAPTION}
            initial={false}
            animate={index === view ? "shown" : "hidden"}
          >
            <span className="text-[0.75rem] font-bold tabular-nums tracking-[0.12em] text-[var(--accent)]">
              0{index + 1}
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.02em] text-[var(--foreground)] lg:text-xl">
              {item.label}
            </span>
          </motion.span>
        ))}
      </span>
      <motion.span
        className={styles.segments}
        initial={false}
        animate={{ opacity: view >= 0 ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        {segments.map((range, index) => (
          <Segment key={SCREEN_VIEWS[index].id} progress={progress} range={range} />
        ))}
      </motion.span>
      <span className={styles.lines}>
        {SCREEN_VIEWS.map((item, index) => (
          <motion.span
            key={item.id}
            className="text-[0.9375rem] leading-[1.45] text-[var(--text-secondary)]"
            variants={CAPTION}
            initial={false}
            animate={index === view ? "shown" : "hidden"}
          >
            {item.line}
          </motion.span>
        ))}
      </span>
    </div>
  );
}

function Segment({
  progress,
  range,
}: {
  progress: MotionValue<number>;
  range: readonly [number, number];
}) {
  const fill = useTransform(progress, [range[0], range[1]], [0, 1]);
  return (
    <span className={styles.segment}>
      <motion.span
        className="absolute inset-0 origin-left rounded-full bg-[linear-gradient(90deg,#7b2ff7,#c026ff)]"
        style={{ scaleX: fill }}
      />
    </span>
  );
}

/**
 * The link's entrance after the rows: it rises into place the first time it
 * scrolls into view. Unlike `Reveal`, it is shown at once the moment it (or
 * anything in it) takes keyboard focus, so focus never lands on something
 * that is not yet visible.
 */
function RiseIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(1);
  const y = useMotionValue(0);
  const running = useRef<AnimationPlaybackControls[]>([]);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || node.getBoundingClientRect().top < window.innerHeight) return;

    opacity.set(0);
    y.set(28);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        running.current = [
          animate(opacity, 1, { duration: 0.7, delay, ease: EASE_OUT }),
          animate(y, 0, { duration: 0.95, delay, ease: EASE_OUT }),
        ];
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    const stopped = running;
    return () => {
      observer.disconnect();
      stopped.current.forEach((animation) => animation.stop());
      opacity.set(1);
      y.set(0);
    };
  }, [delay, opacity, y]);

  function showNow() {
    running.current.forEach((animation) => animation.stop());
    opacity.set(1);
    y.set(0);
  }

  return (
    <motion.div ref={ref} className={className} style={{ opacity, y }} onFocusCapture={showNow}>
      {children}
    </motion.div>
  );
}
