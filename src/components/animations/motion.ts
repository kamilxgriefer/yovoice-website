/**
 * The scroll cinema's motion tokens (2026-09-27), in a module of their own
 * so a server component can read them as plain numbers (`cinema.ts` is a
 * client module, and its exports reach the server only as references).
 * `cinema.ts` re-exports every one of them.
 */

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
