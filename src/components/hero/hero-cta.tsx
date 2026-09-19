"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";

const spring = { type: "spring" as const, stiffness: 400, damping: 22 };
const magneticSpring = { type: "spring" as const, stiffness: 200, damping: 18, mass: 0.4 };

/** Shared magnetic-hover behavior: the button nudges toward the cursor
 * while it's within the element's own bounds, and springs back to rest
 * the moment the pointer leaves — a small, physical-feeling pull rather
 * than a fixed hover state. Capped so it never drifts far enough to feel
 * like the target moved out from under the pointer. */
function useMagnetic(strength = 0.35) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, magneticSpring);
  const springY = useSpring(y, magneticSpring);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }
  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { style: { x: springX, y: springY }, onMouseMove, onMouseLeave };
}

/**
 * The hero used to carry a second button system of its own — a gradient
 * border layer, a gradient fill, a glass top highlight and a sweeping
 * sheen — which meant the first control a visitor met looked like nothing
 * else on the site. The motion is what made it feel alive, so the motion
 * stays; the paint now comes from the global `.premium-button` pair, which
 * is unlayered and therefore already carries the height, radius, weight and
 * colour. These components are only the spring wrapper around it.
 */
export function HeroPrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  const magnetic = useMagnetic(0.24);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      style={magnetic.style}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={spring}
      className="w-full sm:w-auto"
    >
      <Link
        href={href}
        className="premium-button focus-ring w-full whitespace-nowrap sm:w-auto"
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function HeroSecondaryCta({ href, children }: { href: string; children: ReactNode }) {
  const magnetic = useMagnetic(0.2);

  return (
    <motion.div
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      style={magnetic.style}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={spring}
      className="w-full sm:w-auto"
    >
      <Link
        href={href}
        className="premium-button-secondary focus-ring w-full whitespace-nowrap sm:w-auto"
      >
        {children}
      </Link>
    </motion.div>
  );
}
