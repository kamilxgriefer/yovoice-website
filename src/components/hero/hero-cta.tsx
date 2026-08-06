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

export function HeroPrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  const magnetic = useMagnetic(0.28);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      style={magnetic.style}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={spring}
      className="group relative isolate"
    >
      {/* Rotating gradient border glow — clipped to the button's own footprint
          so the (oversized, so rotation never reveals a gap) gradient layer
          underneath can never sweep out past the edges as it spins. */}
      <div className="absolute -inset-[2px] overflow-hidden rounded-2xl">
        <motion.div
          className="absolute inset-[-60%] opacity-70 blur-[3px] transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "conic-gradient(from 0deg, #7c3aed, #e879f9, #f0abfc, #7c3aed)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <Link
        href={href}
        className="focus-ring relative flex min-h-14 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-fuchsia-400 px-8 text-[15px] font-bold text-white shadow-[0_18px_50px_rgba(192,38,255,.4)]"
      >
        {/* Glass top highlight */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.24] to-transparent" />
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        <span className="relative flex items-center gap-2.5">{children}</span>
      </Link>
    </motion.div>
  );
}

export function HeroSecondaryCta({ href, children }: { href: string; children: ReactNode }) {
  const magnetic = useMagnetic(0.24);

  return (
    <motion.div
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      style={magnetic.style}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={spring}
    >
      <Link
        href={href}
        className="focus-ring group relative flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.05] px-8 text-[15px] font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.09]"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.1] to-transparent" />
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        <span className="relative flex items-center gap-3">{children}</span>
      </Link>
    </motion.div>
  );
}
