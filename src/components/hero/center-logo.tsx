"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** The hero's centerpiece — restrained on purpose. Earlier passes piled on
 * rotating light rays, a screen-blended lens flare, energy sparks and
 * expanding pulse rings; all of that read as "gaming HUD," not premium.
 * What's left: one soft wide halo, one tighter bloom, a slow breathing
 * scale, and two or three quiet particles. The mark itself only ever
 * translates/scales — never rotates, never blurred. */

const PULSE = 4.6;

export function CenterLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Wide, soft halo — the "large radial light," not a glow explosion */}
      <motion.div
        className="absolute size-[260%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.22),transparent_60%)] blur-3xl"
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: PULSE, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Tighter bloom, breathing on the same beat as the mark's own scale */}
      <motion.div
        className="absolute size-[150%] rounded-full bg-[radial-gradient(circle,rgba(232,121,249,.28),transparent_62%)] blur-2xl"
        animate={{ scale: [0.97, 1.05, 0.97], opacity: [0.65, 0.95, 0.65] }}
        transition={{ duration: PULSE, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Two or three quiet particles — slow, soft, never sparkling */}
      {[0, 1].map((i) => {
        const angle = i === 0 ? 205 : 35;
        const radius = 58;
        const left = 50 + (radius * Math.cos((angle * Math.PI) / 180)) / 3;
        const top = 50 + (radius * Math.sin((angle * Math.PI) / 180)) / 3;
        return (
          <div key={i} className="absolute size-1" style={{ left: `${left}%`, top: `${top}%` }}>
            <motion.span
              className="absolute size-1 rounded-full bg-fuchsia-100/70"
              animate={{ opacity: [0.15, 0.6, 0.15], y: [0, -8, 0] }}
              transition={{ duration: 6 + i * 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 }}
            />
          </div>
        );
      })}

      {/* The mark — gentle idle drift (translate only), never rotates */}
      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="relative flex size-36 items-center justify-center sm:size-56 lg:size-72"
          animate={{ scale: [0.99, 1.015, 0.99] }}
          transition={{ duration: PULSE, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/logos/yovoice-mark-glow.png"
            alt="YO Voice"
            fill
            sizes="(max-width: 640px) 210px, (max-width: 1024px) 280px, 350px"
            className="object-contain drop-shadow-[0_0_32px_rgba(232,121,249,.4)]"
            priority
            quality={100}
          />
        </motion.div>
      </motion.div>

      {/* Floating contact shadow */}
      <motion.div
        className="absolute -bottom-3 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-black/40 blur-lg sm:w-36"
        animate={{ opacity: [0.4, 0.25, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
