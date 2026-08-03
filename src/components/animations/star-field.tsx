"use client";

import { motion } from "framer-motion";

const stars = Array.from({ length: 90 }, (_, index) => ({
  id: index,
  left: (index * 37 + 11) % 100,
  top: (index * 61 + 7) % 100,
  size: 1 + ((index * 13) % 3),
  opacity: 0.18 + ((index * 17) % 60) / 100,
  duration: 3.5 + ((index * 7) % 8) * 0.45,
  delay: ((index * 11) % 10) * 0.2,
}));

export function StarField() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [star.opacity, Math.min(star.opacity + 0.45, 1), star.opacity],
            scale: [1, 1.6, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute left-[12%] top-[18%] h-px w-24 rotate-[-28deg] bg-gradient-to-r from-transparent via-fuchsia-200/70 to-transparent"
        animate={{
          x: [0, 260],
          y: [0, 130],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 5.8,
          delay: 2,
          repeat: Infinity,
          repeatDelay: 8,
          ease: "easeOut",
        }}
      />

      <motion.div
        className="absolute right-[20%] top-[12%] h-px w-16 rotate-[-32deg] bg-gradient-to-r from-transparent via-violet-200/60 to-transparent"
        animate={{
          x: [0, 180],
          y: [0, 95],
          opacity: [0, 0.65, 0],
        }}
        transition={{
          duration: 4.8,
          delay: 6,
          repeat: Infinity,
          repeatDelay: 11,
          ease: "easeOut",
        }}
      />
    </div>
  );
}
