"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  animate,
  cancelFrame,
  easeOut,
  frame,
  motion,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";

import { DUR, EASE_OUT } from "@/components/animations/cinema";
import styles from "@/components/story/app-story.module.css";
import { CHAPTERS, FINALE_START, INTRO_END } from "@/components/story/story-chapters";
// Type only (erased from the bundle): the engine and OGL load on demand.
import type { PhoneEngine, PhoneView } from "@/components/story/story-phone-gl";
import { poseAt } from "@/components/story/story-pose";

/**
 * The story's phone as a lit 3D object, over the CSS phone.
 *
 * Progressive enhancement inside the cinema: the CSS phone is drawn first
 * and stays mounted underneath. The WebGL phone is never tried at load: only
 * once the visitor scrolls with the story within a screen of the window (or
 * arrives already that close), once the page has loaded and the browser is
 * idle, and only where it will run well:
 *
 * - WebGL 2 on a real GPU (`failIfMajorPerformanceCaveat`, which refuses
 *   software rendering), no Data Saver, at least 4 GB of device memory, and
 *   not in forced colours (where the CSS phone leaves its veils out);
 * - then OGL and the engine are fetched (one lazy chunk) and the four
 *   captures loaded through images, sharing the page's cache and format.
 *
 * It fades in over the CSS phone once its first frame is drawn. It draws only
 * while the story's progress changes — once per frame, in the frame loop's
 * render step — and never on its own. If the device cannot keep up — the
 * median interval over 30 draws over a third longer than the page's own
 * frame interval (measured on frames without a draw, so a display held at
 * 30 Hz is not mistaken for a slow GPU) and under ~55 fps — it first halves
 * its resolution, then gives the stage back to the CSS phone for the rest of
 * the visit: at the next rest, crossfading out over the CSS phone. A lost
 * context or any error hands back at once.
 *
 * Wide screens: from the finale's full turn the canvas covers the whole
 * stage (`data-range`), so the other three destinations can fan out beside
 * the phone under "Start talking." — the phone keeps its pixel size and
 * place while the canvas grows. Phones keep the canvas on the phone's slot.
 *
 * Hidden from assistive technology like the CSS phone: the chapter text says
 * what each screen is for, and the hero describes every capture.
 */

/** Set once the WebGL phone has given up in this visit; the CSS phone stays. */
let givenUp = false;

/** The canvas covers the stage from the finale's turn (with a little hysteresis). */
const RANGE_ON = FINALE_START + 0.03;
const RANGE_OFF = FINALE_START + 0.01;
const WIDE = "(min-width: 64rem)";

/** Draws this much slower than the page's own frames (and under ~55 fps)
 * mean the device cannot keep up. */
const SLOWER = 1.35;
const SLOW_FLOOR = 1000 / 55;
/** Frames the story's progress must hold still to count as a rest. */
const REST_FRAMES = 8;

/** The captures through Next's image optimizer: 640 px wide, the default quality. */
const captureUrl = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;

type Status = "idle" | "off";

