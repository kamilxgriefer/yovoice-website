"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  AnimatePresence,
  animate,
  easeInOut,
  easeOut,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
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
 * rises, faces them and grows until it nearly fills the window (on a phone:
 * the full width), then, while it is big, Home wipes over to Chats and Chats
 * to Friends, each with a short caption. At the end it settles back a little
 * and the stage lets go; the five feature rows rise in under it.
 *
 * The visitor's scroll is the only clock. Everything scrubbed here is a
 * transform, a clip-path or the opacity of a decorative layer (glow, glare,
 * the screen's dimmer). Words are never left half-faded: on a wide window the
 * heading leaves by a short triggered fade before the screen reaches it, and
 * the captions change by a short triggered crossfade.
 *
 * Only mounted while the scroll cinema is on; `WelcomeFeatures` renders the
 * static layout otherwise, with the same heading, sentence, rows and link.
 */

/* The timeline over the pinned stage's progress `p`. */
const RISE_END = 0.34;
/** The captions arrive as the screen nears full size. */
const CAPTION_IN = 0.24;
/** Home → Chats and Chats → Friends. */
const WIPES = [
  [0.46, 0.54],
  [0.65, 0.73],
] as const;
const SWITCH = [(WIPES[0][0] + WIPES[0][1]) / 2, (WIPES[1][0] + WIPES[1][1]) / 2] as const;
const SETTLE = 0.86;
/** Wide screens: the heading leaves here, before the screen reaches it. */
const HEADING_OUT = 0.06;
/** How far past a boundary the progress must be before the caption changes. */
const HOLD = 0.006;

function viewAt(p: number): number {
  if (p < CAPTION_IN) return -1;
  if (p < SWITCH[0]) return 0;
  if (p < SWITCH[1]) return 1;
  return 2;
}

/** Where each caption's progress bar starts and ends filling. */
const SEGMENTS = [
  [CAPTION_IN, SWITCH[0]],
  [SWITCH[0], SWITCH[1]],
  [SWITCH[1], SETTLE],
] as const;

/**
 * The two poses of the screen. `tilt` is how far it lies back (rotateX);
 * `radius` is the corner in the screen's own pixels at the start, at full
 * size and after it settles (it is scaled with the screen, so the visible
 * corner eases down as the screen grows). `perspective` is its parent's, in
 * px, and `originY` the height it pivots at. While the section is still
 * coming into view the screen trails a little (`preLift` of its height), so
 * it drifts up to its start under the heading rather than arriving with it.
 *
 * Where it starts is measured, not guessed: on a wide screen its far edge
 * starts `START_GAP` px under the heading, whatever the window's height; on
 * a phone it starts `lift` of its own height below its final place.
 */
const POSES = {
  wide: {
    tilt: 52, preLift: 0.22, scale: 0.55, lift: 0, radius: [40, 14, 22],
    settleScale: 0.9, settleTilt: 7, perspective: 1600, originY: 0.72,
  },
  narrow: {
    tilt: 48, preLift: 0.14, scale: 0.72, lift: 0.24, radius: [26, 6, 14],
    settleScale: 0.94, settleTilt: 5, perspective: 1200, originY: 0.72,
  },
} as const;
type Pose = (typeof POSES)[keyof typeof POSES];

const START_GAP = 56;

/**
 * How far below its final place (px) the screen starts. On a wide screen,
 * the offset that puts the projected top edge of the tilted, scaled screen
 * `START_GAP` px under the heading's box: the transform is
 * `translateY scale rotateX` about `originY`, seen through the slot's
 * perspective from its top centre (a 2D `scale` leaves depth alone).
 */
function startOffset(pose: Pose, wide: boolean, headingBottom: number, slotTop: number, height: number) {
  if (!wide) return pose.lift * height;
  const theta = (pose.tilt * Math.PI) / 180;
  const origin = pose.originY * height;
  const target = headingBottom + START_GAP - slotTop;
  const unprojected = (target * (pose.perspective + origin * Math.sin(theta))) / pose.perspective;
  return unprojected - origin + origin * pose.scale * Math.cos(theta);
}

const WIDE_QUERY = "(min-width: 64rem)";

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

/**
 * The screen's width at full size: on a wide window the smaller of 92 % of
 * its width and what its height allows (16:10 plus the bar, the bezel, the
 * header and the caption strip); on a phone or tablet, the width.
 */
const IMAGE_SIZES =
  "(min-width: 64rem) min(92vw, calc(160vh - 320px)), (min-width: 40rem) 94vw, 100vw";

export function WelcomeFeaturesCinema({ features }: { features: readonly Feature[] }) {
  const wide = useWide();
  const pose = wide ? POSES.wide : POSES.narrow;
  const track = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const p = useSceneProgress(track);
  const enter = useSceneProgress(track, ["start end", "start start"]);

  const startY = useMotionValue(0);
  const screenHeight = useMotionValue(0);
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const heading = headingRef.current;
    const slot = slotRef.current;
    if (!stage || !heading || !slot) return;
    const measure = () => {
      const slotBox = slot.getBoundingClientRect();
      screenHeight.set(slotBox.height);
      startY.set(
        startOffset(
          pose,
          wide,
          // Layout box, not the (moving) transformed one; the stage is its
          // offset parent.
          heading.offsetTop + heading.offsetHeight,
          slotBox.top - stage.getBoundingClientRect().top,
          slotBox.height,
        ),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(heading);
    observer.observe(slot);
    return () => observer.disconnect();
  }, [pose, wide, startY, screenHeight]);

  /* Rises, faces the visitor and grows, a little out of step so it reads as
     one gesture rather than three tweens. */
  const lift = useTransform(p, [0, RISE_END - 0.06], [1, 0], { ease: easeOut });
  const face = useTransform(p, [0, RISE_END - 0.03], [1, 0], { ease: easeInOut });
  const grow = useTransform(p, [0.02, RISE_END], [0, 1], { ease: easeInOut });
  const settle = useTransform(p, [SETTLE, 1], [0, 1], { ease: easeInOut });

  const rotateX = useTransform(
    [face, settle],
    ([f, s]: number[]) => pose.tilt * f + pose.settleTilt * s,
  );
  const scale = useTransform(
    [grow, settle],
    ([g, s]: number[]) => (pose.scale + (1 - pose.scale) * g) * (1 - (1 - pose.settleScale) * s),
  );
  const y = useTransform(
    [lift, startY, enter, screenHeight],
    ([l, start, e, height]: number[]) => l * start + (1 - e) * pose.preLift * height,
  );
  const radius = useTransform(
    [grow, settle],
    ([g, s]: number[]) => pose.radius[0] + (pose.radius[1] - pose.radius[0]) * g + (pose.radius[2] - pose.radius[1]) * s,
  );
  const clipPath = useMotionTemplate`inset(0px round ${radius}px)`;
  const glow = useTransform([grow, settle], ([g, s]: number[]) => 0.3 + 0.7 * g - 0.35 * s);
  const glare = useTransform(face, (f) => f * 0.9);
  // The screen wakes as it turns to face the visitor.
  const dimmer = useTransform(face, (f) => f * 0.4);

  /* Wide screens only: the heading steps back as the screen comes up
     (scrubbed, transform only), then leaves before the screen reaches it —
     a short triggered fade, so it is never left half-faded — and comes back
     the same way when the visitor scrolls up again. On a phone the screen
     never reaches it, so it stays. */
  const headingY = useTransform(p, [0, HEADING_OUT], [0, wide ? -24 : 0]);
  const headingScale = useTransform(p, [0, HEADING_OUT], [1, wide ? 0.95 : 1]);
  const [headingAway, setHeadingAway] = useState(() => wide && p.get() > HEADING_OUT);

  const [view, setView] = useState(() => viewAt(p.get()));
  useMotionValueEvent(p, "change", (value) => {
    if (value > HEADING_OUT + HOLD) setHeadingAway(wide);
    else if (value < HEADING_OUT - HOLD) setHeadingAway(false);
    // Hold the current view while the progress sits right on a boundary, so
    // a spring settling there cannot flick the caption back and forth.
    const before = viewAt(value - HOLD);
    const after = viewAt(value + HOLD);
    if (before === after) setView(before);
  });

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
            <p
              id="welcome-features-screen-note"
              className="mx-auto mt-3 max-w-[30rem] text-balance text-[0.9375rem] leading-[1.5] text-[var(--text-secondary)] sm:text-base lg:mt-5 lg:text-lg"
            >
              {SCREEN_NOTE}
            </p>
          </motion.div>

          <div className={styles.region}>
            <figure aria-labelledby="welcome-features-screen-note" className={styles.figure}>
              <div
                ref={slotRef}
                className={styles.slot}
                style={{ perspective: `${pose.perspective}px` }}
              >
                <motion.div aria-hidden="true" className={styles.glow} style={{ opacity: glow }} />
                <motion.div
                  className={styles.screen}
                  style={{ y, scale, rotateX, originY: pose.originY }}
                >
                  <div aria-hidden="true" className={styles.shadow} />
                  <motion.div className={styles.bezel} style={{ clipPath }}>
                    <div className={styles.window}>
                      <BrowserBar />
                      <div className={styles.viewport}>
                        <div className={styles.layer}>
                          <Image
                            src={SCREEN_VIEWS[0].src}
                            alt={SCREEN_VIEWS[0].alt}
                            fill
                            sizes={IMAGE_SIZES}
                          />
                        </div>
                        <Wipe progress={p} range={WIPES[0]} view={SCREEN_VIEWS[1]} />
                        <Wipe progress={p} range={WIPES[1]} view={SCREEN_VIEWS[2]} />
                        <motion.div
                          aria-hidden="true"
                          className={`${styles.layer} bg-[#05030a]`}
                          style={{ opacity: dimmer }}
                        />
                      </div>
                    </div>
                    <motion.div aria-hidden="true" className={styles.glare} style={{ opacity: glare }} />
                  </motion.div>
                </motion.div>
              </div>
              <Captions view={view} progress={p} wide={wide} />
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
 */
function Wipe({
  progress,
  range,
  view,
}: {
  progress: MotionValue<number>;
  range: readonly [number, number];
  view: ScreenView;
}) {
  const wiped = useTransform(progress, [range[0], range[1]], [0, 100], { ease: easeInOut });
  const clipPath = useTransform(wiped, (w) => `inset(0% ${100 - w}% 0% 0%)`);
  const scale = useTransform(wiped, [0, 100], [1.05, 1]);
  const edgeX = useTransform(wiped, (w) => `${w}%`);
  const edgeOpacity = useTransform(wiped, [0, 4, 96, 100], [0, 1, 1, 0]);
  const dim = useTransform(wiped, [0, 50, 100], [0, 0.4, 0]);

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

/**
 * The caption under the screen: which view it is, one line about it, and a
 * three-part progress rail. It repeats what the images' alt text already
 * says, so it is hidden from assistive technology. Each change is a short
 * triggered crossfade on solid page background, so the words are either
 * fully there or not there.
 */
function Captions({
  view,
  progress,
  wide,
}: {
  view: number;
  progress: MotionValue<number>;
  wide: boolean;
}) {
  const active = view >= 0 ? SCREEN_VIEWS[view] : null;
  return (
    <div aria-hidden="true" className={styles.strip}>
      <div className="relative min-w-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: EASE_OUT }}
              className="flex min-w-0 flex-col gap-1.5 lg:flex-row lg:items-baseline lg:gap-4"
            >
              <span className="flex items-baseline gap-3">
                <span className="text-[0.75rem] font-bold tabular-nums tracking-[0.12em] text-[var(--accent)]">
                  0{view + 1}
                </span>
                <span className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.02em] text-[var(--foreground)] lg:text-xl">
                  {active.label}
                </span>
              </span>
              <span className="text-[0.9375rem] leading-[1.45] text-[var(--text-secondary)]">
                {active.line}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <motion.div
        className={
          wide
            ? "flex flex-none gap-2"
            : "absolute right-5 top-[1.4rem] flex gap-1.5 sm:right-1"
        }
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        {SEGMENTS.map((segment, index) => (
          <Segment key={SCREEN_VIEWS[index].id} progress={progress} range={segment} wide={wide} />
        ))}
      </motion.div>
    </div>
  );
}

function Segment({
  progress,
  range,
  wide,
}: {
  progress: MotionValue<number>;
  range: readonly [number, number];
  wide: boolean;
}) {
  const fill = useTransform(progress, [range[0], range[1]], [0, 1]);
  return (
    <span
      className={`relative block h-[3px] overflow-hidden rounded-full bg-[#342a43] ${wide ? "w-14" : "w-8"}`}
    >
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
