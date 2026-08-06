"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Depth = "near" | "mid" | "far";

const depthStyle: Record<Depth, { opacity: number; blur: string }> = {
  near: { opacity: 1, blur: "" },
  mid: { opacity: 0.9, blur: "" },
  far: { opacity: 0.72, blur: "blur-[0.5px]" },
};

/** A clean circle — nothing more. No role tag underneath (HOST/SPEAKER/
 * LISTENER reads as admin-panel classification, not a person) — just a
 * first name, the way you'd recognize someone in a room. One shared,
 * neutral rim light sits behind every avatar (the scene's single
 * consistent light source); each person's accent color is only a faint
 * hint at rest, and only becomes a real colored glow while they're
 * actually speaking — fewer independent light sources, not more. `depth`
 * (near/mid/far) drives opacity and a touch of blur so the eye reads
 * distance from the center, not a flat ring of equal objects. `tiltBias`
 * is a small constant rotation biasing the avatar's idle motion toward
 * the logo, so it reads as connected rather than independently floating. */
export function PremiumAvatar({
  src,
  name,
  ringColor,
  active,
  depth = "mid",
  tiltBias = 0,
  floatDelay = 0,
  size = 72,
}: {
  src: string;
  name: string;
  ringColor: string;
  active: boolean;
  depth?: Depth;
  tiltBias?: number;
  floatDelay?: number;
  size?: number;
}) {
  const d = depthStyle[depth];

  return (
    <motion.div
      className={`flex flex-col items-center ${d.blur}`}
      style={{ opacity: d.opacity }}
      animate={{ y: [0, -7, 0], rotate: [tiltBias * 0.4, tiltBias, tiltBias * 0.4] }}
      transition={{ duration: 6.5 + floatDelay * 0.4, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.5 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Shared neutral rim light — every avatar's true light source */}
        <motion.div
          className="absolute inset-[-48%] rounded-full bg-[radial-gradient(circle,rgba(199,180,255,.16),transparent_70%)] blur-xl"
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.3 }}
        />
        {/* Accent hint — a faint tint at rest, a real glow while speaking */}
        <motion.div
          className="absolute inset-[-45%] rounded-full blur-xl"
          style={{ background: `radial-gradient(circle, ${ringColor}${active ? "4A" : "12"}, transparent 70%)` }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.3 }}
        />

        <motion.div
          className="relative size-full overflow-hidden rounded-full"
          style={{ boxShadow: `0 0 0 1px ${ringColor}55, 0 6px 20px rgba(0,0,0,.4)` }}
          animate={{ scale: [0.985, 1.015, 0.985] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.2 }}
        >
          <Image src={src} alt={`${name} avatar`} fill className="object-cover" sizes={`${size}px`} />

          {active ? (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `inset 0 0 0 1.5px ${ringColor}` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}

          <span className="absolute bottom-0 right-0 flex size-2.5 items-center justify-center rounded-full border-2 border-[#050311] bg-emerald-400" />
        </motion.div>
      </div>

      <p className="mt-2.5 text-[11px] font-semibold text-white/75">{name}</p>
    </motion.div>
  );
}
