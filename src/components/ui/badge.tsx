import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "live" | "verified" | "creator" | "neutral";

const variantClass: Record<Variant, string> = {
  live: "badge-live",
  verified: "badge-verified",
  creator: "badge-creator",
  neutral: "badge-neutral",
};

export function Badge({
  variant = "neutral",
  icon,
  className,
  children,
}: {
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("badge", variantClass[variant], className)}>
      {icon}
      {children}
    </span>
  );
}
