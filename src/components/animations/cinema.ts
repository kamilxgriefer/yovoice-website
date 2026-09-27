"use client";

import { useDeferredValue, useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import {
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";

import { SCENE_SPRING } from "@/components/animations/motion";

/**
 * Scroll cinema: the homepage's scroll-driven scenes (owner request,
 * 2026-09-26: the whole page should move with the scroll the way the
 * reference sites do, in YO Voice's own language).
 *
 * Every scene is progressive enhancement over a static layout that already
 * reads well on its own. That static layout is what the server renders, what
 * a visitor without JavaScript gets, and what stays on screen whenever the
 * cinema is off:
 *
 * - `prefers-reduced-motion: reduce` — nothing is pinned, scrubbed or
 *   revealed, and nothing moves on its own;
 * - a viewport shorter than 32rem or narrower than 20rem. The query is in
 *   `rem`, which media queries resolve against the visitor's default font
 *   size, so a larger text setting or page zoom turns the pinned,
 *   fixed-height stages off on a phone (200 % text) and on short desktop
 *   windows. A tall desktop window can keep the cinema at 150-200 % text, so
 *   every stage sizes its text blocks to their content (and a scene that
 *   cannot hold its text falls back to its own static layout);
 * - before hydration, so the server and the first client render agree.
 */
export const CINEMA_QUERY =
  "(prefers-reduced-motion: no-preference) and (min-width: 20rem) and (min-height: 32rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(CINEMA_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const clientSnapshot = () => window.matchMedia(CINEMA_QUERY).matches;
const serverSnapshot = () => false;

/**
 * True once the page has hydrated in a browser that can take the scroll
 * cinema; false on the server, in the first client render and whenever the
 * query above stops matching (a window resized short, reduced motion
 * switched on mid-visit).
 *
 * Scenes render their static layout while this is false and mount their
 * scroll-driven layout as a separate component when it turns true, so the
 * hooks that measure scroll position always attach to elements that exist.
 */
export function useCinema(): boolean {
  // After hydration the store's snapshot changes from false to true, which
  // React re-renders synchronously. Deferring the value moves the expensive
  // part (every scene swapping in its scroll-driven tree) into a background
  // render that React can interrupt, so arming the cinema never blocks the
  // main thread in one long task while the visitor starts to scroll. A scene
  // mounted later (client navigation) gets the current value at once.
  return useDeferredValue(useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot));
}

let lastRelocation = -Infinity;
let relocationCount = 0;
const relocationListeners = new Set<() => void>();

function relocated() {
  lastRelocation = performance.now();
  relocationCount += 1;
  for (const listener of [...relocationListeners]) listener();
}

let lastScrollY = 0;
if (typeof window !== "undefined") {
  lastScrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      const step = Math.abs(y - lastScrollY);
      lastScrollY = y;
      if (step > window.innerHeight * 1.5) relocated();
    },
    { passive: true },
  );
}

/**
 * Moves the page as a relocation rather than a scroll, whatever the
 * distance: the page's own landings (a fragment, a restored position, the
 * cinema switching layout mid-visit) run their jump through this, so the
 * scenes draw in place instead of playing or sweeping. `jump` must scroll
 * synchronously (`behavior: "instant"`).
 */
export function relocate(jump: () => void) {
  jump();
  lastScrollY = window.scrollY;
  relocated();
}

/**
 * Called synchronously after every relocation, before the next paint, with
 * the page already at its new position. Returns the unsubscribe.
 */
export function onRelocation(listener: () => void): () => void {
  relocationListeners.add(listener);
  return () => relocationListeners.delete(listener);
}

/**
 * True for a moment after the page was relocated rather than scrolled (an
 * in-page link, a restored position): one step of more than one and a half
 * windows, or a jump made through `relocate`. A triggered entrance that
 * comes into view because of it is drawn in place instead of played, like
 * every scene does on a relocation. Pass the time the intersection was
 * computed (`IntersectionObserverEntry.time`), not the time its callback
 * runs, so a slow device that reports late still counts it.
 */
