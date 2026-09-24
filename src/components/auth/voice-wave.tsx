"use client";

import { useLayoutEffect, useMemo, useRef } from "react";

import { waveformHeights } from "@/lib/auth/auth-mode";
import { cn } from "@/lib/utils/cn";
import { prefersReducedMotion } from "@/components/auth/auth-mode-motion";

/**
 * The sound of the current title: one bar per column, heights taken from the
 * phrase's loudness envelope.
 *
 * When the envelope changes, a front travels left to right with the letters
 * of the new title: each bar ducks under the old phrase, springs slightly past
 * its new height and settles. Only `transform` and `opacity` move, so the
 * animation stays on the compositor. Nothing loops — once the front has
 * passed, the waveform is still.
 */
export function VoiceWave({
  envelope,
  bars,
  className,
}: {
  envelope: readonly number[];
  bars: number;
  className?: string;
}) {
  const heights = useMemo(
    () => waveformHeights(envelope, bars, envelope.length * 0.37),
    [envelope, bars],
  );
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef<number[] | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    // First render: already drawn at rest. Later renders: travel from the
    // previous phrase's shape to this one.
    const from = previous.current;
    previous.current = heights;
    if (!root || !from || prefersReducedMotion()) return;

    const nodes = root.children;
    const sweep = 460;
    heights.forEach((to, i) => {
      const node = nodes[i] as HTMLElement | undefined;
      if (!node) return;
      const start = from[i] ?? 0.04;
      node.getAnimations().forEach((animation) => animation.cancel());
      node.animate(
        [
          { transform: `scaleY(${start})`, opacity: 0.9 },
          { transform: `scaleY(${Math.max(0.05, start * 0.28)})`, opacity: 0.55, offset: 0.32 },
          { transform: `scaleY(${Math.min(1, to * 1.14 + 0.02)})`, opacity: 1, offset: 0.74 },
          { transform: `scaleY(${to})`, opacity: 0.9 },
        ],
        {
          duration: 700,
          delay: 60 + (i / heights.length) * sweep,
          easing: "cubic-bezier(.33,0,.2,1)",
          fill: "backwards",
        },
      );
    });
  }, [heights]);

  return (
    <div ref={ref} aria-hidden="true" className={cn("auth-wave", className)}>
      {heights.map((height, i) => (
        <span key={i} className="auth-wave__bar" style={{ transform: `scaleY(${height})` }} />
      ))}
    </div>
  );
}
