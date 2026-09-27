"use client";

import { useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import { useSceneProgress } from "@/components/animations/cinema";
import styles from "@/components/servers/servers-welcome-cinema.module.css";
import {
  SERVERS_INTRO,
  ServersHeadingWords,
  WORKSPACE_CAPTION,
  WorkspaceCapture,
} from "@/components/servers/servers-welcome-parts";

/**
 * The left column of the Servers deck: the heading, the sentence and the
 * Channels sheet.
 *
 * On a wide screen with room to spare, the whole column holds still beside
 * the deck, and the sheet takes what the column has left under the sentence.
 * On a short wide window — a 1280 × 720 laptop — that would leave the sheet a
 * thumbnail, so the column decides against it: when the sheet would come out
 * smaller than `SHEET_FLOOR_REM`, the heading and the sentence scroll on with
 * the page and the sheet alone holds still, centred beside the deck, at a
 * size its screen can be read at. On a phone the heading and the sheet come
 * first and the deck follows.
 *
 * No `Reveal` here: the heading is drawn at rest, so it can never still be
 * on its way in while the first card beside it is already there.
 */
export function ServersAside({ landed, wide }: { landed: MotionValue<number>; wide: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useSheetFit(ref);

  return (
    <div ref={ref} className={styles.aside}>
      <div className={styles.intro} data-sheet-intro="">
        <p className="eyebrow">Servers</p>
        <h2 id="servers-welcome-heading" className={styles.title}>
          <ServersHeadingWords accentClassName="lg:block" />
        </h2>
        <p className="mt-5 max-w-[34rem] text-base leading-[1.6] text-[var(--text-secondary)]">
          {SERVERS_INTRO}
        </p>
      </div>

      <WorkspaceSheet landed={landed} wide={wide} />
    </div>
  );
}

/* ---- Does the sheet fit beside the heading? -------------------------------- */

/**
 * The smallest the sheet is drawn beside the heading, in rem of device
 * height: about 214 px of screen at the default text size, where every row
 * of the Channels sheet still reads (at 145 px, what a 1280 × 720 window
 * used to leave it, it read as a thumbnail). Any less and the sheet holds
 * still on its own instead, at up to 29rem.
 */
const SHEET_FLOOR_REM = 25;

/**
 * Measures, once per layout change (never per scroll step), what the column
 * leaves the sheet under the heading and the sentence, and tells the CSS:
 *
 * - `--intro-h`: the heading and sentence's height, which the sheet's height
 *   is worked out from on a tall window;
 * - `--caption-room`: what the caption takes under the sheet when the column
 *   is too narrow for it to sit beside (0 when it sits beside);
 * - `data-fit`: `"tall"` when the sheet still gets `SHEET_FLOOR_REM` beside
 *   the heading, `"short"` when it should hold still on its own.
 *
 * The room is worked out from the column's own sticky offset and padding and
 * the figure's margin, as the styles resolve them, so the script and the
 * stylesheet cannot disagree about where the sheet goes.
 */
function useSheetFit(ref: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const aside = ref.current;
    const intro = aside?.querySelector<HTMLElement>("[data-sheet-intro]");
    const stage = aside?.querySelector<HTMLElement>("[data-sheet-stage]");
    const caption = aside?.querySelector<HTMLElement>("figcaption");
    const figure = caption?.parentElement;
    if (!aside || !intro || !stage || !caption || !figure) return;

    const wideQuery = window.matchMedia(WIDE_QUERY);
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!wideQuery.matches) {
        delete aside.dataset.fit;
        return;
      }

      const introHeight = intro.offsetHeight;
      const stageBox = stage.getBoundingClientRect();
      const captionBox = caption.getBoundingClientRect();
      const captionRoom =
        captionBox.top >= stageBox.bottom - 0.5 ? Math.ceil(captionBox.bottom - stageBox.bottom) : 0;
      setProperty(aside, "--intro-h", `${introHeight}px`);
      setProperty(aside, "--caption-room", `${captionRoom}px`);

      const column = getComputedStyle(aside);
      const room =
        document.documentElement.clientHeight -
        (parseFloat(column.top) || 0) -
        parseFloat(column.paddingTop) -
        parseFloat(column.paddingBottom) -
        introHeight -
        parseFloat(getComputedStyle(figure).marginTop) -
        captionRoom;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const fit = room >= SHEET_FLOOR_REM * rem ? "tall" : "short";
      if (aside.dataset.fit !== fit) aside.dataset.fit = fit;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();

    const observer = new ResizeObserver(schedule);
    observer.observe(intro);
    observer.observe(caption);
    window.addEventListener("resize", schedule);
    wideQuery.addEventListener("change", schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      wideQuery.removeEventListener("change", schedule);
      if (frame) cancelAnimationFrame(frame);
      aside.style.removeProperty("--intro-h");
      aside.style.removeProperty("--caption-room");
      delete aside.dataset.fit;
    };
  }, [ref]);
}

function setProperty(element: HTMLElement, name: string, value: string) {
  if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
}

/* ---- The Channels sheet ---------------------------------------------------- */

const SLAB_DEPTHS = [3, 6, 9, 12];

/**
 * What the capture is drawn at, including the 1.08 it is scaled up by so it
 * can drift without showing an edge: at most 29rem of device height on a
 * wide screen (250 px of screen, 270 px drawn), and on a phone
 * min(54vw, 15rem) of screen (at most 58.3vw or 260 px drawn).
 */
const SHEET_SIZES = "(min-width: 64rem) 270px, (min-width: 27.75rem) 260px, 59vw";

/**
 * The workspace capture as a device that turns a few degrees. On a wide
 * screen it holds still beside the deck and turns one step with every card
 * that lands; on a phone, where the deck comes after it, it turns as it
 * crosses the window.
 */
function WorkspaceSheet({ landed, wide }: { landed: MotionValue<number>; wide: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const crossing = useSceneProgress(ref, ["start end", "end start"]);
  const turn = useTransform([landed, crossing], ([cards, passing]: number[]) =>
    wide ? cards / 4 : passing,
  );

  const rotateY = useTransform(turn, [0, 1], [-16, 9]);
  const rotateX = useTransform(turn, [0, 1], [7, -3]);
  const drift = useTransform(turn, [0, 1], ["3.5%", "-3.5%"]);
  const sheenX = useTransform(turn, [0, 1], ["-22%", "22%"]);

  return (
    <figure ref={ref} className={styles.figure}>
      <div className={styles.stage} data-sheet-stage="">
        <div className={styles.glow} aria-hidden="true" />
        <motion.div className={styles.device} style={{ rotateX, rotateY }}>
          {SLAB_DEPTHS.map((depth) => (
            <div
              key={depth}
              className={styles.slab}
              style={{ transform: `translateZ(-${depth}px)` }}
              aria-hidden="true"
            />
          ))}
          <div className={styles.body}>
            <div className={styles.screen}>
              <motion.div className={styles.capture} style={{ y: drift, scale: 1.08 }}>
                <WorkspaceCapture sizes={SHEET_SIZES} />
              </motion.div>
              <motion.div className={styles.sheen} style={{ x: sheenX }} aria-hidden="true" />
            </div>
          </div>
        </motion.div>
      </div>
      <figcaption className={styles.caption}>{WORKSPACE_CAPTION}</figcaption>
    </figure>
  );
}

/* ---- Breakpoint ------------------------------------------------------------- */

const WIDE_QUERY = "(min-width: 64rem)";

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True at the `lg` breakpoint, where the deck sits beside the column. */
export function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}
