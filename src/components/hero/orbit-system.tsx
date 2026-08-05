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

/** A ring whose brightness sweeps around its circumference (conic-gradient)
 * rather than a single flat border color — the difference between a "CSS
 * circle" and a light-catching motion-graphics ring. `thickness` is in px;
 * the radial-gradient mask cuts the fill down to just that stroke width. */
function GradientRing({
  inset,
  thickness = 1,
  colorStops,
  duration,
  reverse,
  blur,
}: {
  inset: string;
  thickness?: number;
  colorStops: string;
  duration: number;
  reverse?: boolean;
  blur?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        inset,
        filter: blur ? `blur(${blur}px)` : undefined,
        background: `conic-gradient(from 0deg, ${colorStops})`,
        WebkitMaskImage: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), #000 calc(100% - ${thickness}px))`,
        maskImage: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), #000 calc(100% - ${thickness}px))`,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  );
}

/** Premium multi-layer orbit rings: gradient-sweep strokes (not flat CSS
 * borders), varied thickness/blur for depth, independent rotation speeds
 * and directions, glowing traveling markers, and a background/foreground
 * split so avatars read as sitting "within" the system. */
export function OrbitSystem() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Furthest, softest ring — depth via blur, breathes in sync with the
          center logo's pulse (same 3.4s cadence) so the whole system reads
          as illuminated by it rather than as separate static shapes.
          Hidden on mobile — decorative-only, mobile stays focused. */}
      <motion.div
        className="absolute inset-0 hidden sm:block"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <GradientRing
          inset="0"
          thickness={1.5}
          blur={2}
          duration={130}
          colorStops="rgba(240,171,252,.22) 0deg, transparent 40deg, transparent 140deg, rgba(139,92,246,.18) 180deg, transparent 220deg, transparent 320deg, rgba(240,171,252,.22) 360deg"
        />
      </motion.div>

      {/* Background layer — behind avatars/logo */}
      <GradientRing
        inset="4%"
        thickness={1}
        duration={110}
        colorStops="rgba(240,171,252,.16) 0deg, rgba(139,92,246,.05) 90deg, rgba(240,171,252,.16) 180deg, rgba(139,92,246,.05) 270deg, rgba(240,171,252,.16) 360deg"
      />
      <div className="absolute inset-[15%] hidden rounded-full sm:block" style={{ border: "1px dashed rgba(240,171,252,0.13)" }} />
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <GradientRing
          inset="26%"
          thickness={2.5}
          blur={0.5}
          duration={55}
          reverse
          colorStops="rgba(216,180,254,.32) 0deg, rgba(139,92,246,.06) 100deg, rgba(216,180,254,.32) 180deg, rgba(139,92,246,.06) 280deg, rgba(216,180,254,.32) 360deg"
        />
      </motion.div>

      {/* Segmented ring — broken arcs with gaps, so it reads as a premium
          "instrument dial" rather than a full circle */}
      <motion.div
        className="absolute inset-[9%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(240,171,252,.5) 0deg 70deg, transparent 70deg 90deg, rgba(56,189,248,.35) 90deg 160deg, transparent 160deg 180deg, rgba(240,171,252,.5) 180deg 250deg, transparent 250deg 270deg, rgba(139,92,246,.4) 270deg 340deg, transparent 340deg 360deg)",
          filter: "blur(0.3px)",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
          maskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
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
