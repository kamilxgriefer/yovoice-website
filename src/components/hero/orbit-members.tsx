"use client";

import { motion } from "framer-motion";

import { IdentityCard } from "@/components/hero/identity-card";

export type OrbitMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
};

/** Evenly distributes members around a full circle (true trig placement,
 * not scattered corner positions) at a shared radius. Each card's position
 * is static — the orbit *feeling* comes from the rotating ring layers
 * behind/around them (OrbitSystem) plus each card's own independent float/
 * tilt (IdentityCard) — literally spinning avatar photos around the circle
 * reads as chaotic and distracting at this scale, so motion is layered
 * instead of applied to position. `startAngleDeg` rotates the whole
 * formation without touching any card's own orientation. */
export function OrbitingMembers({
  members,
  activeId,
  radiusPercent = 38,
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
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-20 origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.46] sm:scale-90 lg:scale-100"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <IdentityCard
              src={member.avatar}
              name={member.name}
              role={member.role}
              active={member.id === activeId}
              floatDelay={i}
            />
          </motion.div>
        );
      })}
    </>
  );
}
