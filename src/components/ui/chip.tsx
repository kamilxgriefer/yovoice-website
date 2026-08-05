"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

export function Chip({
  active,
  icon,
  className,
  children,
  onClick,
}: {
  active?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn("chip focus-ring", active && "chip-active", className)}
      aria-pressed={active}
    >
      {icon}
      {children}
    </motion.button>
  );
}
