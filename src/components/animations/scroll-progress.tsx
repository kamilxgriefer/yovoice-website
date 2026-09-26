"use client";

import { motion, useScroll, useSpring } from "framer-motion";

import { SCENE_SPRING, useCinema } from "@/components/animations/cinema";

/**
 * A 2 px level meter along the bottom edge of the fixed header: how far down
 * the homepage the visitor is. Decorative (the scrollbar already says it),
 * and only drawn while the scroll cinema is on.
 */
export function ScrollProgress() {
  const cinema = useCinema();
  return cinema ? <Meter /> : null;
}

function Meter() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, SCENE_SPRING);
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-[calc(var(--header-height)-1px)] z-50 h-[2px] origin-left bg-[linear-gradient(90deg,var(--primary),var(--secondary),var(--accent))]"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
