"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "focus-ring relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300",
        checked ? "border-transparent bg-[var(--primary)]" : "border-border-strong bg-[var(--surface-raised)]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <motion.span
        className="absolute left-0.5 top-0.5 size-6 rounded-full bg-white"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
