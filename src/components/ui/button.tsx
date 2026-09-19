"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

const spring = { type: "spring" as const, stiffness: 400, damping: 22 };

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClass: Record<Variant, string> = {
  primary: "premium-button",
  secondary: "premium-button-secondary",
  ghost: "premium-button-ghost",
  // Secondary geometry, recoloured on the error pair for the one destructive
  // action on a page. Both classes are unlayered, so the colours cannot be
  // lost to a leftover utility.
  danger: "premium-button-secondary premium-button-danger",
};

type CommonProps = {
  variant?: Variant;
  icon?: ReactNode;
  isLoading?: boolean;
  className?: string;
  children: ReactNode;
};

/** Site-wide button primitive. The look comes from the unlayered
 * `.premium-button*` classes in globals.css (solid fill, 12 px radius,
 * 48 px, 600); this adds only GPU-only motion (transform/opacity). There is
 * one size on purpose: the unlayered geometry would override any size
 * utility anyway, so a `size` prop could only ever be a no-op. Pass
 * `href` for a link-styled-as-button, omit it for a real `<button>`. */
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>;

export function Button({
  href,
  variant = "primary",
  icon,
  isLoading,
  className,
  children,
  ...rest
}: CommonProps & { href?: string } & NativeButtonProps) {
  const classes = cn(
    "focus-ring inline-flex items-center justify-center gap-2",
    variantClass[variant],
    isLoading && "pointer-events-none opacity-70",
    className,
  );

  const content = (
    <>
      {isLoading ? (
        <motion.span
          className="size-4 rounded-full border-2 border-[color-mix(in_srgb,currentColor_30%,transparent)] border-t-current"
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
