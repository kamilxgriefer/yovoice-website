"use client";

import { motion } from "framer-motion";

/** A marker dot that travels around a ring by living inside a rotating
 * container positioned at the ring's edge — no per-frame trig needed.
 * `radiusPercent` is a percentage of the orbit container's width, so the
 * orbit scales correctly across the responsive container sizes instead of
 * markers landing outside a smaller mobile container. */
function OrbitMarker({
  radiusPercent,
  duration,
  reverse,
  delay = 0,
  color = "#f0abfc",
  size = 6,
}: {
  radiusPercent: number;
  duration: number;
  reverse?: boolean;
  delay?: number;
  color?: string;
  size?: number;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 size-0"
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          left: `${radiusPercent}%`,
          top: -size / 2,
          background: color,
          boxShadow: `0 0 ${size * 2.2}px ${size / 1.6}px ${color}`,
        }}
      />
    </motion.div>
  );
}

/** Premium multi-layer orbit rings: varied thickness/opacity/style,
 * independent rotation speeds and directions, glowing traveling markers,
 * and a background/foreground split so avatars read as sitting "within"
 * the system rather than on top of a flat circle. */
export function OrbitSystem() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Furthest, softest ring — depth via blur, breathes in sync with the
          center logo's pulse (same 3.4s cadence) so the whole system reads
          as "illuminated" by it rather than as separate static shapes.
          Hidden on mobile: decorative-only, and mobile should feel focused
          rather than scaled-down-and-cluttered. */}
      <motion.div
        className="absolute inset-0 hidden rounded-full border border-fuchsia-300/10 blur-[1.5px] sm:block"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Background layer — behind avatars/logo */}
      <div className="absolute inset-[4%] rounded-full border border-fuchsia-300/[0.08]" />
      <motion.div
        className="absolute inset-[15%] hidden rounded-full sm:block"
        style={{ border: "1px dashed rgba(240,171,252,0.13)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[26%] rounded-full border-2 border-violet-300/[0.09]"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />

      {/* Segmented ring — built from four arcs with gaps, via conic-gradient
          mask, so it reads as "broken" rather than a full circle */}
      <motion.div
        className="absolute inset-[9%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(240,171,252,.42) 0deg 70deg, transparent 70deg 90deg, rgba(240,171,252,.42) 90deg 160deg, transparent 160deg 180deg, rgba(240,171,252,.42) 180deg 250deg, transparent 250deg 270deg, rgba(240,171,252,.42) 270deg 340deg, transparent 340deg 360deg)",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
          maskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      />

      {/* Traveling glow markers — radii as % of container width, so they
          stay correctly placed at every responsive size */}
      <OrbitMarker radiusPercent={24} duration={26} color="#f0abfc" size={5} />
      <OrbitMarker radiusPercent={24} duration={26} color="#f0abfc" size={5} delay={13} />
      <OrbitMarker radiusPercent={17} duration={19} reverse color="#a78bfa" size={4} />
      <div className="hidden sm:block">
        <OrbitMarker radiusPercent={31} duration={38} color="#38bdf8" size={4} delay={6} />
      </div>
    </div>
  );
}
