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

// Ring colors match the source reference's per-person color coding —
// each avatar reads as its own small identity, not a repeated template.
const members: (OrbitMember & { id: MemberId; listeners: number; equalizer: number[] })[] = [
  {
    id: "maya",
    name: "Maya",
    role: "Host",
    avatar: "/avatars/maya.png",
    ringColor: "#e879f9",
    listeners: 1284,
    equalizer: [6, 14, 9, 20, 15, 11, 24, 17, 8, 19, 13, 26, 10, 16, 22, 7, 18, 12, 21, 9, 15, 25, 11, 6],
  },
  {
    id: "alex",
    name: "Alex",
    role: "Speaker",
    avatar: "/avatars/alex.png",
    ringColor: "#818cf8",
    listeners: 842,
    equalizer: [9, 18, 7, 23, 12, 16, 8, 21, 14, 27, 10, 17, 6, 20, 13, 24, 9, 15, 19, 8, 22, 11, 16, 7],
  },
  {
    id: "luna",
    name: "Luna",
    role: "Speaker",
    avatar: "/avatars/luna.png",
    ringColor: "#fb923c",
    listeners: 611,
    equalizer: [12, 7, 21, 15, 9, 25, 11, 18, 6, 22, 14, 8, 19, 26, 10, 16, 7, 23, 13, 9, 20, 15, 8, 12],
  },
  {
    id: "noah",
    name: "Noah",
    role: "Listener",
    avatar: "/avatars/noah.png",
    ringColor: "#60a5fa",
    listeners: 393,
    equalizer: [18, 10, 24, 8, 16, 12, 27, 9, 20, 14, 7, 23, 11, 17, 6, 21, 13, 25, 9, 15, 19, 8, 22, 10],
  },
];

const platforms = [
  { label: "iOS & Android", icon: Smartphone },
  { label: "Windows & macOS", icon: Monitor },
  { label: "Web", icon: Globe2 },
];

function useRotatingIndex(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((v) => (v + 1) % length), intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);
  return index;
}

export function HeroSection() {
  const activeIndex = useRotatingIndex(members.length, 6200);
  const activeMember = members[activeIndex];

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <DeepSpaceBackground />
      <div className="grid-background absolute inset-0 opacity-[0.04]" />

      {/* The eye moves: headline -> CTAs -> hero center -> avatars ->
          live widget -> stats (below). Every block here is centered on
          that single vertical line, on purpose. */}
      <div className="relative mx-auto flex w-full max-w-[900px] flex-col items-center px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/[0.06] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-100/90 backdrop-blur-xl"
        >
          <Sparkles className="size-3.5" />
          The future of voice communities
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-[1.03] tracking-[-0.035em] text-white sm:text-7xl xl:text-[6.4rem]"
        >
          <span className="block">Your voice.</span>
          <span className="text-gradient mt-1 block">Your community.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-6 max-w-[440px] text-[15px] leading-[1.8] text-white/50"
        >
          Where conversations become communities. Meet people who understand
          your world, speak freely and build something meaningful together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row"
        >
          <HeroPrimaryCta href="#download">
            Download YO Voice
            <ArrowDown className="size-4" />
          </HeroPrimaryCta>
          <HeroSecondaryCta href="#experience">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[#0d0618]">
              <Play className="ml-0.5 size-3.5 fill-current" />
            </span>
            Watch experience
          </HeroSecondaryCta>
        </motion.div>
      </div>

      {/* The orbit scene — the composition's center of gravity. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-10 aspect-square w-full max-w-[300px] sm:mt-12 sm:max-w-[520px] md:max-w-[600px] lg:max-w-[680px]"
      >
        <OrbitSystem />

        <div className="absolute inset-0 flex items-center justify-center">
          <CenterLogo />
        </div>

        <OrbitingMembers members={members} activeId={activeMember.id} radiusPercent={40} />
      </motion.div>

      {/* Live conversation widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 mx-auto mt-8 flex w-full max-w-[1000px] justify-center px-5 sm:mt-10 sm:px-8"
      >
        <LiveConversationCard
          speakerName={activeMember.name}
          speakerAvatar={activeMember.avatar}
          equalizer={activeMember.equalizer}
          listeners={activeMember.listeners}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.95 }}
        className="relative z-30 mx-auto mt-9 flex flex-wrap items-center justify-center gap-3 px-5"
      >
        {platforms.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-white/45 backdrop-blur-xl"
          >
            <Icon className="size-3.5 text-fuchsia-300/80" />
            {label}
          </div>
        ))}
      </motion.div>

      <div className="relative mx-auto max-w-[1400px] px-5 pb-8 pt-12 sm:px-8 lg:px-12">
        <motion.a
          href="#stats"
          whileHover={{ y: 2 }}
          className="focus-ring mx-auto flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55 backdrop-blur-xl transition hover:bg-white/[0.06] hover:text-white"
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
