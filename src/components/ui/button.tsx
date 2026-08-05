"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

const spring = { type: "spring" as const, stiffness: 400, damping: 22 };

type Variant = "primary" | "secondary" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "premium-button",
  secondary: "premium-button-secondary",
  ghost: "premium-button-ghost",
};

type CommonProps = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  isLoading?: boolean;
  className?: string;
  children: ReactNode;
};

const sizeClass: Record<NonNullable<CommonProps["size"]>, string> = {
  sm: "min-h-10 px-4 text-xs",
  md: "min-h-12 px-6 text-sm",
  lg: "min-h-14 px-8 text-base",
};

/** Site-wide button primitive matching the UI asset pack: pill radius,
 * glass sheen, spring hover-lift, GPU-only motion (transform/opacity). Pass
 * `href` for a link-styled-as-button, omit it for a real `<button>`. */
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>;

export function Button({
  href,
  variant = "primary",
  size = "md",
  icon,
  isLoading,
  className,
  children,
  ...rest
}: CommonProps & { href?: string } & NativeButtonProps) {
  const classes = cn(
    "focus-ring inline-flex items-center justify-center gap-2",
    variantClass[variant],
    sizeClass[size],
    isLoading && "pointer-events-none opacity-70",
    className,
  );

  const content = (
    <>
      {isLoading ? (
        <motion.span
          className="size-4 rounded-full border-2 border-white/30 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        icon
      )}
      <span className="relative">{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={spring} className="inline-block">
        <Link href={href} className={classes}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      className={classes}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {content}
    </motion.button>
  );
}
