import {
  CHAPTERS,
  FINALE_START,
  FINALE_TINT,
  INTRO_END,
  chapterStart,
} from "@/components/story/story-chapters";

/**
 * The 3D phone's pose over the story's progress `p` (0 when the stage pins,
 * 1 when it lets go), for the WebGL phone (`story-phone-gl.ts`).
 *
 * A lit, bevelled body reads as a device at any angle, so it turns further
 * than the CSS phone (whose ±24° limit keeps a flat card from showing that
 * it is one): it is lifted off the table and spun into view over the intro,
 * showing its dark glass back once, swings to the other side at each
 * hand-over, and makes one full turn as the giant line arrives, landing
 * face-on. The rise into place is the stage's own CSS translate, shared with
 * the CSS phone, so the canvas never has to be taller than the phone.
 *
 * Pure numbers: the same progress always gives the same pose, so scrolling
 * back plays it backwards and stopping holds it.
 */

export type Rgb = readonly [number, number, number];

export type PhonePose = {
  /** Degrees: tilt back, turn, lean. */
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  /** Capture index shown, the one wiping in, and how far (0..1). */
  from: number;
  to: number;
  wipe: number;
  /** The wipe's glowing edge, in the incoming destination's dock colour. */
  edge: Rgb;
  /** Rim light on the frame and glass: the current dock colour. */
  rim: Rgb;
  /** The finale's range, 0..1 (wide screens only). */
  fan: number;
};

const B = [1, 2, 3].map(chapterStart);
const F = FINALE_START;

/** Half-width of the swing around a boundary. */
const SWING = 0.03;
/** The same wipe window as the CSS phone's screens. */
export const WIPE_IN = 0.026;
export const WIPE_OUT = 0.022;

const POSE_AT = [0, INTRO_END, B[0] - SWING, B[0] + SWING, B[1] - SWING, B[1] + SWING, B[2] - SWING, B[2] + SWING, F - 0.02, F + 0.1];
const ROTATE_Y = [-210, -14, -8, 24, 14, -22, -12, 24, 10, 360];
const ROTATE_Z = [-8, -2, -1, 3, 2, -3, -2, 3, 1, 0];

const LIFT_AT = [0, INTRO_END, B[0] - SWING, B[0], B[0] + SWING, B[1] - SWING, B[1], B[1] + SWING, B[2] - SWING, B[2], B[2] + SWING, F];
const ROTATE_X = [58, 4, 3, 9, 3, 3, 9, 3, 3, 9, 3, 0];
const SCALE = [0.78, 1, 1, 0.96, 1, 1, 0.96, 1, 1, 0.96, 1, 1];

/** The range fans out once the phone has landed face-on and the words are in. */
export const FAN = [F + 0.105, F + 0.195] as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function keyframes(p: number, at: number[], values: number[], ease: (t: number) => number = easeInOutCubic) {
  if (p <= at[0]) return values[0];
  for (let index = 1; index < at.length; index++) {
    if (p <= at[index]) {
      const t = (p - at[index - 1]) / (at[index] - at[index - 1]);
      return values[index - 1] + (values[index] - values[index - 1]) * ease(t);
    }
  }
  return values[values.length - 1];
}

export function rgb(hex: string): Rgb {
  return [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255) as unknown as Rgb;
}

const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const CORES = [...CHAPTERS.map((chapter) => rgb(chapter.core)), rgb(FINALE_TINT.core)];
/** Where each next colour takes over: the flood's own hand-overs. */
const TINT_AT = [B[0], B[1], B[2], F + 0.012];

export function poseAt(p: number): PhonePose {
  let from = 0;
  let to = 1;
  let wipe = 0;
  let edge = CORES[1];
  B.forEach((boundary, index) => {
    if (p < boundary - WIPE_IN) return;
    from = index;
    to = index + 1;
    wipe = easeInOutCubic(clamp01((p - (boundary - WIPE_IN)) / (WIPE_IN + WIPE_OUT)));
    edge = CORES[index + 1];
  });
  if (wipe >= 1) from = to;

  // The rim light crossfades with the flood behind it, never jumps.
  let rim = CORES[0];
  TINT_AT.forEach((at, index) => {
    rim = mixRgb(rim, CORES[index + 1], clamp01((p - (at - 0.022)) / 0.044));
  });

  return {
    rx: keyframes(p, LIFT_AT, ROTATE_X),
    ry: keyframes(p, POSE_AT, ROTATE_Y),
    rz: keyframes(p, POSE_AT, ROTATE_Z),
    scale: keyframes(p, LIFT_AT, SCALE),
    from,
    to,
    wipe,
    edge,
    rim,
    fan: clamp01((p - FAN[0]) / (FAN[1] - FAN[0])),
  };
}
