"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** The avatar art (public/avatars/*.jpg) already bakes in a glowing ring
 * frame, so this adds a soft glass backdrop, ambient shadow, gentle 3D
 * perspective tilt and a constant breathing glow (stronger when active)
 * rather than drawing a second competing frame on top of the photo. */
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
      style={{ perspective: 600 }}
      animate={{
        y: [0, -9, 0],
        rotateY: [0, floatDelay % 2 === 0 ? 8 : -8, 0],
        rotate: [0, active ? 2 : 1, 0, active ? -2 : -1, 0],
      }}
      transition={{ duration: 6 + floatDelay * 0.3, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      whileHover={{ scale: 1.08 }}
    >
      {/* Constant breathing glow, stronger when speaking */}
      <motion.div
        className="absolute inset-[-30%] rounded-full blur-xl"
        style={{
          background: active
            ? "radial-gradient(circle, rgba(232,121,249,.42), transparent 68%)"
            : "radial-gradient(circle, rgba(139,92,246,.22), transparent 68%)",
        }}
        animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.4 }}
      />

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

      {/* Ambient contact shadow, floats independently of the avatar itself */}
      <motion.div
        className="absolute -bottom-2 left-1/2 h-2.5 w-10 -translate-x-1/2 rounded-full bg-black/55 blur-md"
        animate={{ scaleX: [1, 0.82, 1], opacity: [0.55, 0.35, 0.55] }}
        transition={{ duration: 6 + floatDelay * 0.3, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      />

      {/* Glass frame — sits just behind the photo, visible as a soft ring */}
      <div
        className="absolute inset-[-6%] rounded-full border border-white/[0.14] bg-white/[0.03] backdrop-blur-md"
        style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,.12), inset 0 -6px 12px rgba(0,0,0,.3)" }}
      />

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

        {/* Subtle top-left specular highlight for a "physically present" feel */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.14] via-transparent to-transparent" />

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
