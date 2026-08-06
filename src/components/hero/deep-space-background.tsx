"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

type Star = {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  parallax: number;
};

const stars: Star[] = Array.from({ length: 220 }, (_, i) => ({
  id: i,
  left: (i * 29.7 + 3) % 100,
  top: (i * 53.3 + 11) % 100,
  size: i % 17 === 0 ? 2.6 : i % 5 === 0 ? 1.8 : 1,
  opacity: 0.15 + ((i * 19) % 60) / 100,
  duration: 3 + ((i * 7) % 10) * 0.4,
  delay: ((i * 13) % 12) * 0.25,
  parallax: 4 + (i % 4) * 5,
}));

const dust = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: (i * 41.2 + 7) % 100,
  top: (i * 67.7 + 5) % 100,
  size: 3 + (i % 5) * 2,
  duration: 14 + (i % 6) * 3,
  delay: (i % 9) * 1.1,
  parallax: 14 + (i % 3) * 10,
}));

/** Warm embers — a distinct particle family from `dust`: smaller, faster,
 * amber/fuchsia-tinted rather than neutral, drifting upward like sparks
 * off the center logo rather than floating in place. Concentrated toward
 * the lower two-thirds of the frame so they read as rising past the
 * avatars/logo, not scattered uniformly. */
const embers = Array.from({ length: 34 }, (_, i) => ({
  id: i,
  left: (i * 17.3 + 2) % 100,
  top: 35 + ((i * 23.6) % 60),
  size: 1 + (i % 3),
  hue: i % 3 === 0 ? "rgba(253,186,116,.55)" : i % 3 === 1 ? "rgba(232,121,249,.5)" : "rgba(216,180,254,.5)",
  duration: 6 + (i % 7) * 1.4,
  delay: (i % 11) * 0.6,
}));

/** Full-bleed layered space backdrop: nebula fog, ambient light, a starfield
 * with size variance, drifting dust motes, and a subtle cursor-parallax tilt
 * across the whole stack. Every layer is pure CSS/SVG — no image assets. */
