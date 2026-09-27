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

/** One shared feel for every scrubbed scene: a short, well-damped follow. */
export const SCENE_SPRING = { stiffness: 170, damping: 32, mass: 0.3, restDelta: 0.0005 } as const;

/** The site's one ease-out curve (the hero frames use it too). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Exits leave faster than they came: a cut, not a drift. */
export const EASE_IN = [0.55, 0, 1, 0.45] as const;
/** Camera moves and wipes that start and land. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/**
 * The motion language every scene speaks (2026-09-27): the durations,
 * distances and staggers a triggered move may use. Scrubbed pictures follow
 * the scroll through `SCENE_SPRING` instead.
 */
export const DUR = { micro: 0.16, swap: 0.32, text: 0.56, block: 0.9 } as const;
export const STAGGER = { word: 0.03, line: 0.07, item: 0.08 } as const;
/** How far text rises into place, in px. */
export const RISE = { text: 16, line: 24, block: 36 } as const;
/** A heading leaving a pinned stage. */
export const EXIT = { duration: 0.28, y: -16, blur: 6 } as const;
/** One caption or line handing over to the next. */
export const SWAP = {
  out: { duration: DUR.micro, y: -8 },
  in: { duration: DUR.swap, y: 10, delay: 0.12 },
} as const;

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
    if (justMounted || step > window.innerHeight * 1.5) follower.jump(latest);
  });
}

/**
 * A lean, in degrees, that follows how fast the page is being scrolled and
 * straightens when it stops — for giant decorative words only. Positive
 * while scrolling down. Mount it only while the cinema is on.
 */
export function useScrollLean(max = 6): MotionValue<number> {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const eased = useSpring(velocity, { stiffness: 260, damping: 44, mass: 0.6 });
  return useTransform(eased, [-2600, 0, 2600], [-max, 0, max], { clamp: true });
}