export function justRelocated(at: number = performance.now()): boolean {
  return at >= lastRelocation && at - lastRelocation < 400;
}

export { DUR, EASE_IN, EASE_IN_OUT, EASE_OUT, EXIT, RISE, SCENE_SPRING, STAGGER, SWAP } from "@/components/animations/motion";

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/*
 * One rule for measurements that feed a scene (a centre offset, a start
 * position, a zoom): keep them in React state set from a layout effect, or
 * set the motion values they drive inside the measuring callback itself. A
 * motion value set in a layout effect declared before the `useTransform`
 * that combines it is not seen until the scroll moves, which once dealt the
 * Download cards from their grid slots into a pile in view.
 */

/**
 * Scroll progress (0..1) of `target` through the viewport, eased by a short
 * spring so a wheel's steps read as one glide. Scroll itself is never taken
 * over: the page moves exactly as far as the visitor scrolls, only the scene
 * follows a few frames behind.
 *
 * `offset` is framer-motion's: `["start start", "end end"]` for a pinned
 * stage (0 when its top reaches the top of the viewport, 1 when its bottom
 * reaches the bottom), `["start end", "end start"]` for something that
 * crosses the whole viewport.
 */
export function useSceneProgress(
  target: RefObject<HTMLElement | null>,
  offset: ScrollOffset = ["start start", "end end"],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target, offset });
  const progress = useSpring(scrollYProgress, SCENE_SPRING);
  useRelocationJump(scrollYProgress, progress);
  return progress;
}

/**
 * Makes a spring that follows the scroll land at once when the page is
 * relocated rather than scrolled — an in-page link, a restored position, or
 * the scene itself mounting mid-page — instead of fast-forwarding through
 * every frame in between. A relocation is one step of more than one and a
 * half windows; a wheel, a trackpad flick, Page Down or the rail's smooth
 * scroll all move less than that per step, so they keep the spring.
 */
export function useRelocationJump(source: MotionValue<number>, follower: MotionValue<number>) {
  const lastY = useRef<number | null>(null);
  const mountedAt = useRef<number | null>(null);
  const seen = useRef(relocationCount);
  useEffect(() => {
    mountedAt.current = performance.now();
    lastY.current = window.scrollY;
  }, []);
  useMotionValueEvent(source, "change", (latest) => {
    const y = window.scrollY;
    const step = lastY.current === null ? 0 : Math.abs(y - lastY.current);
    lastY.current = y;
    // The first measurement after mounting is where the scene already is.
    const justMounted = mountedAt.current === null || performance.now() - mountedAt.current < 250;
    // The page's own landings count whatever their distance (`relocate`).
    const landed = seen.current !== relocationCount && justRelocated();
    seen.current = relocationCount;
    if (justMounted || landed || step > window.innerHeight * 1.5) follower.jump(latest);
  });
}

/**
 * A lean, in degrees, that follows how fast the page is being scrolled and
 * straightens when it stops — for giant decorative words only. Positive
 * while scrolling down. Mount it only while the cinema is on.
 *
 * A relocation is not a scroll: a jump, a restored position or a landing
 * reads as standing still, so the words never arrive slanted. The follow
 * comes to rest within a few px/s (well under 0.01°), so it stops asking for
 * frames soon after the scroll does.
 */
export function useScrollLean(max = 6): MotionValue<number> {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const scrolled = useTransform(velocity, (speed) => (justRelocated() ? 0 : speed));
  const eased = useSpring(scrolled, { stiffness: 260, damping: 44, mass: 0.6, restDelta: 5, restSpeed: 50 });
  useEffect(() => onRelocation(() => eased.jump(0)), [eased]);
  return useTransform(eased, [-2600, 0, 2600], [-max, 0, max], { clamp: true });
}
