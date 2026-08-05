"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Globe2, Monitor, Play, Radio, Smartphone, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";

import { CenterLogo } from "@/components/hero/center-logo";
import { DeepSpaceBackground } from "@/components/hero/deep-space-background";
import { FloatingAvatar } from "@/components/hero/floating-avatar";
import { HeroPrimaryCta, HeroSecondaryCta } from "@/components/hero/hero-cta";
import { LiveConversationCard } from "@/components/hero/live-conversation-card";
import { OrbitSystem } from "@/components/hero/orbit-system";
import { PremiumChatBubble } from "@/components/hero/premium-chat-bubble";

type MemberId = "maya" | "alex" | "luna" | "noah";

type Member = {
  id: MemberId;
  name: string;
  avatar: string;
  position: string;
  align: "left" | "right";
  bubbleSize: "sm" | "md";
  messages: string[];
  equalizer: number[];
};

const members: Member[] = [
  {
    id: "maya",
    name: "Maya",
    avatar: "/avatars/maya.jpg",
    position: "left-[4%] top-[10%]",
    align: "left",
    bubbleSize: "md",
    messages: ["Welcome everyone 👋", "Who's joining tonight?", "Love this energy 💜"],
    equalizer: [8, 18, 12, 21, 15, 9, 17, 12, 19],
  },
  {
    id: "alex",
    name: "Alex",
    avatar: "/avatars/alex.jpg",
    position: "right-[2%] top-[13%]",
    align: "right",
    bubbleSize: "sm",
    messages: ["This sounds awesome.", "Let's build together.", "Count me in 🙌"],
    equalizer: [13, 8, 20, 11, 18, 14, 7, 17, 12],
  },
  {
    id: "luna",
    name: "Luna",
    avatar: "/avatars/luna.jpg",
    position: "bottom-[6%] left-[9%]",
    align: "left",
    bubbleSize: "sm",
    messages: ["This room is amazing.", "Let's go! 💜", "This feels alive ✨"],
    equalizer: [10, 16, 9, 19, 12, 20, 8, 14, 18],
  },
  {
    id: "noah",
    name: "Noah",
    avatar: "/avatars/noah.jpg",
    position: "bottom-[4%] right-[6%]",
    align: "right",
    bubbleSize: "md",
    messages: ["Great point, Maya.", "I'm listening 👂", "What happens next?"],
    equalizer: [18, 14, 9, 20, 12, 7, 16, 11, 19],
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

function OrbitingMember({ member, activeId, cycleOffset }: { member: Member; activeId: MemberId; cycleOffset: number }) {
  const active = activeId === member.id;
  const messageIndex = useRotatingIndex(member.messages.length, 7600 * 4) + cycleOffset;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 + cycleOffset * 0.1, ease: "easeOut" }}
      className={`absolute z-20 ${member.position}`}
    >
      <div className="relative">
        <PremiumChatBubble
          message={member.messages[messageIndex % member.messages.length]}
          visible={active}
          active={active}
          align={member.align}
          size={member.bubbleSize}
        />
        <FloatingAvatar src={member.avatar} name={member.name} active={active} floatDelay={cycleOffset} />
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const activeIndex = useRotatingIndex(members.length, 6200);
  const activeMember = members[activeIndex];

  return (
    <section className="relative overflow-hidden pt-20">
      <DeepSpaceBackground />
      <div className="grid-background absolute inset-0 opacity-[0.08]" />

      <div className="relative mx-auto grid min-h-[720px] w-full max-w-[1360px] items-center gap-10 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-[560px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-400/[0.08] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-100 backdrop-blur-xl"
          >
            <Sparkles className="size-4" />
            The future of voice communities
          </motion.div>

          <h1 className="font-[family-name:var(--font-display)] text-[3.4rem] font-bold leading-[0.92] tracking-[-0.055em] text-white sm:text-7xl xl:text-[80px]">
            <span className="block">Your voice.</span>
            <span className="text-gradient mt-1 block">Your community.</span>
          </h1>

          <p className="mt-7 max-w-[480px] text-base leading-8 text-white/60">
            Where conversations become communities. Meet people who
            understand your world, speak freely and build something
            meaningful together.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-white/50">
            <span className="flex items-center gap-2">
              <Radio className="size-4 text-fuchsia-400" />
              Live voice rooms
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4 text-violet-400" />
              Clubs and friends
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-pink-400" />
              Built for creators
            </span>
          </div>

          <div className="mt-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
              Available across your devices
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {platforms.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 py-2 text-[11px] text-white/55 backdrop-blur-xl"
                >
                  <Icon className="size-3.5 text-fuchsia-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-[1.1/1] w-full max-w-[660px]"
        >
          <OrbitSystem />

          <div className="absolute inset-0 flex items-center justify-center">
            <CenterLogo />
          </div>

          {members.map((member, i) => (
            <OrbitingMember key={member.id} member={member} activeId={activeMember.id} cycleOffset={i} />
          ))}

          <LiveConversationCard
            speakerName={activeMember.name}
            speakerAvatar={activeMember.avatar}
            equalizer={activeMember.equalizer}
          />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-[1360px] px-5 pb-6 sm:px-8 lg:px-10">
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
