/**
 * Client-side memory for the Log in <-> Create account transition.
 *
 * The two forms are separate pages, so the one that mounts cannot see the one
 * that just left. The switch and the forms' own cross-links stamp the moment
 * the visitor navigated to the other mode; the incoming form checks the stamp
 * to decide whether to unfold its mode-only rows, or simply appear as it does
 * on a cold page load.
 *
 * Module state is fine here: it only ever lives in one browser tab, and the
 * server never reads it (every reader is guarded by `typeof window`).
 */
let switchedAt = 0;

const SWITCH_WINDOW_MS = 2500;

export function markAuthModeSwitch() {
  if (typeof window === "undefined") return;
  switchedAt = window.performance.now();
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** True when this form mounted because of a switch a moment ago and the
 * visitor has not asked for reduced motion. */
export function shouldPlayAuthModeSwitch() {
  if (typeof window === "undefined" || switchedAt === 0) return false;
  return window.performance.now() - switchedAt < SWITCH_WINDOW_MS && !prefersReducedMotion();
}
