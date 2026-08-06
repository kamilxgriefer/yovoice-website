"use client";

import { motion } from "framer-motion";

type Star = {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

/** Almost invisible on purpose — if the background is the first thing a
 * visitor notices, it's too strong. ~28 stars at low opacity, a handful of
 * dust motes, one very soft nebula wisp. Every layer is a plain CSS
 * animation on opacity/transform, never scroll-linked, so the compositor
 * runs it independently of scroll and layout entirely. */
const stars: Star[] = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: (i * 47.3 + 5) % 100,
  top: (i * 71.1 + 9) % 100,
  size: i % 9 === 0 ? 1.8 : i % 4 === 0 ? 1.3 : 1,
  opacity: 0.12 + ((i * 23) % 45) / 100,
  duration: 4 + ((i * 11) % 8) * 0.5,
  delay: ((i * 17) % 10) * 0.3,
}));

const dust = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: (i * 53.7 + 12) % 100,
  top: (i * 61.3 + 8) % 100,
  size: 3 + (i % 3) * 2,
  duration: 22 + (i % 4) * 5,
  delay: (i % 5) * 1.6,
}));

/** A calm, mostly-static space backdrop: one soft nebula wisp, a sparse
 * starfield, a few drifting dust motes. No canvas, no scroll-linked
 * transforms, no per-frame JS — everything is a plain CSS animation on
 * opacity/transform so the compositor can run it independently of scroll
 * and layout entirely. */
export function DeepSpaceBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base void + one soft directional gradient — the "deep space
          gradient" the brief asks for, nothing more elaborate. */}
      <div className="absolute inset-0 bg-[#050311]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(124,58,237,.09),transparent_58%)]" />

      {/* One nebula wisp — static position, only opacity breathes, very
          slowly. No layout/size animation, no per-frame movement. */}
      <motion.div
        className="absolute left-1/2 top-[28%] size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.07),transparent_60%)] blur-3xl"
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sparse starfield */}
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ opacity: [s.opacity, Math.min(s.opacity + 0.3, 0.85), s.opacity] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* A few soft, slow dust motes */}
      {dust.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-fuchsia-100/[0.05]"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -14, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Vignette to keep focus on center content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(4,2,16,.5)_100%)]" />
    </div>
  );
}
