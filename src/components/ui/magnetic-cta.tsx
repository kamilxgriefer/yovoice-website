"use client";

import { useRef, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

import { EASE_OUT } from "@/components/animations/cinema";
import { cn } from "@/lib/utils/cn";

const press = { type: "spring" as const, stiffness: 400, damping: 22 };
const follow = { stiffness: 200, damping: 18, mass: 0.4 };

/**
 * A primary action with the hero's physical response, for the homepage's
 * other primary actions (2026-09-27): it leans a little toward the pointer,
 * lifts 2px on hover, presses in, and gives off one voice ring each time the
 * pointer arrives — the story's ring, once, never a loop.
 *
 * The lift and the lean are separate values added together, so the button
 * rests 2px up wherever the pointer is and leans from there; the ring grows
 * the same distance on every side (its outline moves outward, a paint-only
 * change on one small element, once per arrival).
 *
 * Pointer only: nothing moves for touch, keyboard or reduced motion, and the
 * wrapper stays out of the Tab order (the link inside is the control; a
 * `whileTap` wrapper would otherwise get tabindex="0").
 */
export function MagneticCta({
  href,
  children,
  className,
  wrapperClassName,
  strength = 0.24,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, follow);
  const springY = useSpring(y, follow);
  // 2px up while the pointer is over it, back down while pressed.
  const lift = useSpring(0, press);
  const shiftY = useTransform(() => springY.get() + lift.get());
  const ring = useRef<HTMLSpanElement>(null);
  // Known before the first hover, so the first one already leans and lifts.
  const fine = useSyncExternalStore(subscribeFine, fineSnapshot, () => false);

  const moves = fine && !reduce;

  return (
    <motion.div
      className={cn("relative inline-flex", wrapperClassName)}
      style={{ x: springX, y: shiftY }}
      whileTap={moves ? { scale: 0.98 } : undefined}
      transition={press}
      tabIndex={-1}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch" || !moves) return;
        lift.set(-2);
        if (event.pointerType !== "mouse" || !ring.current) return;
        animate(
          ring.current,
          { opacity: [0.7, 0], outlineOffset: ["0px", "10px"] },
          { duration: 0.6, ease: EASE_OUT },
        );
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch" && moves) lift.set(0);
      }}
      onPointerUp={(event) => {
        if (event.pointerType !== "touch" && moves) lift.set(-2);
      }}
      onPointerMove={(event) => {
        if (!moves) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const clamp = (value: number) => Math.max(-6, Math.min(6, value));
        x.set(clamp((event.clientX - rect.left - rect.width / 2) * strength * 0.75));
        y.set(clamp((event.clientY - rect.top - rect.height / 2) * strength * 0.75));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
        lift.set(0);
      }}
    >
      <span
        ref={ring}
        className="pointer-events-none absolute inset-0 rounded-[var(--radius-field)] opacity-0 outline-[length:1.5px] outline-offset-0 outline-[color:var(--accent)] outline-solid forced-colors:hidden"
        aria-hidden="true"
      />
      <Link href={href} className={cn("premium-button focus-ring", className)}>
        {children}
      </Link>
    </motion.div>
  );
}

const FINE_QUERY = "(hover: hover) and (pointer: fine)";
function subscribeFine(onChange: () => void) {
  const query = window.matchMedia(FINE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const fineSnapshot = () => window.matchMedia(FINE_QUERY).matches;
