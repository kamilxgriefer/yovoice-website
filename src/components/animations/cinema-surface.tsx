"use client";

import type { ReactNode } from "react";

import { useCinema } from "@/components/animations/cinema";

/**
 * A section whose ground or seam changes with the scroll cinema, and nothing
 * else: the one piece of a server-rendered section that has to ask
 * `useCinema()`. Its children stay server components (the Download and
 * Premium sections' copy and data never ship as client code).
 *
 * `className` is the static layout's (the server render, no JavaScript,
 * reduced motion, large text); `cinemaClassName` replaces it once the
 * cinema is on. Both are whole class lists, so the server render is exactly
 * the static layout's markup.
 */
export function CinemaSurface({
  as: Tag = "section",
  id,
  "aria-labelledby": labelledBy,
  className,
  cinemaClassName,
  children,
}: {
  as?: "section" | "div";
  id?: string;
  "aria-labelledby"?: string;
  className: string;
  cinemaClassName: string;
  children: ReactNode;
}) {
  const cinema = useCinema();
  return (
    <Tag id={id} aria-labelledby={labelledBy} className={cinema ? cinemaClassName : className}>
      {children}
    </Tag>
  );
}
