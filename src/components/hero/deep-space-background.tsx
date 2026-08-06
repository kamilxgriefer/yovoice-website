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

/** Deliberately sparse — ~40 stars, not 200. Every additional simultaneously
 * -animating layer is a real cost during scroll (the previous version's
 * density, plus a mousemove-driven blurred cursor light, was the actual
 * cause of visible shimmer while scrolling: too many independently
 * repainting/blurred layers for the compositor to keep up with). */
const stars: Star[] = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: (i * 47.3 + 5) % 100,
  top: (i * 71.1 + 9) % 100,
  size: i % 9 === 0 ? 2.2 : i % 4 === 0 ? 1.6 : 1,
  opacity: 0.2 + ((i * 23) % 55) / 100,
  duration: 4 + ((i * 11) % 8) * 0.5,
  delay: ((i * 17) % 10) * 0.3,
}));

const dust = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  left: (i * 53.7 + 12) % 100,
  top: (i * 61.3 + 8) % 100,
  size: 3 + (i % 3) * 2,
  duration: 20 + (i % 4) * 5,
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(124,58,237,.14),transparent_58%)]" />

      {/* One nebula wisp — static position, only opacity breathes, very
          slowly. No layout/size animation, no per-frame movement. */}
      <motion.div
        className="absolute left-1/2 top-[28%] size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.1),transparent_60%)] blur-3xl"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sparse starfield */}
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ opacity: [s.opacity, Math.min(s.opacity + 0.45, 1), s.opacity] }}
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
