"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** The hero's visual centerpiece — a "glowing planet" treatment: volumetric
 * light rays, layered halo, a slow breathing pulse, idle drift/rotation,
 * rim light and a floating contact shadow. Sized and lit to dominate the
 * composition rather than sit as one element among equals. */
export function CenterLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Volumetric light rays — slow-rotating conic spokes, heavily
          blurred so they read as atmospheric light, not a shape */}
      <motion.div
        className="absolute size-[340%] opacity-40 blur-2xl"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(232,121,249,.5) 4deg, transparent 14deg, transparent 46deg, rgba(139,92,246,.4) 50deg, transparent 60deg, transparent 106deg, rgba(232,121,249,.45) 110deg, transparent 120deg, transparent 196deg, rgba(139,92,246,.4) 200deg, transparent 210deg, transparent 286deg, rgba(232,121,249,.4) 290deg, transparent 300deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {/* Volumetric halo — multiple soft layers breathing out of phase,
          larger and stronger than a simple glow so the logo reads as the
          light source for the whole scene */}
      <motion.div
        className="absolute size-[280%] rounded-full bg-[radial-gradient(circle,rgba(192,38,255,.34),transparent_55%)] blur-3xl"
        animate={{ scale: [1, 1.14, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute size-[190%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.42),transparent_58%)] blur-2xl"
        animate={{ scale: [1.05, 0.95, 1.05], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      <motion.div
        className="absolute size-[130%] rounded-full bg-[radial-gradient(circle,rgba(240,171,252,.35),transparent_62%)] blur-xl"
        animate={{ scale: [0.96, 1.06, 0.96], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />

      {/* Idle float + micro-rotation wrapper */}
      <motion.div
        className="relative"
        animate={{ y: [0, -9, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Breathing scale pulse on the orb itself */}
        <motion.div
          className="relative flex size-28 items-center justify-center rounded-full bg-black shadow-[0_0_100px_30px_rgba(192,38,255,.4)] sm:size-48 sm:shadow-[0_0_160px_50px_rgba(192,38,255,.45)] lg:size-60"
          style={{
            border: "1px solid transparent",
            backgroundImage:
              "linear-gradient(black, black), conic-gradient(from 0deg, rgba(240,171,252,.9), rgba(139,92,246,.5), rgba(240,171,252,.9))",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
          animate={{ scale: [1, 1.035, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Reflected light sweep */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute -left-1/2 -top-1/2 size-full rotate-45 bg-gradient-to-br from-white/[0.14] via-transparent to-transparent" />
          </div>

          <div className="relative size-[78%] overflow-hidden rounded-full bg-black">
            <Image
              src="/logos/yovoice-logo.png"
              alt="YO Voice"
              fill
              sizes="(max-width: 640px) 187px, 234px"
              className="object-contain p-[6%] drop-shadow-[0_0_28px_rgba(232,121,249,.6)]"
              priority
            />
          </div>

          {/* Expanding pulse rings */}
          <motion.span
            className="absolute inset-[-10%] rounded-full border border-fuchsia-300/25"
            animate={{ scale: [0.9, 1.35], opacity: [0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-[-10%] rounded-full border border-violet-300/20"
            animate={{ scale: [0.9, 1.5], opacity: [0.4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
          />
        </motion.div>
      </motion.div>

      {/* Floating contact shadow */}
      <motion.div
        className="absolute -bottom-7 left-1/2 h-5 w-32 -translate-x-1/2 rounded-full bg-black/60 blur-xl sm:w-40"
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
