"use client";

import { useMemo, useRef, type RefObject } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import { useCinema, useSceneProgress } from "@/components/animations/cinema";
import { waveformHeights } from "@/lib/auth/auth-mode";
import { cn } from "@/lib/utils/cn";

/**
 * A hand-authored loudness contour of "Stop scrolling. Start talking." — the
 * hero's own line — used only for the shape of the bars, like the auth
 * switch's waveform.
 */
export const TALK_ENVELOPE = [
  0.34, 0.92, 1, 0.7, 0.48, 0.86, 0.96, 0.58, 0.16, 0.1, 0.82, 1, 0.74, 0.9, 0.56, 0.4, 0.97, 0.72,
  0.22, 0.08,
] as const;

/**
 * The page's voice: a waveform that speaks while you scroll.
 *
 * As it crosses the viewport a front runs left to right and each bar rises to
 * its height; after that every scroll step moves the bars a little, like a
 * level meter, and they hold still the moment scrolling stops. Nothing loops
 * and nothing moves on its own. Decorative, so hidden from assistive
 * technology; without the cinema it is drawn at rest.
 */
export function ScrollWave({
  bars = 56,
  envelope = TALK_ENVELOPE,
  className,
}: {
  bars?: number;
  envelope?: readonly number[];
  className?: string;
}) {
  const cinema = useCinema();
  const ref = useRef<HTMLDivElement>(null);
  const heights = useMemo(() => waveformHeights(envelope, bars, 1.3), [envelope, bars]);

  return (
    <div ref={ref} className={cn("relative flex h-16 items-end", className)} aria-hidden="true">
      {cinema ? (
        <ScrubbedBars target={ref} heights={heights} />
      ) : (
        heights.map((height, index) => (
          <span key={index} className={BAR} style={{ transform: `scaleY(${height})` }} />
        ))
      )}
    </div>
  );
}

const BAR =
  "h-full flex-1 origin-bottom rounded-t-[3px] bg-[linear-gradient(180deg,var(--accent),var(--primary))] opacity-90 mx-[min(1.5px,.53%)]";

function ScrubbedBars({
  target,
  heights,
}: {
  target: RefObject<HTMLDivElement | null>;
  heights: number[];
}) {
  const progress = useSceneProgress(target, ["start end", "end start"]);
  return (
    <>
      {heights.map((height, index) => (
        <Bar
          key={index}
          progress={progress}
          height={height}
          index={index}
          count={heights.length}
        />
      ))}
    </>
  );
}

function Bar({
  progress,
  height,
  index,
  count,
}: {
  progress: MotionValue<number>;
  height: number;
  index: number;
  count: number;
}) {
  // The front reaches this bar at `start` and it is fully up 0.22 later.
  const start = 0.08 + (index / count) * 0.3;
  const scaleY = useTransform(progress, (p) => {
    const arrival = Math.min(1, Math.max(0, (p - start) / 0.22));
    const level = 0.72 + 0.28 * Math.abs(Math.sin(p * 31 + index * 0.9));
    return Math.max(0.05, height * arrival * level);
  });
  return <motion.span className={BAR} style={{ scaleY }} />;
}
