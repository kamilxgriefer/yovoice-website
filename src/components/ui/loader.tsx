"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

/** Simple ring spinner — the default choice for inline/button loading. */
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <motion.span
      className={cn("inline-block rounded-full border-2 border-white/15 border-t-fuchsia-300", className)}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
    />
  );
}

/** Three breathing dots — for "someone is typing" / lightweight inline
 * waiting states. */
export function PulseDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-fuchsia-300"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/** Concentric rotating rings — the "full page / section loading" treatment,
 * more on-brand than a bare spinner for larger empty states. */
export function OrbitLoader({ size = 56 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }} role="status" aria-label="Loading">
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-fuchsia-300/25 border-t-fuchsia-300"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="absolute inset-[22%] rounded-full border-2 border-violet-300/20 border-b-violet-300"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
