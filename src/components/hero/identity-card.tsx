"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** A premium "collectible identity card" — replaces the old bare circular
 * avatar entirely. Built as a small vertical glass card (photo + name
 * plate), not a profile picture: holographic foil border, layered glow,
 * a top specular sweep, independent floating drift with slight 3D
 * perspective tilt, and a distinct "speaking" state that lifts the card,
 * brightens the foil, and reveals a live mic-level indicator in the name
 * plate rather than just glowing brighter. */
export function IdentityCard({
  src,
  name,
  role,
  active,
  floatDelay = 0,
  size = 88,
}: {
  src: string;
  name: string;
  role: string;
  active: boolean;
  floatDelay?: number;
  size?: number;
}) {
  const cardWidth = size * 1.22;

  return (
    <motion.div
      className="relative"
      style={{ perspective: 700, width: cardWidth }}
      animate={{
        y: [0, -10, 0],
        rotateY: [0, floatDelay % 2 === 0 ? 7 : -7, 0],
        rotate: [0, active ? 1.5 : 0.8, 0, active ? -1.5 : -0.8, 0],
      }}
      transition={{ duration: 6.4 + floatDelay * 0.3, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.5 }}
      whileHover={{ scale: 1.07, rotateY: 0 }}
    >
      {/* Outer breathing glow — the "energy" this card gives off, stronger
          and warmer while speaking */}
      <motion.div
        className="absolute inset-[-38%] rounded-[28px] blur-2xl"
        style={{
          background: active
            ? "radial-gradient(circle, rgba(232,121,249,.5), transparent 68%)"
            : "radial-gradient(circle, rgba(139,92,246,.24), transparent 68%)",
        }}
        animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: floatDelay * 0.4 }}
      />

      {/* Speaking rings — expand outward from the card, not just the photo */}
      {active ? (
        <>
          <motion.span
            className="absolute inset-[-10%] rounded-[26px] border border-fuchsia-300/40"
            animate={{ scale: [0.92, 1.18], opacity: [0.7, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-[-10%] rounded-[26px] border border-fuchsia-300/25"
            animate={{ scale: [0.92, 1.32], opacity: [0.5, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut", delay: 0.55 }}
          />
        </>
      ) : null}

      {/* Ambient contact shadow */}
      <motion.div
        className="absolute -bottom-2.5 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-full bg-black/60 blur-md"
        animate={{ scaleX: [1, 0.82, 1], opacity: [0.55, 0.32, 0.55] }}
        transition={{ duration: 6.4 + floatDelay * 0.3, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      />

      {/* Holographic foil border — conic gradient ring, slowly rotating,
          masked down to a thin frame so the card reads as edged in light
          rather than boxed in a flat stroke */}
      <motion.div
        className="absolute inset-0 rounded-[22px]"
        style={{
          background: active
            ? "conic-gradient(from 0deg, #f0abfc, #a78bfa, #38bdf8, #f0abfc)"
            : "conic-gradient(from 0deg, rgba(240,171,252,.55), rgba(167,139,250,.4), rgba(56,189,248,.3), rgba(240,171,252,.55))",
          WebkitMaskImage: "linear-gradient(#000,#000)",
          padding: 1.4,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <div className="size-full rounded-[20px] bg-[#0d0618]" />
      </motion.div>

      {/* Card body */}
      <div
        className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-[#1c1130]/95 to-[#0d0618]/98 backdrop-blur-xl"
        style={{
          boxShadow: active
            ? "0 24px 60px rgba(0,0,0,.55), 0 0 46px rgba(192,38,255,.3), inset 0 1px 0 rgba(255,255,255,.14)"
            : "0 18px 44px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)",
        }}
      >
        {/* Photo */}
        <div className="relative overflow-hidden" style={{ width: cardWidth, height: size }}>
          <Image src={src} alt={`${name} avatar`} fill className="scale-[1.1] object-cover" sizes={`${cardWidth}px`} />
          {/* Specular top sweep */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.18] via-transparent to-transparent" />
          {/* Fade into the plate below so photo and plate feel like one object */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0d0618] to-transparent" />

          <span className="absolute right-1.5 top-1.5 flex size-3 items-center justify-center rounded-full border-2 border-[#0d0618] bg-emerald-400">
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          </span>
        </div>

        {/* Name plate */}
        <div className="relative px-2.5 py-2 text-center">
          <p className={`truncate text-[11.5px] font-bold tracking-[-0.01em] ${active ? "text-white" : "text-white/80"}`}>
            {name}
          </p>
          {active ? (
            <div className="mt-1 flex items-center justify-center gap-[2.5px]">
              {[5, 9, 6, 10, 5].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-[2.5px] rounded-full bg-gradient-to-t from-violet-400 to-fuchsia-200"
                  style={{ height: 10, transformOrigin: "bottom" }}
                  animate={{ scaleY: [0.2, h / 10, 0.2] }}
                  transition={{ duration: 0.5 + i * 0.05, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-0.5 truncate text-[9px] font-medium uppercase tracking-[0.1em] text-white/35">{role}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
