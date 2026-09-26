"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { animate, motion, useMotionValue, type AnimationPlaybackControls } from "framer-motion";

import { EASE_OUT, useCinema } from "@/components/animations/cinema";

const ELEMENTS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  figure: motion.figure,
} as const;

/**
 * Rises into place the first time it scrolls into view.
 *
 * A triggered entrance, not a scrubbed one: text inside is never left
 * half-faded where a visitor happened to stop scrolling. The server render,
 * reduced motion and the no-cinema layouts all draw it at rest, and when the
 * cinema arms after hydration only what is still below the fold is hidden,
 * so nothing already on screen blinks out and back in.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 36,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Seconds; stagger siblings with `index * 0.08`. */
  delay?: number;
  /** How far below its place it starts, in px. */
  distance?: number;
  as?: keyof typeof ELEMENTS;
}) {
  const cinema = useCinema();
  const ref = useRef<HTMLElement>(null);
  const opacity = useMotionValue(1);
  const y = useMotionValue(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!cinema || !node) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    opacity.set(0);
    y.set(distance);
    let running: AnimationPlaybackControls[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        running = [
          animate(opacity, 1, { duration: 0.7, delay, ease: EASE_OUT }),
          animate(y, 0, { duration: 0.95, delay, ease: EASE_OUT }),
        ];
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      running.forEach((animation) => animation.stop());
      opacity.set(1);
      y.set(0);
    };
  }, [cinema, delay, distance, opacity, y]);

  const Element = ELEMENTS[as];
  return (
    <Element
      // The union of motion components cannot agree on one ref type.
      ref={ref as never}
      className={className}
      style={{ opacity, y }}
    >
      {children}
    </Element>
  );
}
