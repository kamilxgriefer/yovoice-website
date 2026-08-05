"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** The hero's visual centerpiece — a "glowing planet" treatment: layered
 * volumetric glow, a slow breathing pulse, idle drift/rotation, and a
 * floating contact shadow beneath it. */
export function CenterLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Volumetric halo — multiple soft rings breathing out of phase */}
      <motion.div
        className="absolute size-[220%] rounded-full bg-[radial-gradient(circle,rgba(192,38,255,.32),transparent_58%)] blur-2xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute size-[150%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.4),transparent_60%)] blur-xl"
        animate={{ scale: [1.05, 0.95, 1.05], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />

      {/* Idle float + micro-rotation wrapper */}
      <motion.div
        className="relative"
        animate={{ y: [0, -8, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Breathing scale pulse on the orb itself */}
        <motion.div
          className="relative flex size-40 items-center justify-center rounded-full border border-fuchsia-200/40 bg-black shadow-[0_0_120px_rgba(192,38,255,.65)] sm:size-48"
          animate={{ scale: [1, 1.035, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Reflected light sweep */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute -left-1/2 -top-1/2 size-full rotate-45 bg-gradient-to-br from-white/[0.12] via-transparent to-transparent" />
          </div>

          <div className="relative size-[78%] overflow-hidden rounded-full bg-black">
            <Image
              src="/logos/yovoice-logo.png"
              alt="YO Voice"
              fill
              sizes="(max-width: 640px) 156px, 187px"
              className="object-contain p-[6%] drop-shadow-[0_0_24px_rgba(232,121,249,.55)]"
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
        className="absolute -bottom-6 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-black/60 blur-xl sm:w-32"
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
