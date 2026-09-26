"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { SCENE_SPRING, useCinema } from "@/components/animations/cinema";

/**
 * The hero's exit: what happens to it while it scrolls away, and nothing
 * else. At scroll 0 every layer below is at rest, so the hero is drawn
 * exactly as it always was (its pieces keep `initial={false}`: no entrance
 * animation, the sentence is the first thing on screen).
 *
 * As the visitor scrolls on, the hero comes apart in depth rather than just
 * sliding off the top:
 *
 * - the promise (the copy column) is the far layer — it drifts up a little
 *   slower than the page and softens as it goes;
 * - the device frames are the near layer — they recline, top edge away, and
 *   settle back, as if the phone were being set down for the tour below to
 *   pick up;
 * - the corner glow follows the scroll down and out, so the light leaves the
 *   hero last, while the bottom of the hero darkens into the page (dusk).
 *
 * Each layer is a plain wrapper whose motion values sit at rest (no
 * transform, full opacity) unless the scroll cinema is on, so the server
 * render, reduced motion, large text and short windows all get the hero as
 * it is. The scroll measuring only mounts with the cinema. Layers that hold
 * text or controls never fade far: the frames keep full opacity and the copy
 * stops at `COPY_FLOOR`, so every control stays visible and every line stays
 * readable wherever the visitor stops.
 */

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * A layer leaves from the moment its middle passes the middle of the window
 * until its bottom edge has gone past the top. That is the same rhythm for
 * the side-by-side desktop stage and the stacked phone layout, where the
 * frames only start to leave well after the copy has.
 */
const LAYER_EXIT: ScrollOffset = ["center center", "end start"];
/** The glow belongs to the whole hero: 0 at the top, 1 once it is gone. */
const HERO_EXIT: ScrollOffset = ["start start", "end start"];
/**
 * On a phone the copy column's middle can already sit above the middle of
 * the window at scroll 0. Progress is eased in over the first scroll steps so
 * that nothing is ever displaced before the visitor has scrolled at all.
 */
const REST_UNTIL_PX = 96;
/**
 * How far the copy softens. Its dimmest text is the tour's 55 % white
 * labels; at 85 % they still read at 5:1 on the page, and the violet CTA
 * keeps its white label above 4.5:1, so nothing a visitor can still see ever
 * drops below WCAG AA on the way out.
 */
const COPY_FLOOR = 0.85;

/**
 * How far the copy lags behind the page by the time it has left. Beside the
 * frames (lg and up) it can lag well behind; stacked above the phone it lags
 * less than the 48 px gap between them, so the phone never slides over it.
 */
const COPY_LAG_SIDE_BY_SIDE = 132;
const COPY_LAG_STACKED = 40;
/** The frames' exit: tilt (deg), final scale, drift (px), and how far into
 * their exit the tilt is complete. */
const FRAMES_TILT = 16;
const FRAMES_SCALE = 0.92;
const FRAMES_DRIFT = 40;
const FRAMES_TILTED_AT = 0.42;
const FRAMES_PERSPECTIVE = 1200;
/** Tailwind's `lg`, where the hero turns into its side-by-side stage. */
const SIDE_BY_SIDE_QUERY = "(min-width: 64rem)";

