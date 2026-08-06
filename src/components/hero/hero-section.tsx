"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Globe2, Monitor, Play, Smartphone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { CenterLogo } from "@/components/hero/center-logo";
import { DeepSpaceBackground } from "@/components/hero/deep-space-background";
import { HeroPrimaryCta, HeroSecondaryCta } from "@/components/hero/hero-cta";
import { LiveConversationCard } from "@/components/hero/live-conversation-card";
import { OrbitingMembers, type OrbitMember } from "@/components/hero/orbit-members";
import { OrbitSystem } from "@/components/hero/orbit-system";

type MemberId = "maya" | "alex" | "luna" | "noah";

const members: (OrbitMember & { id: MemberId; listeners: number; equalizer: number[] })[] = [
  {
    id: "maya",
    name: "Maya",
    role: "Host",
    avatar: "/avatars/maya.jpg",
    listeners: 1284,
    equalizer: [6, 14, 9, 20, 15, 11, 24, 17, 8, 19, 13, 26, 10, 16, 22, 7, 18, 12, 21, 9, 15, 25, 11, 6],
  },
  {
    id: "alex",
    name: "Alex",
    role: "Speaker",
    avatar: "/avatars/alex.jpg",
    listeners: 842,
    equalizer: [9, 18, 7, 23, 12, 16, 8, 21, 14, 27, 10, 17, 6, 20, 13, 24, 9, 15, 19, 8, 22, 11, 16, 7],
  },
  {
    id: "luna",
    name: "Luna",
    role: "Speaker",
    avatar: "/avatars/luna.jpg",
    listeners: 611,
    equalizer: [12, 7, 21, 15, 9, 25, 11, 18, 6, 22, 14, 8, 19, 26, 10, 16, 7, 23, 13, 9, 20, 15, 8, 12],
  },
  {
    id: "noah",
    name: "Noah",
    role: "Listener",
    avatar: "/avatars/noah.jpg",
    listeners: 393,
    equalizer: [18, 10, 24, 8, 16, 12, 27, 9, 20, 14, 7, 23, 11, 17, 6, 21, 13, 25, 9, 15, 19, 8, 22, 10],
  },
];

const platforms = [
  { label: "iOS & Android", icon: Smartphone },
  { label: "Windows & macOS", icon: Monitor },
  { label: "Web", icon: Globe2 },
];

const statChips = [
  { label: "12,400+ live rooms today", position: "left-[2%] top-[16%] sm:left-[6%]" },
  { label: "<50ms voice latency", position: "right-[1%] top-[8%] sm:right-[5%]" },
  { label: "140+ countries", position: "bottom-[10%] left-[0%] sm:left-[3%]" },
];

function useRotatingIndex(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((v) => (v + 1) % length), intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);
  return index;
}

/** A floating glass micro-chip — small decorative "product is alive"
 * signals scattered around the scene, not competing with the avatars for
 * attention (low opacity, small, no motion beyond a slow independent
 * bob). Purely atmospheric, like light leaks or dust, just made of text. */
function StatChip({ label, position, delay }: { label: string; position: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.8, delay: 1.1 + delay },
        y: { duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`absolute z-10 hidden rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[10.5px] font-semibold text-white/45 backdrop-blur-xl md:block ${position}`}
    >
      {label}
    </motion.div>
  );
}

export function HeroSection() {
  const activeIndex = useRotatingIndex(members.length, 6200);
  const activeMember = members[activeIndex];

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <DeepSpaceBackground />
      <div className="grid-background absolute inset-0 opacity-[0.06]" />
      {/* Cinematic key light + color grade — a soft directional wash tying
          every layer beneath it into one consistent lighting scene. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(232,121,249,.05)_0%,transparent_35%),linear-gradient(-65deg,rgba(56,189,248,.04)_0%,transparent_40%)]" />

      <div className="relative mx-auto flex w-full max-w-[1000px] flex-col items-center px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-400/[0.08] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-100 backdrop-blur-xl"
        >
          <Sparkles className="size-4" />
          The future of voice communities
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-[family-name:var(--font-display)] text-[2.5rem] font-bold leading-[0.98] tracking-[-0.03em] text-white sm:text-8xl xl:text-[7.5rem]"
        >
          <span className="block">Your voice.</span>
          <span className="text-gradient mt-1 block">Your community.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-7 max-w-[480px] text-base leading-[1.85] text-white/55"
        >
          Where conversations become communities. Meet people who understand
          your world, speak freely and build something meaningful together.
        </motion.p>
      </div>

      {/* The orbit scene — the centerpiece. Full-bleed, tall, the logo
          dominates and everything else visually belongs to it. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-4 aspect-square w-full max-w-[300px] sm:mt-2 sm:max-w-[560px] md:max-w-[680px] lg:max-w-[760px]"
      >
        {/* Ambient wash cast by the logo across the whole scene, distinct
            from CenterLogo's own tighter halo — this is what makes nearby
            elements read as lit BY the orb rather than independently lit. */}
        <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.1),transparent_70%)] blur-3xl" />

        <OrbitSystem />

        <div className="absolute inset-0 flex items-center justify-center">
          <CenterLogo />
        </div>

        <OrbitingMembers members={members} activeId={activeMember.id} radiusPercent={39} />

        {statChips.map((chip, i) => (
          <StatChip key={chip.label} label={chip.label} position={chip.position} delay={i * 0.7} />
        ))}
      </motion.div>

      {/* A thin energy beam connecting the logo above to the widget below —
          the "Live Conversation is powered by the core" cue. Opacity-only,
          breathing on the same PULSE cadence as the logo. */}
      <motion.div
        aria-hidden="true"
        className="relative z-20 mx-auto h-16 w-px bg-gradient-to-b from-fuchsia-300/50 via-violet-400/25 to-transparent sm:h-20"
        animate={{ opacity: [0.3, 0.85, 0.3] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Live conversation widget — floats just beneath the scene,
          slightly overlapping its bottom edge so the two feel like one
          continuous object rather than a scene plus a bolted-on card. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 mx-auto -mt-12 flex w-full max-w-[1000px] justify-center px-5 sm:-mt-16 sm:px-8"
      >
        <LiveConversationCard
          speakerName={activeMember.name}
          speakerAvatar={activeMember.avatar}
          equalizer={activeMember.equalizer}
          listeners={activeMember.listeners}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.85 }}
        className="relative z-30 mx-auto mt-10 flex flex-col items-center gap-4 px-5 sm:flex-row sm:justify-center"
      >
        <HeroPrimaryCta href="#download">
          Download YO Voice
          <ArrowDown className="size-4" />
        </HeroPrimaryCta>
        <HeroSecondaryCta href="#experience">
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#0d0618]">
            <Play className="ml-0.5 size-4 fill-current" />
          </span>
          Watch experience
        </HeroSecondaryCta>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1 }}
        className="relative z-30 mx-auto mt-10 flex flex-wrap items-center justify-center gap-3 px-5"
      >
        {platforms.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 py-2 text-[11px] text-white/50 backdrop-blur-xl"
          >
            <Icon className="size-3.5 text-fuchsia-300" />
            {label}
          </div>
        ))}
      </motion.div>

      <div className="relative mx-auto max-w-[1400px] px-5 pb-8 pt-14 sm:px-8 lg:px-12">
        <motion.a
          href="#stats"
          whileHover={{ y: 2 }}
          className="focus-ring mx-auto flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/60 backdrop-blur-xl transition hover:bg-white/[0.07] hover:text-white"
          aria-label="Scroll to statistics"
        >
          <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ArrowDown className="size-4" />
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}