export function StoryPhoneGL({
  progress,
  trackRef,
  stageRef,
  slotRef,
}: {
  progress: MotionValue<number>;
  /** The story's track: the phone is fetched as the visitor scrolls toward it. */
  trackRef: RefObject<HTMLElement | null>;
  /** Carries `data-gl`, which hands the stage from the CSS phone to this one. */
  stageRef: RefObject<HTMLElement | null>;
  /** The CSS phone's slot: where the phone sits once the canvas covers the stage. */
  slotRef: RefObject<HTMLElement | null>;
}) {
  const [status, setStatus] = useState<Status>(() => (givenUp ? "off" : "idle"));
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);

  // The same rise as the CSS phone: from under the heading into place.
  const rise = useTransform(progress, [0, INTRO_END], [1, 0], { ease: easeOut });

  useEffect(() => {
    if (status !== "idle") return;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    const box = boxRef.current;
    const stage = stageRef.current;
    if (!track || !canvas || !box || !stage) return;

    let cancelled = false;
    let idle = 0;
    let raf = 0;
    let sampleRaf = 0;
    let restRaf = 0;
    let engine: PhoneEngine | null = null;
    const cleanups: (() => void)[] = [];

    const wide = window.matchMedia(WIDE);
    const forced = window.matchMedia("(forced-colors: active)");
    const touch = window.matchMedia("(pointer: coarse)").matches;

    const giveUp = () => {
      if (cancelled) return;
      givenUp = true;
      cancelled = true;
      engine?.dispose();
      engine = null;
      delete stage.dataset.gl;
      setStatus("off");
    };

    /** Where the phone sits in the canvas right now. */
    const measure = (): PhoneView => {
      const phonePx = sizerRef.current?.offsetHeight || canvas.clientHeight * 0.84;
      if (box.dataset.range !== "true" || !slotRef.current) return { phonePx, offsetX: 0, offsetY: 0 };
      const slot = slotRef.current.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      return {
        phonePx,
        offsetX: slot.left + slot.width / 2 - (own.left + own.width / 2),
        offsetY: slot.top + slot.height / 2 - (own.top + own.height / 2),
      };
    };

    /* ---- The adaptive guard ---- */

    let reduced = false;
    let lastDraw = 0;
    let intervals: number[] = [];
    /** The page's own frame interval, from frames without a draw (0: not yet known). */
    let baseline = 0;
    let checking = false;
    let leaving = false;

    /**
     * The page's frame interval: the median over `count` frames in which the
     * phone did not draw (nor in the frame before), or 0 if the story kept
     * moving for all of `patience` frames. While the engine loads behind the
     * CSS phone every frame counts.
     */
    const sampleFrames = (count: number, patience: number) =>
      new Promise<number>((resolve) => {
        const gaps: number[] = [];
        let before = 0;
        let last = 0;
        let ticks = 0;
        const tick = () => {
          sampleRaf = 0;
          if (cancelled) return resolve(0);
          const now = performance.now();
          if (before && lastDraw < before) gaps.push(now - last);
          before = last;
          last = now;
          ticks += 1;
          if (gaps.length >= count || ticks >= patience) {
            gaps.sort((a, b) => a - b);
            return resolve(gaps.length >= Math.min(count, 8) ? gaps[gaps.length >> 1] : 0);
          }
          sampleRaf = requestAnimationFrame(tick);
        };
        sampleRaf = requestAnimationFrame(tick);
      });

    const tooSlow = (median: number) => baseline > 0 && median > Math.max(baseline * SLOWER, SLOW_FLOOR);

    /** Calls `then` once the story's progress has held still for a few
     * frames: a visitor at rest, or scrolling elsewhere on the page. */
    const atRest = (then: () => void) => {
      let seen = progress.get();
      let still = 0;
      const tick = () => {
        restRaf = 0;
        if (cancelled) return;
        const now = progress.get();
        still = now === seen ? still + 1 : 0;
        seen = now;
        if (still >= REST_FRAMES) return then();
        restRaf = requestAnimationFrame(tick);
      };
      restRaf = requestAnimationFrame(tick);
    };

    /** Gives the stage back to the CSS phone for the rest of the visit, at
     * the next rest: the CSS phone shows again underneath at once and the
     * canvas crossfades out over it (still drawing if the story moves). */
    const handBack = () => {
      if (leaving || cancelled) return;
      leaving = true;
      givenUp = true;
      atRest(() => {
        delete stage.dataset.gl;
        const fade = animate(canvas, { opacity: 0 }, { duration: DUR.swap, ease: EASE_OUT });
        cleanups.push(() => fade.stop());
        void fade.then(giveUp);
      });
    };

    /** A run of slow draws: first the page's own frame interval again, at
     * the next rest (the display may have slowed down since — a low-power
     * mode switched on), then the verdict. */
    const check = async (median: number) => {
      if (checking || leaving) return;
      checking = true;
      const fresh = await sampleFrames(12, 90);
      checking = false;
      if (cancelled || !engine) return;
      if (fresh) baseline = fresh;
      if (!tooSlow(median)) return;
      if (engine.dpr > 1) {
        reduced = true;
        engine.setDpr(1);
      } else handBack();
    };

    const watch = () => {
      const now = performance.now();
      const gap = now - lastDraw;
      lastDraw = now;
      if (gap > 100 || leaving) return;
      intervals.push(gap);
      if (intervals.length < 30) return;
      const median = [...intervals].sort((a, b) => a - b)[15];
      intervals = [];
      if (!baseline || tooSlow(median)) void check(median);
    };

    let range = false;
    const draw = () => {
      if (!engine) return;
      const p = progress.get();
      const isWide = wide.matches;
      const nextRange = isWide && (range ? p >= RANGE_OFF : p >= RANGE_ON);
      if (nextRange !== range) {
        range = nextRange;
        // The canvas's size changes with this; the resize observer below
        // re-lays it out before this frame is painted.
        box.dataset.range = range ? "true" : "false";
      }
      const pose = poseAt(p);
      if (!isWide) pose.fan = 0;
      try {
        engine.draw(pose);
      } catch {
        giveUp();
        return;
      }
      watch();
    };

    const start = async () => {
      if (cancelled) return;
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      if (forced.matches || connection?.saveData || memory < 4) return giveUp();

      const dprFor = () => Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
      const dpr = dprFor();
      const antialias = !touch && dpr < 2;
      // The gate: a context only where WebGL 2 runs on a real GPU. OGL takes
      // this very context (a canvas keeps its first one).
      const gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias,
        premultipliedAlpha: true,
        depth: true,
        stencil: false,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: true,
      });
      if (!gl) return giveUp();
      const lost = (event: Event) => {
        event.preventDefault();
        giveUp();
      };
      canvas.addEventListener("webglcontextlost", lost);
      cleanups.push(() => canvas.removeEventListener("webglcontextlost", lost));

      // The page's own frame interval, while the CSS phone still shows.
      void sampleFrames(30, 240).then((interval) => {
        if (interval && !baseline) baseline = interval;
      });

      try {
        const { createPhoneEngine } = await import("@/components/story/story-phone-gl");
        if (cancelled) return;
        const created = await createPhoneEngine(canvas, {
          captures: CHAPTERS.map((chapter) => captureUrl(chapter.screen.phone)),
          dpr,
          antialias,
          textureWidth: touch ? 512 : 640,
        });
        if (cancelled) {
          created.dispose();
          return;
        }
        engine = created;
      } catch {
        return giveUp();
      }

      engine.layout(measure());
      draw();
      // One draw per frame, in the frame loop's render step, while the story moves.
      let scheduled = false;
      const drawOnce = () => {
        scheduled = false;
        draw();
      };
      const stop = progress.on("change", () => {
        if (scheduled) return;
        scheduled = true;
        frame.render(drawOnce);
      });
      cleanups.push(() => {
        stop();
        cancelFrame(drawOnce);
      });
      // A new size (or a page zoom, which changes the pixel ratio too).
      const relayout = () => engine?.layout(measure(), reduced ? 1 : dprFor());
      const observer = new ResizeObserver(relayout);
      observer.observe(canvas);
      cleanups.push(() => observer.disconnect());
      // A new pixel ratio at the same size (the window moved to another
      // screen): the query for the current ratio stops matching; it is then
      // asked again for the new one.
      let resolution: MediaQueryList | null = null;
      const onResolution = () => {
        relayout();
        watchResolution();
      };
      const watchResolution = () => {
        resolution?.removeEventListener("change", onResolution);
        resolution = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
        resolution.addEventListener("change", onResolution);
      };
      watchResolution();
      cleanups.push(() => resolution?.removeEventListener("change", onResolution));
      const onForced = () => forced.matches && giveUp();
      forced.addEventListener("change", onForced);
      cleanups.push(() => forced.removeEventListener("change", onForced));

      // Over the CSS phone, which the stage then hides.
      stage.dataset.gl = "ready";
      const fade = animate(canvas, { opacity: [0, 1] }, { duration: DUR.swap, ease: EASE_OUT });
      cleanups.push(() => fade.stop());
    };

    // Fetch the phone on the visitor's approach, never at load: after a
    // scroll that leaves the story within a screen of the window (or on
    // arriving mid-page, already that close), once the page has loaded and
    // the browser is idle.
    const whenIdle = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => void start(), { timeout: 1500 });
      else raf = requestAnimationFrame(() => void start());
    };
    const near = () => {
      const { top, bottom } = track.getBoundingClientRect();
      return top < window.innerHeight * 2 && bottom > -window.innerHeight;
    };
    const approach = () => {
      if (!near()) return;
      window.removeEventListener("scroll", approach);
      if (document.readyState === "complete") whenIdle();
      else window.addEventListener("load", whenIdle, { once: true });
    };
    window.addEventListener("scroll", approach, { passive: true });
    if (window.scrollY > 0) approach();

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", approach);
      window.removeEventListener("load", whenIdle);
      if (idle) window.cancelIdleCallback(idle);
      if (raf) cancelAnimationFrame(raf);
      if (sampleRaf) cancelAnimationFrame(sampleRaf);
      if (restRaf) cancelAnimationFrame(restRaf);
      cleanups.forEach((cleanup) => cleanup());
      engine?.dispose();
      engine = null;
      delete stage.dataset.gl;
    };
  }, [progress, slotRef, stageRef, status, trackRef]);

  if (status === "off") return null;
  return (
    <motion.div
      ref={boxRef}
      className={styles.gl}
      style={{ "--rise": rise } as MotionStyle}
      data-range="false"
      aria-hidden="true"
    >
      <div ref={sizerRef} className={styles.glSizer} />
      <canvas ref={canvasRef} className={styles.glCanvas} aria-hidden="true" />
    </motion.div>
  );
}
