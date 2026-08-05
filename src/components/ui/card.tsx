"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

/** Site-wide card primitive — glass by default, optional gradient border
 * ("glow") for featured content, optional lift-on-hover for clickable
 * cards. GPU-only motion (y + shadow, no layout properties). */
export function Card({
  glow,
  hoverLift,
  className,
  children,
}: {
  glow?: boolean;
  hoverLift?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -6 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        glow ? "glass-panel-glow" : "glass-panel",
        "rounded-3xl p-6",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
