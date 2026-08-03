"use client";

import { motion } from "framer-motion";

const stars = Array.from({ length: 135 }, (_, index) => ({
  id: index,
  left: (index * 37 + 11) % 100,
  top: (index * 61 + 7) % 100,
  size: 1 + ((index * 13) % 3),
  opacity: 0.13 + ((index * 17) % 58) / 100,
  duration: 3.4 + ((index * 7) % 8) * 0.42,
  delay: ((index * 11) % 10) * 0.2,
}));

export function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
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
            opacity: [star.opacity, Math.min(star.opacity + 0.45, 0.95), star.opacity],
            scale: [1, 1.55, 1],
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
        className="absolute left-[8%] top-[11%] h-px w-28 rotate-[-28deg] bg-gradient-to-r from-transparent via-fuchsia-200/75 to-transparent"
        animate={{ x: [0, 340], y: [0, 170], opacity: [0, 0.9, 0] }}
        transition={{ duration: 5.6, delay: 1.5, repeat: Infinity, repeatDelay: 8, ease: "easeOut" }}
      />
      <motion.div
        className="absolute right-[20%] top-[9%] h-px w-20 rotate-[-32deg] bg-gradient-to-r from-transparent via-violet-200/70 to-transparent"
        animate={{ x: [0, 220], y: [0, 115], opacity: [0, 0.75, 0] }}
        transition={{ duration: 4.8, delay: 5, repeat: Infinity, repeatDelay: 10, ease: "easeOut" }}
      />
    </div>
  );
}
