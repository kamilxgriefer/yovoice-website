"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** A clean circle — nothing more. Earlier passes built these as small
 * "trading cards" with holographic borders, name plates and waveforms;
 * that read as busy, not premium. What's left: the photo, a soft glow
 * behind it, a single very thin ring, an online dot, a slow breathing
 * pulse and a tiny float. Name/role sit outside the circle as plain
 * caption text, not another boxed element. */
export function PremiumAvatar({
  src,
  name,
  role,
  ringColor,
  active,
  floatDelay = 0,
  size = 72,
}: {
  src: string;
  name: string;
  role: string;
  ringColor: string;
  active: boolean;
  floatDelay?: number;
  size?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center"
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 6.5 + floatDelay * 0.4, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.5 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Soft glow behind the circle — brighter while speaking */}
        <motion.div
          className="absolute inset-[-45%] rounded-full blur-xl"
          style={{ background: `radial-gradient(circle, ${ringColor}${active ? "55" : "2A"}, transparent 70%)` }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.3 }}
        />

        {/* Breathing scale on the circle itself */}
        <motion.div
          className="relative size-full overflow-hidden rounded-full"
          style={{ boxShadow: `0 0 0 1px ${ringColor}66, 0 6px 20px rgba(0,0,0,.4)` }}
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

      <p className="mt-2.5 text-[11px] font-semibold text-white/80">{name}</p>
      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/35">{role}</p>
    </motion.div>
  );
}
