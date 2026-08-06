"use client";

import { motion } from "framer-motion";

import { PremiumAvatar } from "@/components/hero/premium-avatar";

export type OrbitMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  ringColor: string;
  /** Degrees, 0 = right, 90 = down. Hand-placed, not evenly divided —
   * real compositions aren't symmetric. */
  angleDeg: number;
  /** Percent of the scene's radius. Varying this per member (some
   * closer, some further) is what makes the group read as people
   * gathered around the center rather than dots on a circle. */
  radiusPercent: number;
  depth: "near" | "mid" | "far";
  /** Small constant rotation (degrees) biasing this avatar's idle float
   * toward the center — a subtle "leaning toward the heart" cue. */
  tiltBias: number;
};

/** Renders each member at its own hand-placed position — intentionally
 * asymmetric, with a depth tier per member so the composition reads as
 * foreground/midground/background rather than one flat ring of equal
 * objects. */
export function OrbitingMembers({ members, activeId }: { members: OrbitMember[]; activeId: string }) {
  return (
    <>
      {members.map((member, i) => {
        const angleRad = (member.angleDeg * Math.PI) / 180;
        const x = 50 + member.radiusPercent * Math.cos(angleRad);
        const y = 50 + member.radiusPercent * Math.sin(angleRad);
        const depthScale = member.depth === "near" ? 1 : member.depth === "mid" ? 0.86 : 0.7;

        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              zIndex: member.depth === "near" ? 22 : member.depth === "mid" ? 20 : 18,
            }}
          >
            <div className="scale-[0.6] sm:scale-90 lg:scale-100">
              <div style={{ transform: `scale(${depthScale})` }}>
                <PremiumAvatar
                  src={member.avatar}
                  name={member.name}
                  role={member.role}
                  ringColor={member.ringColor}
                  active={member.id === activeId}
                  depth={member.depth}
                  tiltBias={member.tiltBias}
                  floatDelay={i}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
