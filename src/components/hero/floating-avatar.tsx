"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** The avatar art (public/avatars/*.jpg) already bakes in a glowing ring
 * frame, so this wraps it with motion/shadow/online-state rather than
 * drawing a second competing frame on top. */
export function FloatingAvatar({
  src,
  name,
  active,
  online = true,
  floatDelay = 0,
  size = 78,
}: {
  src: string;
  name: string;
  active: boolean;
  online?: boolean;
  floatDelay?: number;
  size?: number;
}) {
  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -9, 0], rotate: [0, active ? 2 : 1, 0, active ? -2 : -1, 0] }}
      transition={{ duration: 5.5 + floatDelay * 0.3, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      whileHover={{ scale: 1.08 }}
    >
      {active ? (
        <>
          <motion.span
            className="absolute inset-[-16%] rounded-full border border-fuchsia-300/40"
            animate={{ scale: [0.85, 1.45], opacity: [0.7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-[-16%] rounded-full border border-fuchsia-300/30"
            animate={{ scale: [0.85, 1.7], opacity: [0.55, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
        </>
      ) : null}

      <div className="absolute -bottom-2 left-1/2 h-2.5 w-10 -translate-x-1/2 rounded-full bg-black/55 blur-md" />

      <div
        className="relative overflow-hidden rounded-full transition-shadow duration-300"
        style={{
          width: size,
          height: size,
          filter: active
            ? "drop-shadow(0 0 26px rgba(232,121,249,.6))"
            : "drop-shadow(0 0 12px rgba(139,92,246,.28))",
        }}
      >
        <Image src={src} alt={`${name} avatar`} fill className="scale-[1.12] object-cover" sizes={`${size}px`} />

        {online ? (
          <span className="absolute bottom-1 right-1 flex size-3.5 items-center justify-center rounded-full border-2 border-[#0c0618] bg-emerald-400">
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          </span>
        ) : null}
      </div>

      <span
        className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold tracking-wide ${
          active ? "text-white" : "text-white/55"
        }`}
      >
        {name}
      </span>
    </motion.div>
  );
}