export function DeepSpaceBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 40, damping: 20, mass: 0.6 });
  const springY = useSpring(my, { stiffness: 40, damping: 20, mass: 0.6 });
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (reduced) return;
    function onMove(e: MouseEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mx.set(nx);
      my.set(ny);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduced]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base void */}
      <div className="absolute inset-0 bg-[#040210]" />

      {/* Cursor glow — a soft light that follows the pointer, as if the
          scene itself were reacting to it. Additive-feeling radial wash,
          low opacity so it reads as ambient rather than a spotlight. */}
      <motion.div
        className="absolute size-[600px] rounded-full blur-[90px]"
        style={{
          background: "radial-gradient(circle, rgba(232,121,249,.16), transparent 68%)",
          left: useTransform(springX, (v) => `calc(50% + ${v * 340}px - 300px)`),
          top: useTransform(springY, (v) => `calc(50% + ${v * 340}px - 300px)`),
        }}
      />

      {/* Light leaks — diagonal cinematic color streaks, like stray lens
          flare across the frame rather than a symmetric glow. */}
      <div className="absolute -left-[10%] top-[-6%] h-[140%] w-[45%] rotate-[9deg] bg-[linear-gradient(100deg,transparent_40%,rgba(232,121,249,.05)_48%,rgba(139,92,246,.07)_52%,transparent_60%)]" />
      <div className="absolute -right-[15%] bottom-[-10%] h-[120%] w-[40%] rotate-[-11deg] bg-[linear-gradient(100deg,transparent_42%,rgba(56,189,248,.04)_50%,transparent_58%)]" />

      {/* Nebula fog — slow-drifting layered color fields */}
      <motion.div
        className="absolute -left-[20%] -top-[30%] size-[900px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,.22),transparent_62%)] blur-3xl"
        animate={reduced ? undefined : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        style={{ x: useTransform(springX, (v) => v * -18), y: useTransform(springY, (v) => v * -18) }}
      />
      <motion.div
        className="absolute -right-[15%] top-[-10%] size-[820px] rounded-full bg-[radial-gradient(circle,rgba(232,121,249,.18),transparent_60%)] blur-3xl"
        animate={reduced ? undefined : { x: [0, -30, 25, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 29, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ x: useTransform(springX, (v) => v * 14), y: useTransform(springY, (v) => v * 14) }}
      />
      <motion.div
        className="absolute bottom-[-25%] left-[10%] size-[760px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,.09),transparent_65%)] blur-3xl"
        animate={reduced ? undefined : { x: [0, 25, -25, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(192,38,255,.10),transparent_55%)]" />

      {/* Large blurred planets — soft, distant, part of the depth rather than
          a distinct foreground object. Radial-gradient spheres, heavily
          blurred so they read as atmosphere, not shapes. */}
      <motion.div
        className="absolute -right-[8%] top-[4%] size-[380px] rounded-full opacity-70 blur-2xl sm:size-[460px]"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(139,92,246,.5), rgba(88,28,135,.25) 45%, transparent 72%)",
          x: useTransform(springX, (v) => v * 6),
          y: useTransform(springY, (v) => v * 6),
        }}
        animate={reduced ? undefined : { y: [0, 14, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[2%] left-[2%] size-[260px] rounded-full opacity-50 blur-2xl sm:size-[320px]"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, rgba(244,114,182,.4), rgba(124,58,237,.2) 50%, transparent 74%)",
        }}
        animate={reduced ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Space dust — soft, larger, slower than stars */}
      <motion.div style={{ x: useTransform(springX, (v) => v * -8), y: useTransform(springY, (v) => v * -8) }}>
        {dust.map((d) => (
          <motion.span
            key={d.id}
            className="absolute rounded-full bg-fuchsia-100/[0.06] blur-[2px]"
            style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
            animate={
              reduced
                ? undefined
                : { y: [0, -18, 0], x: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }
            }
            transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* Embers — warm/fuchsia sparks drifting upward, distinct from the
          neutral `dust` layer below */}
      <motion.div style={{ x: useTransform(springX, (v) => v * -6), y: useTransform(springY, (v) => v * -6) }}>
        {embers.map((e) => (
          <motion.span
            key={e.id}
            className="absolute rounded-full"
            style={{ left: `${e.left}%`, top: `${e.top}%`, width: e.size, height: e.size, background: e.hue, boxShadow: `0 0 ${e.size * 3}px ${e.hue}` }}
            animate={
              reduced
                ? undefined
                : { y: [0, -60, -120], opacity: [0, 0.85, 0], x: [0, e.id % 2 === 0 ? 10 : -10, 0] }
            }
            transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      </motion.div>

      {/* Starfield with parallax + size variance */}
      <motion.div style={{ x: useTransform(springX, (v) => v * -12), y: useTransform(springY, (v) => v * -12) }}>
        {stars.map((s) => (
          <motion.span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
            animate={{
              opacity: [s.opacity, Math.min(s.opacity + 0.5, 1), s.opacity],
              scale: [1, 1.6, 1],
            }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* Shooting stars */}
      <motion.div
        className="absolute left-[10%] top-[14%] h-px w-32 rotate-[-26deg] bg-gradient-to-r from-transparent via-fuchsia-100/80 to-transparent"
        animate={{ x: [0, 380], y: [0, 184], opacity: [0, 1, 0] }}
        transition={{ duration: 4.2, delay: 1.2, repeat: Infinity, repeatDelay: 9, ease: "easeOut" }}
      />
      <motion.div
        className="absolute right-[18%] top-[8%] h-px w-24 rotate-[-30deg] bg-gradient-to-r from-transparent via-violet-100/70 to-transparent"
        animate={{ x: [0, 260], y: [0, 150], opacity: [0, 0.85, 0] }}
        transition={{ duration: 3.6, delay: 6, repeat: Infinity, repeatDelay: 11, ease: "easeOut" }}
      />

      {/* Vignette to keep focus on center content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(4,2,16,.55)_100%)]" />
      <div className="noise-overlay absolute inset-0 opacity-[0.025]" />
    </div>
  );
}
