"use client";

import { motion } from "framer-motion";

/** A marker travels around a ring by living inside a rotating zero-size
 * container positioned at the ring's edge. `radiusPercent` is relative to
 * the orbit container's width, so it stays correctly placed across the
 * responsive container sizes. */
function TravelingLight({
  radiusPercent,
  duration,
  reverse,
  delay = 0,
}: {
  radiusPercent: number;
  duration: number;
  reverse?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 size-0"
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
    >
      <div
        className="absolute size-[3px] -translate-y-1/2 rounded-full bg-fuchsia-200/80"
        style={{ left: `${radiusPercent}%`, boxShadow: "0 0 5px 1px rgba(240,171,252,.55)" }}
      />
    </motion.div>
  );
}

/** Two very thin rings, different radius and opacity, plus a couple of
 * small lights slowly traveling along them — "engineered," not decorative.
 * No segmented conic dials, no multi-layer gradient sweeps. Every ring is
 * a plain 1px border; the only per-frame cost is two small rotations. */
export function OrbitSystem() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-[6%] rounded-full"
        style={{ border: "1px solid rgba(240,171,252,0.14)" }}
      />
      <div
        className="absolute inset-[22%] hidden rounded-full sm:block"
        style={{ border: "1px solid rgba(139,92,246,0.1)" }}
      />

      <TravelingLight radiusPercent={44} duration={48} />
      <TravelingLight radiusPercent={28} duration={34} reverse delay={4} />
    </div>
  );
}
