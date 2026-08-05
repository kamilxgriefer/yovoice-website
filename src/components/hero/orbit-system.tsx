"use client";

import { motion } from "framer-motion";

/** A marker dot that travels around a ring by living inside a rotating
 * container positioned at the ring's edge — no per-frame trig needed. */
function OrbitMarker({
  radius,
  duration,
  reverse,
  delay = 0,
  color = "#f0abfc",
  size = 6,
}: {
  radius: number;
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
          left: radius,
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
      {/* Background layer — behind avatars/logo */}
      <div className="absolute inset-[4%] rounded-full border border-fuchsia-300/[0.09]" />
      <motion.div
        className="absolute inset-[15%] rounded-full"
        style={{ border: "1px dashed rgba(240,171,252,0.14)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-[26%] rounded-full border-2 border-violet-300/[0.1]" />

      {/* Segmented ring — built from four arcs with gaps, via conic-gradient
          mask, so it reads as "broken" rather than a full circle */}
      <motion.div
        className="absolute inset-[9%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(240,171,252,.5) 0deg 70deg, transparent 70deg 90deg, rgba(240,171,252,.5) 90deg 160deg, transparent 160deg 180deg, rgba(240,171,252,.5) 180deg 250deg, transparent 250deg 270deg, rgba(240,171,252,.5) 270deg 340deg, transparent 340deg 360deg)",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
          maskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Traveling glow markers at a few different radii/speeds */}
      <OrbitMarker radius={158} duration={22} color="#f0abfc" size={5} />
      <OrbitMarker radius={158} duration={22} color="#f0abfc" size={5} delay={11} />
      <OrbitMarker radius={112} duration={16} reverse color="#a78bfa" size={4} />
      <OrbitMarker radius={205} duration={34} color="#38bdf8" size={4} delay={5} />
    </div>
  );
}