function subscribeSideBySide(onChange: () => void) {
  const query = window.matchMedia(SIDE_BY_SIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useSideBySide(): boolean {
  return useSyncExternalStore(
    subscribeSideBySide,
    () => window.matchMedia(SIDE_BY_SIDE_QUERY).matches,
    () => false,
  );
}

/**
 * Exit progress for a layer: 0 at rest, 1 once it has left. Stays 0 without
 * the cinema, and returns to 0 if the cinema switches off mid-visit.
 */
function useExitProgress(target: RefObject<HTMLElement | null>, offset: ScrollOffset) {
  const cinema = useCinema();
  const progress = useMotionValue(0);
  const tracker = cinema ? <ExitTracker target={target} offset={offset} into={progress} /> : null;
  // A layer is promoted to its own compositor layer only while it is away
  // from rest, so at the top of the page the hero is painted exactly as it
  // always was (same text rasterisation, no extra layers).
  const willChange = useTransform(progress, (value) => (value > 0.001 ? "transform" : "auto"));
  return { progress, tracker, willChange };
}

function ExitTracker({
  target,
  offset,
  into,
}: {
  target: RefObject<HTMLElement | null>;
  offset: ScrollOffset;
  into: MotionValue<number>;
}) {
  const { scrollY, scrollYProgress } = useScroll({ target, offset });
  const gated = useTransform(
    () => scrollYProgress.get() * Math.min(1, Math.max(0, scrollY.get() / REST_UNTIL_PX)),
  );
  const eased = useSpring(gated, SCENE_SPRING);
  useMotionValueEvent(eased, "change", (value) => into.set(value));
  useEffect(() => () => into.set(0), [into]);
  return null;
}

/**
 * The promise: drifts up slower than the page, recedes a little and softens
 * as it leaves. Its transform origin comes from the caller's classes (top
 * centre on a phone, top left beside the frames).
 */
export function HeroCopyDepth({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { progress, tracker, willChange } = useExitProgress(ref, LAYER_EXIT);
  const lag = useSideBySide() ? COPY_LAG_SIDE_BY_SIDE : COPY_LAG_STACKED;
  const y = useTransform(progress, [0, 1], [0, lag]);
  const scale = useTransform(progress, [0, 1], [1, 0.96]);
  const opacity = useTransform(progress, [0.5, 1], [1, COPY_FLOOR]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, scale, opacity, willChange }}
    >
      {tracker}
      {children}
    </motion.div>
  );
}

/**
 * The device frames: they recline (up to 16°, top edge away), settle back to
 * 92 % and drift down a touch, handing the phone to the tour below. The tilt
 * is complete well before half of the frames have left, while most of the
 * phone is still on screen to show it.
 */
export function HeroFramesDepth({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { progress, tracker, willChange } = useExitProgress(ref, LAYER_EXIT);
  // Written out rather than through framer's `transformPerspective`, which
  // would leave `perspective()` on the frames at rest and repaint their tab
  // labels on a 3D layer; at rest this is `none`, exactly as before.
  const transform = useTransform(progress, (value) => {
    if (value <= 0.001) return "none";
    const tilt = Math.min(1, value / FRAMES_TILTED_AT);
    return `perspective(${FRAMES_PERSPECTIVE}px) translateY(${(value * FRAMES_DRIFT).toFixed(2)}px) rotateX(${(tilt * FRAMES_TILT).toFixed(3)}deg) scale(${(1 - tilt * (1 - FRAMES_SCALE)).toFixed(4)})`;
  });

  return (
    <motion.div ref={ref} className={className} style={{ transform, willChange }}>
      {tracker}
      {children}
    </motion.div>
  );
}

/**
 * The corner glow's layer: a full-size, decorative box whose only paint is
 * the glow inside it. It drifts down and to the right and opens up a little
 * as the hero leaves.
 */
export function HeroGlowDepth({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { progress, tracker } = useExitProgress(ref, HERO_EXIT);
  const x = useTransform(progress, [0, 1], [0, 300]);
  const y = useTransform(progress, [0, 1], [0, 420]);
  const scale = useTransform(progress, [0, 1], [1, 1.35]);

  return (
    <motion.div ref={ref} className={className} style={{ x, y, scale, originX: 0, originY: 0 }} aria-hidden="true">
      {tracker}
      {children}
    </motion.div>
  );
}

/**
 * Dusk: the bottom of the hero darkens to the page's own background as the
 * hero leaves, so its violet top light meets the tour below without a seam.
 * Invisible at rest and without the cinema.
 */
export function HeroDuskDepth({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { progress, tracker } = useExitProgress(ref, HERO_EXIT);
  const opacity = useTransform(progress, [0, 0.22], [0, 1]);

  return (
    <motion.div ref={ref} className={className} style={{ opacity }} aria-hidden="true">
      {tracker}
    </motion.div>
  );
}
