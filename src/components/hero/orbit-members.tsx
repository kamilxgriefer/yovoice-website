"use client";

import { motion } from "framer-motion";

import { PremiumAvatar } from "@/components/hero/premium-avatar";

export type OrbitMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  ringColor: string;
};

/** Evenly distributes members around a full circle (real trigonometric
 * placement, not scattered corner positions) at a shared radius. Position
 * is static per member — motion lives in each PremiumAvatar's own float/
 * breathing pulse instead of the position itself, which reads as engineered
 * rather than chaotic at this scale. */
export function OrbitingMembers({
  members,
  activeId,
  radiusPercent = 40,
  startAngleDeg = -90,
}: {
  members: OrbitMember[];
  activeId: string;
  radiusPercent?: number;
  startAngleDeg?: number;
}) {
  const step = 360 / members.length;

  return (
    <>
      {members.map((member, i) => {
        const angleRad = ((startAngleDeg + i * step) * Math.PI) / 180;
        const x = 50 + radiusPercent * Math.cos(angleRad);
        const y = 50 + radiusPercent * Math.sin(angleRad);

        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 scale-[0.68] sm:scale-90 lg:scale-100"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <PremiumAvatar
              src={member.avatar}
              name={member.name}
              role={member.role}
              ringColor={member.ringColor}
              active={member.id === activeId}
              floatDelay={i}
            />
          </motion.div>
        );
      })}
    </>
  );
}
