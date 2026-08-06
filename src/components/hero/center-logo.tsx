"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** The hero's centerpiece — "the heart of the community." The logo floats
 * free in space on its own transparent artwork (no disc/badge container
 * anymore) inside a layered energy core: volumetric rays, atmospheric fog,
 * multiple breathing halos, a lens-bloom flare, tiny orbiting particles and
 * energy sparks. Every layer around it moves; the mark itself never
 * rotates and is never blurred — only translate/scale/opacity, so it stays
 * perfectly sharp and GPU-cheap at 60fps. */

const PULSE = 4.6; // shared breathing cadence — everything "powered by" the
// logo (halos, rings elsewhere in OrbitSystem) is tuned to this same beat.

export function CenterLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Atmospheric fog — the widest, softest, slowest layer. Reads as
          haze the logo sits inside rather than a light it emits. */}
      <motion.div
        className="absolute size-[420%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.16),transparent_60%)] blur-[80px]"
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: PULSE * 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Volumetric light rays — slow-rotating conic spokes, heavily
          blurred so they read as atmospheric light, not a shape. This is
          the light the rays cast, not the logo, so rotation here is fine. */}
      <motion.div
        className="absolute size-[340%] opacity-40 blur-2xl"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(232,121,249,.5) 4deg, transparent 14deg, transparent 46deg, rgba(139,92,246,.4) 50deg, transparent 60deg, transparent 106deg, rgba(232,121,249,.45) 110deg, transparent 120deg, transparent 196deg, rgba(139,92,246,.4) 200deg, transparent 210deg, transparent 286deg, rgba(232,121,249,.4) 290deg, transparent 300deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />

      {/* Volumetric halo — multiple soft layers breathing in the same
          PULSE cadence as the logo's own scale, so the whole core reads as
          one light source rather than independently-lit shapes. */}
      <motion.div
        className="absolute size-[280%] rounded-full bg-[radial-gradient(circle,rgba(192,38,255,.36),transparent_55%)] blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.92, 0.55] }}
        transition={{ duration: PULSE, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute size-[190%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.44),transparent_58%)] blur-2xl"
        animate={{ scale: [1.04, 0.96, 1.04], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: PULSE, repeat: Infinity, ease: "easeInOut", delay: PULSE * 0.15 }}
      />
      <motion.div
        className="absolute size-[135%] rounded-full bg-[radial-gradient(circle,rgba(240,171,252,.4),transparent_62%)] blur-xl"
        animate={{ scale: [0.97, 1.05, 0.97], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: PULSE, repeat: Infinity, ease: "easeInOut", delay: PULSE * 0.05 }}
      />

      {/* Lens bloom — a small, bright, tight flare at the core's center,
          distinct from the wide halos: this is what sells "energy source"
          rather than "colored light." Pulses slightly ahead of the main
          beat, like a flash preceding the swell. */}
      <motion.div
        className="absolute size-[38%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.9),rgba(240,171,252,.5)_40%,transparent_72%)] blur-md mix-blend-screen"
        animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.9, 1.08, 0.9] }}
        transition={{ duration: PULSE, repeat: Infinity, ease: "easeInOut", delay: PULSE * 0.08 }}
      />

      {/* Tiny particles orbiting close to the core — distinct from the
          scene-wide embers/dust in DeepSpaceBackground, these belong to
          the logo itself. Position is a plain static inline style on a
          non-motion element (server/client always agree on a fixed
          number); only the inner motion.span animates opacity/scale/y —
          keeping framer-motion's style normalization away from values
          that must match exactly at hydration time. */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * 360;
        const radius = 62 + (i % 2) * 14;
        const left = Math.round((50 + (radius * Math.cos((angle * Math.PI) / 180)) / 3) * 100) / 100;
        const top = Math.round((50 + (radius * Math.sin((angle * Math.PI) / 180)) / 3) * 100) / 100;
        return (
          <div key={i} className="absolute size-[3px]" style={{ left: `${left}%`, top: `${top}%` }}>
            <motion.span
              className="absolute size-[3px] rounded-full bg-fuchsia-100 shadow-[0_0_6px_1.5px_rgba(240,171,252,0.8)]"
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.3, 0.6], y: [0, -10, 0] }}
              transition={{ duration: 3.4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
            />
          </div>
        );
      })}

      {/* Energy sparks — quick, brief flashes right at the core's edge,
          rarer and sharper than the particles above. Same static-position
          + animated-child split as the particles above. */}
      {[0, 1, 2].map((i) => {
        const angle = 40 + i * 130;
        const radius = 46;
        const left = Math.round((50 + (radius * Math.cos((angle * Math.PI) / 180)) / 2.4) * 100) / 100;
        const top = Math.round((50 + (radius * Math.sin((angle * Math.PI) / 180)) / 2.4) * 100) / 100;
        return (
          <div key={`spark-${i}`} className="absolute size-1" style={{ left: `${left}%`, top: `${top}%` }}>
            <motion.span
              className="absolute size-1 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.9)]"
              animate={{ opacity: [0, 0, 1, 0], scale: [0.4, 0.4, 1.6, 0.4] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 1.4 + i * 1.1,
                times: [0, 0.85, 0.93, 1],
              }}
            />
          </div>
        );
      })}

      {/* The mark itself — never rotates, never blurred. Only a gentle
          idle drift (translate) and the shared breathing scale. */}
      <motion.div
        className="relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="relative flex size-40 items-center justify-center sm:size-64 lg:size-80"
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: PULSE, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/logos/yovoice-mark-glow.png"
            alt="YO Voice"
            fill
            sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 400px"
            className="object-contain drop-shadow-[0_0_46px_rgba(232,121,249,.55)]"
            priority
            quality={100}
          />

          {/* Expanding pulse rings — the "energy release" on each breath */}
          <motion.span
            className="absolute inset-[6%] rounded-full border border-fuchsia-300/25"
            animate={{ scale: [0.9, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: PULSE * 0.65, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-[6%] rounded-full border border-violet-300/20"
            animate={{ scale: [0.9, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: PULSE * 0.65, repeat: Infinity, ease: "easeOut", delay: PULSE * 0.22 }}
          />
        </motion.div>
      </motion.div>

      {/* Floating contact shadow — the "it's hovering" cue */}
      <motion.div
        className="absolute -bottom-4 left-1/2 h-5 w-32 -translate-x-1/2 rounded-full bg-black/50 blur-xl sm:w-44"
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.45, 0.28, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
