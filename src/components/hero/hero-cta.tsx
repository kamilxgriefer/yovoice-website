"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const spring = { type: "spring" as const, stiffness: 400, damping: 22 };

export function HeroPrimaryCta({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={spring}
      className="group relative isolate"
    >
      {/* Rotating gradient border glow — clipped to the button's own footprint
          so the (oversized, so rotation never reveals a gap) gradient layer
          underneath can never sweep out past the edges as it spins. */}
      <div className="absolute -inset-[2px] overflow-hidden rounded-2xl">
        <motion.div
          className="absolute inset-[-60%] opacity-70 blur-[3px] transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "conic-gradient(from 0deg, #7c3aed, #e879f9, #f0abfc, #7c3aed)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <Link
        href={href}
        className="focus-ring relative flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-fuchsia-400 px-6 text-sm font-bold text-white shadow-[0_18px_50px_rgba(192,38,255,.4)]"
      >
        {/* Glass top highlight */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.22] to-transparent" />
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        <span className="relative">{children}</span>
      </Link>
    </motion.div>
  );
}

export function HeroSecondaryCta({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.97, y: 0 }} transition={spring}>
      <Link
        href={href}
        className="focus-ring group relative flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.04] px-6 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.08]"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent" />
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        <span className="relative flex items-center gap-3">{children}</span>
      </Link>
    </motion.div>
  );
}
