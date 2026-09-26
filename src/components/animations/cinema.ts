"use client";

import { useSyncExternalStore, type RefObject } from "react";
import { useScroll, useSpring, type MotionValue } from "framer-motion";

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
 *   size, so a larger text setting (200 % text on a phone) or page zoom turns
 *   the pinned, fixed-height stages off before they could clip that text;
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
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}

/** One shared feel for every scrubbed scene: a short, well-damped follow. */
export const SCENE_SPRING = { stiffness: 170, damping: 32, mass: 0.3, restDelta: 0.0005 } as const;

/** The site's one ease-out curve (the hero frames use it too). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

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
  return useSpring(scrollYProgress, SCENE_SPRING);
}
