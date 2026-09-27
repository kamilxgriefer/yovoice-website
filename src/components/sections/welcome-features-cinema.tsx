"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  cubicBezier,
  easeInOut,
  easeOut,
  frame as frameLoop,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";

import {
  DUR,
  EASE_IN,
  EASE_OUT,
  EXIT,
  STAGGER,
  SWAP,
  useSceneProgress,
} from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import { SceneOpener } from "@/components/animations/scene-opener";
import { mix } from "@/components/animations/tint";
import styles from "@/components/sections/welcome-features-cinema.module.css";
import {
  BrowserBar,
  FEATURES_OPENER,
  FeatureRowBody,
  SCREEN_NOTE,
  SCREEN_NOTE_ID,
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
 * The room takes the screen's colour. Behind the screen the stage fills with
 * a deep light in the dock colour of the view on it — Home violet, Chats
 * cyan, Friends magenta — which comes up as the screen wakes, changes as each
 * wipe crosses the screen, and dims as it settles back. It is the story's
 * flood colours with a smaller core (`roomPaint`); where it shows, at the
 * stage's sides, it is about as strong as the story's flood, but the screen
 * covers most of it, so the room as a whole reads at well under the story's
 * strength and the story stays the peak. The light rises with the screen and
 * never reaches the heading: its top edge stays under the heading for as
 * long as the heading is on the stage.
 *
 * It opens the way every homepage section does (`SceneOpener`), on the
 * page's frame: the ruled eyebrow in the scene's cyan, the title rising word
 * by word, and the sample-content note as its lead.
 *
 * The visitor's scroll is the only clock. Everything scrubbed here is a
 * transform, a clip-path on a capture or the opacity of a decorative layer
 * (the room light, glare, the screen's dimmer). Words are never left
 * half-faded: the heading leaves with the opener's exit cue the moment the
 * rising screen reaches it, the first caption arrives in the same moment (so
 * the stage always carries one line of words), and the captions change by
 * the site's caption swap.
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
/** One change of the progress larger than this is the stage landing
 * somewhere new; the spring following a scroll moves it far less per frame. */
const RELOCATION = 0.15;
/** A triggered change made when the stage lands somewhere new: no fade. */
const LAND = { duration: 0 } as const;
const SEGMENTS_FADE = { duration: DUR.swap, ease: EASE_OUT };

/**
 * The heading leaving the stage and coming back: the section opener's exit
 * cue (`EXIT`, eased in, a cut rather than a drift) and its return. Opacity
 * only, never `visibility`: this is the section's real `<h2>`, so it stays in
 * the accessibility tree and in find in page while it is off the stage.
 */
const HEADING_AWAY = { opacity: 0, y: EXIT.y, filter: `blur(${EXIT.blur}px)` };
const HEADING_BACK = { opacity: 1, y: 0, filter: "blur(0px)" };
const HEADING_EXIT = { duration: EXIT.duration, ease: EASE_IN };
const HEADING_RETURN = { duration: 0.42, ease: EASE_OUT };

/** What the words on the stage show: whether the heading has left, which
 * view the caption names, and whether the last change was a landing. */
type Words = { away: boolean; view: number; land: boolean };

/**
 * The words for progress `p`, read straight from it: used when the stage
 * mounts and when it lands somewhere new, where there is no "before" to
 * hold on to.
 */
function wordsAt(p: number, geometry: Geometry, pose: Pose, timeline: Timeline) {
  const clearance = geometry.ready ? headingClearance(p, geometry, pose, timeline) : Number.POSITIVE_INFINITY;
  return { away: clearance < 0 || p > timeline.headingLatest, view: viewAt(p, timeline) };
}

/** How far the stage is through its track right now (0..1, the progress
 * without the spring), read from the layout. */
function trackProgress(track: HTMLElement): number | null {
  const box = track.getBoundingClientRect();
  const travel = box.height - document.documentElement.clientHeight;
  if (travel <= 0) return null;
  return Math.min(1, Math.max(0, -box.top / travel));
}

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
  /** The stage's height. */
  stageHeight: number;
  bezel: number;
  /** The screen's layout top, in the stage. */
  top: number;
  /** The heading's layout bottom, in the stage. */
  headingBottom: number;
  /** How far below its final place the screen starts. */
  start: number;
};

const UNMEASURED: Geometry = {
  ready: false, width: 1, height: 1, room: 1, stageHeight: 1, bezel: 0, top: 0,
  headingBottom: 0, start: 0,
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

/**
 * The heading's scrubbed step back: it drifts up a line's rise as the screen
 * comes up under it. No scale, so its left edge stays on the frame and the
 * text stays crisp.
 */
function headingStepAt(p: number) {
  return -RISE_STEP * unit(p, 0, HEADING_STEP);
}
const RISE_STEP = 24;

/**
 * How far (px) the screen's projected top edge is from the point where the
 * heading leaves: positive while it is still clear of the heading.
 */
function headingClearance(p: number, geometry: Geometry, pose: Pose, timeline: Timeline) {
  const bottom = geometry.headingBottom + headingStepAt(p);
  return projectedTop(poseAt(p, 1, geometry, pose, timeline), geometry, pose) - (bottom + EXIT_GAP);
}

/**
 * Where the room light's ceiling sits (its `y`, px): the page-coloured shade
 * over the top of the light, whose soft lower edge starts just above the
 * screen's projected top edge, so the light comes up with the screen. While
 * the heading may still be on the stage the light starts `EXIT_GAP` above
 * the screen — the heading leaves before the screen's top comes closer to it
 * than that, so the light never reaches it. Once the screen has passed the
 * point where the heading leaves (or the heading has had to leave at
 * `headingLatest`), the light climbs its soft edge's length above the screen,
 * so the room is lit all round. The shade is the stage's height and its last
 * `ROOM_FADE` is the soft edge (`.ceiling`).
 */
function ceilingAt(p: number, enter: number, geometry: Geometry, pose: Pose, timeline: Timeline) {
  if (!geometry.ready) return 0;
  const height = geometry.stageHeight;
  const top = projectedTop(poseAt(p, enter, geometry, pose, timeline), geometry, pose);
  // Past the hold band too, so the light never climbs while the heading stays.
  const past = (-headingClearance(p, geometry, pose, timeline) - HOLD_PX) / (CLIMB * height);
  const climb = ROOM_FADE * height * Math.max(Math.min(1, Math.max(0, past)), unit(p, timeline.headingLatest, timeline.rise));
  const start = Math.max(0, top - EXIT_GAP - climb);
  return start - (1 - ROOM_FADE) * height;
}
/** How far past the heading's exit point (a share of the stage's height) the
 * screen rises while the light climbs above it. */
const CLIMB = 0.18;
/** The ceiling's soft edge, as a share of the stage's height (`.ceiling`). */
const ROOM_FADE = 0.22;

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

  const face = useTransform(p, [0, timeline.rise - 0.03], [1, 0], { ease: easeInOut });
  const glare = useTransform(face, (f) => f * 0.9);
  // The screen wakes as it turns to face the visitor.
  const dimmer = useTransform(face, (f) => f * 0.4);
  // The room light's top edge follows the screen up (see `ceilingAt`).
  const ceiling = useTransform([p, enter, measured], ([progress, entered]: number[]) =>
    ceilingAt(progress, entered, geometry.current, pose, timeline),
  );

  /* The heading steps back as the screen comes up (scrubbed, transform
     only), then leaves the moment the screen's top edge reaches it — the
     opener's exit cue, which always completes, so it is never left
     half-faded — and comes back the same way when the visitor scrolls up
     again. */
  const headingY = useTransform(p, headingStepAt);
  /* The first caption arrives in the same moment, so the stage is never
     without words.

     While the visitor scrolls, both follow the spring and hold while the
     progress sits right on a threshold, so a spring settling there cannot
     flick them back and forth. When the progress arrives in one move (a
     link, a restored position, the spring landing after the stage mounted
     mid-page) they are read straight from where it now is, even inside a
     hold band, and a move bigger than `RELOCATION` lands them without their
     fade. When the stage mounts they are read from the track's position
     (the layout effect below), since the spring has not measured yet. */
  const [words, setWords] = useState<Words>({ away: false, view: 0, land: true });
  const lastP = useRef(p.get());
  /** Sets what changed; `null` holds the current value. */
  const show = (away: boolean | null, view: number | null, instant: boolean) =>
    setWords((current) => {
      const next = { away: away ?? current.away, view: view ?? current.view };
      return next.away === current.away && next.view === current.view ? current : { ...next, land: instant };
    });

  useMotionValueEvent(p, "change", (value) => {
    const moved = Math.abs(value - lastP.current);
    lastP.current = value;
    const measuredNow = geometry.current;
    if (moved > 2 * HOLD) {
      const at = wordsAt(value, measuredNow, pose, timeline);
      // A landing is committed in the frame the picture lands in: right
      // after the scroll's notifications (never inside them, where a render
      // would re-subscribe the transforms being notified), so the words'
      // instant change is drawn with this frame's picture, not the next.
      if (moved > RELOCATION) frameLoop.preUpdate(() => flushSync(() => show(at.away, at.view, true)), false, true);
      else show(at.away, at.view, false);
      return;
    }
    const clearance = measuredNow.ready
      ? headingClearance(value, measuredNow, pose, timeline)
      : Number.POSITIVE_INFINITY;
    let away: boolean | null = null;
    if (clearance < -HOLD_PX || value > timeline.headingLatest + HOLD) away = true;
    else if (clearance > HOLD_PX && value < timeline.headingLatest - HOLD) away = false;
    // Hold the current view while the progress sits right on a boundary.
    const before = viewAt(value - HOLD, timeline);
    show(away, before === viewAt(value + HOLD, timeline) ? before : null, false);
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
        stageHeight: stage.clientHeight,
        bezel: (width - viewport.offsetWidth) / 2,
        top,
        headingBottom,
        start: 0,
      };
      next.start = startOffset(pose, startScale(next, pose), headingBottom, top, height);
      geometry.current = next;
      measured.set(measured.get() + 1);
    };
    measure();
    // The words for where the stage is as it mounts (or as the window
    // turns), before the first frame is drawn: the spring has not measured
    // yet, so it would say the stage is at its start.
    const at = track.current ? trackProgress(track.current) : null;
    if (at !== null) {
      const now = wordsAt(at, geometry.current, pose, timeline);
      setWords((current) =>
        current.away === now.away && current.view === now.view ? current : { ...now, land: true },
      );
    }
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(heading);
    observer.observe(slot);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [pose, timeline, measured]);

  return (
    <section id="features" aria-labelledby="welcome-features-heading" className="relative bg-[var(--background)]">
      <div ref={track} className={styles.track}>
        <div ref={stageRef} className={styles.stage}>
          <RoomLight progress={p} ceiling={ceiling} timeline={timeline} />

          <motion.div ref={headingRef} className={styles.heading} style={{ y: headingY }}>
            <motion.div
              initial={false}
              animate={words.away ? HEADING_AWAY : HEADING_BACK}
              transition={words.land ? LAND : words.away ? HEADING_EXIT : HEADING_RETURN}
            >
              <SceneOpener
                size="scene"
                eyebrow={FEATURES_OPENER.eyebrow}
                ink={FEATURES_OPENER.ink}
                title={FEATURES_OPENER.title}
                accent={FEATURES_OPENER.accent}
                accentClassName="sm:block"
                lead={<span id={SCREEN_NOTE_ID}>{SCREEN_NOTE}</span>}
                leadClassName="text-pretty"
                headingId="welcome-features-heading"
                titleClassName="text-balance"
              />
            </motion.div>
          </motion.div>

          <div className={styles.region}>
            {/* The note in the heading describes the picture; each capture's
                alt text says what it shows. */}
            <figure aria-describedby={SCREEN_NOTE_ID} className={styles.figure}>
              <div ref={slotRef} className={styles.slot}>
                <div
                  ref={frameRef}
                  className={styles.frame}
                  style={{ perspective: `${pose.perspective}px` }}
                >
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
                            className={`${styles.layer} ${styles.dimmer}`}
                            style={{ opacity: dimmer }}
                          />
                        </div>
                      </div>
                      <motion.div aria-hidden="true" className={styles.glare} style={{ opacity: glare }} />
                    </div>
                  </motion.div>
                </div>
              </div>
              <Captions
                view={words.away ? words.view : -1}
                land={words.land}
                progress={p}
                timeline={timeline}
              />
            </figure>
          </div>
        </div>
      </div>

      <div className="frame pb-[var(--section-bottom)] pt-[var(--opener-gap)]">
        <ul className="grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
          {features.map((feature, index) => (
            <Reveal
              as="li"
              key={feature.title}
              delay={Math.min(index, 4) * STAGGER.item}
              className="feature-row"
            >
              <FeatureRowBody feature={feature} />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={Math.min(features.length, 4) * STAGGER.item} className="mt-10 w-fit">
          <Link href="/features" className="premium-button-secondary focus-ring">
            See every feature
            <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * One view's light on the room: the story's flood recipe (`floodPaint` in
 * app-story-cinema.tsx) with a smaller core — lifted 36 % toward the core
 * where the story lifts 44 %, the same 16 % a little past halfway, the full
 * flood colour at 80 % of the way out, and down to the page colour at the
 * stage's corners — under a foot of the page colour that fades it out above
 * the caption strip, so the strip's floor never shows an edge in the light.
 * Where it is seen, beside the screen, it is about as strong as the story's
 * flood; it reads well under the story's strength only because the screen
 * covers its brightest part. Both are painted in the room's own place.
 */
function roomPaint({ flood, core, lift }: ScreenView["room"]): string {
  const foot = `linear-gradient(to top, #080711 var(--strip), rgb(8 7 17 / 0.9) calc(var(--strip) + 5.5%), rgb(8 7 17 / 0.5) calc(var(--strip) + 11%), rgb(8 7 17 / 0.1) calc(var(--strip) + 16.5%), rgb(8 7 17 / 0) calc(var(--strip) + 22%))`;
  return `${foot}, radial-gradient(95% 75% at 50% 64%, ${mix(flood, core, 0.36 * lift)} 0%, ${mix(flood, core, 0.16 * lift)} 55%, ${flood} 80%, #080711 100%)`;
}

/**
 * The room light: one layer per view. Each next view's light crosses the
 * room from left to right while its wipe crosses the screen, so the colour
 * of the room follows the wipe's edge: the wall on the left turns first, the
 * one on the right last. The whole light comes up as the screen wakes and
 * dims as it settles back; a page-coloured ceiling follows the screen up
 * (`ceiling`). Decorative: opacity and transform only.
 *
 * Cheap to draw: outside a wipe only the current view's layer and the
 * ceiling are drawn (the others are at opacity 0), and a crossing layer
 * exists only while its wipe runs. The light's strength is set on each layer
 * rather than on the room, so no group has to be drawn off screen first; the
 * wipes run while the light is full, where the two are the same.
 */
function RoomLight({
  progress,
  ceiling,
  timeline,
}: {
  progress: MotionValue<number>;
  ceiling: MotionValue<number>;
  timeline: Timeline;
}) {
  const [first, second] = timeline.wipes;
  // A faint light from the sleeping screen, full once it faces the visitor,
  // gone by the time the stage lets go.
  const light = useTransform(progress, (value) => {
    const wake = easeOut(unit(value, 0, timeline.rise - 0.06));
    const dim = easeInOut(unit(value, timeline.settle, 1));
    return (ROOM_ASLEEP + (1 - ROOM_ASLEEP) * wake) * (1 - dim);
  });
  // Each view's light is the room's once its wipe has finished crossing.
  const ends = [Number.NEGATIVE_INFINITY, first[1], second[1], Number.POSITIVE_INFINITY];
  const settled = SCREEN_VIEWS.map((_, index) => [ends[index], ends[index + 1]] as const);
  return (
    <div aria-hidden="true" className={styles.room}>
      {SCREEN_VIEWS.map((view, index) => (
        <RoomLayer key={view.id} progress={progress} light={light} range={settled[index]} view={view} />
      ))}
      <RoomSweep progress={progress} light={light} range={first} view={SCREEN_VIEWS[1]} />
      <RoomSweep progress={progress} light={light} range={second} view={SCREEN_VIEWS[2]} />
      <motion.div className={styles.ceiling} style={{ y: ceiling }} />
    </div>
  );
}

/** A view's light while it is the room's: from `range[0]` up to `range[1]`. */
function RoomLayer({
  progress,
  light,
  range,
  view,
}: {
  progress: MotionValue<number>;
  light: MotionValue<number>;
  range: readonly [number, number];
  view: ScreenView;
}) {
  const opacity = useTransform([progress, light], ([p, l]: number[]) =>
    p >= range[0] && p < range[1] ? l : 0,
  );
  return <motion.div className={styles.roomLayer} style={{ opacity, background: roomPaint(view.room) }} />;
}

/**
 * The next view's light crossing the room while its wipe runs: a window 130 %
 * of the room's width with a soft right edge (the last 30 % of the room's
 * width) slides from left of the room to right of it, and the light inside
 * it slides the other way by as much, so the light itself stays where it is
 * in the room and only the edge moves. Both are transforms, so nothing is
 * repainted.
 */
function RoomSweep({
  progress,
  light,
  range,
  view,
}: {
  progress: MotionValue<number>;
  light: MotionValue<number>;
  range: readonly [number, number];
  view: ScreenView;
}) {
  const wiped = useTransform(progress, [range[0], range[1]], [0, 1], { ease: easeInOut });
  // In % of each element's own width: the window is 1.3 rooms wide, the light 1.
  const windowX = useTransform(wiped, (w) => `${lerp(-100, 30, w) / 1.3}%`);
  const lightX = useTransform(wiped, (w) => `${lerp(100, -30, w)}%`);
  const opacity = useTransform([progress, light], ([p, l]: number[]) =>
    p > range[0] && p < range[1] ? l : 0,
  );
  return (
    <motion.div className={styles.sweep} style={{ x: windowX, opacity }}>
      <motion.div
        className={styles.sweepLight}
        style={{ x: lightX, background: roomPaint(view.room) }}
      />
    </motion.div>
  );
}

/** How much of the room light the screen gives off while it still lies back, dimmed. */
const ROOM_ASLEEP = 0.3;

/**
 * The next capture wiping in from the left over the one before, with an edge
 * lit in the incoming view's colour running across (as the story's wipes do)
 * and a slight settle of the incoming picture.
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
      <motion.div aria-hidden="true" className={`${styles.layer} ${styles.wipeDim}`} style={{ opacity: dim }} />
      <motion.div className={styles.layer} style={{ clipPath }}>
        <motion.div className={styles.layer} style={{ scale }}>
          <Image src={view.src} alt={view.alt} fill sizes={IMAGE_SIZES} />
        </motion.div>
      </motion.div>
      <motion.div
        aria-hidden="true"
        className={styles.edge}
        style={{
          x: edgeX,
          opacity: edgeOpacity,
          color: view.ink,
          "--edge-core": view.room.core,
        } as unknown as CSSProperties}
      />
    </>
  );
}

/** A caption comes in from below after the last one has gone up and out
 * (the site's caption swap). */
const CAPTION: Variants = {
  shown: {
    opacity: 1,
    y: [SWAP.in.y, 0],
    transition: { duration: SWAP.in.duration, delay: SWAP.in.delay, ease: EASE_OUT },
  },
  hidden: { opacity: 0, y: SWAP.out.y, transition: { duration: SWAP.out.duration, ease: EASE_IN } },
};
/** … or is simply there, when the stage lands somewhere new. */
const CAPTION_LANDED: Variants = {
  shown: { opacity: 1, y: 0, transition: LAND },
  hidden: { opacity: 0, y: SWAP.out.y, transition: LAND },
};

/**
 * The caption under the screen: which view it is, the progress segments
 * beside it, and one line about it. It repeats what the images' alt text
 * already says, so it is hidden from assistive technology. All three
 * captions are laid out in the same cell, so the strip keeps the height of
 * the tallest. The strip stands on an opaque floor the width of the stage,
 * which the tilted screen's near edge sinks behind while it rises (and the
 * room light and the shadow end on), so the words are always on the plain
 * page colour; each change is the site's caption swap, triggered, so they
 * are either fully there or not there. The number and the segment take the
 * view's colour, the room light's key in small type.
 */
function Captions({
  view,
  land,
  progress,
  timeline,
}: {
  view: number;
  land: boolean;
  progress: MotionValue<number>;
  timeline: Timeline;
}) {
  const [first, second] = switches(timeline);
  const caption = land ? CAPTION_LANDED : CAPTION;
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
            variants={caption}
            initial={false}
            animate={index === view ? "shown" : "hidden"}
          >
            <span
              className="text-[0.75rem] font-bold tabular-nums tracking-[0.12em]"
              style={{ color: item.ink }}
            >
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
        transition={land ? LAND : SEGMENTS_FADE}
      >
        {segments.map((range, index) => (
          <Segment key={SCREEN_VIEWS[index].id} progress={progress} range={range} view={SCREEN_VIEWS[index]} />
        ))}
      </motion.span>
      <span className={styles.lines}>
        {SCREEN_VIEWS.map((item, index) => (
          <motion.span
            key={item.id}
            className="text-[0.9375rem] leading-[1.45] text-[var(--text-secondary)]"
            variants={caption}
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

/** One view's progress segment, filled in that view's colour. */
function Segment({
  progress,
  range,
  view,
}: {
  progress: MotionValue<number>;
  range: readonly [number, number];
  view: ScreenView;
}) {
  const fill = useTransform(progress, [range[0], range[1]], [0, 1]);
  return (
    <span className={styles.segment}>
      <motion.span
        className="absolute inset-0 origin-left rounded-full"
        style={{ scaleX: fill, background: `linear-gradient(90deg, ${view.room.core}, ${view.ink})` }}
      />
    </span>
  );
}
