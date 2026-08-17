"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, HouseHeart, Mic2, Play, UsersRound } from "lucide-react";
import { motion } from "framer-motion";

import { CenterLogo } from "@/components/hero/center-logo";
import { DeepSpaceBackground } from "@/components/hero/deep-space-background";
import { HeroPrimaryCta, HeroSecondaryCta } from "@/components/hero/hero-cta";
import { useAuth } from "@/hooks/use-auth";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";
import { LiveConversationCard } from "@/components/hero/live-conversation-card";
import { LiveStats } from "@/components/hero/live-stats";
import { OrbitingMembers, type OrbitMember } from "@/components/hero/orbit-members";
import { OrbitSystem } from "@/components/hero/orbit-system";

type MemberId = "maya" | "alex" | "luna" | "noah";

// Hand-composed, not evenly divided: varying angle, radius and depth per
// person so the group reads as people gathered around the center — some
// closer, some further, some higher — rather than dots on a circle. Ring
// colors are each person's own faint identity, not a loud spotlight (see
// PremiumAvatar — full color only shows while they're actually speaking).
const members: (OrbitMember & { id: MemberId; listeners: number; equalizer: number[] })[] = [
  {
    id: "maya",
    name: "Maya",
    role: "Host",
    avatar: "/avatars/maya.png",
    ringColor: "#e879f9",
    angleDeg: 208,
    radiusPercent: 31,
    depth: "near",
    tiltBias: 4,
    listeners: 1284,
    equalizer: [6, 14, 9, 20, 15, 11, 24, 17, 8, 19, 13, 26, 10, 16, 22, 7, 18, 12, 21, 9, 15, 25, 11, 6],
  },
  {
    id: "alex",
    name: "Alex",
    role: "Speaker",
    avatar: "/avatars/alex.png",
    ringColor: "#818cf8",
    angleDeg: -15,
    radiusPercent: 39,
    depth: "mid",
    tiltBias: -3,
    listeners: 842,
    equalizer: [9, 18, 7, 23, 12, 16, 8, 21, 14, 27, 10, 17, 6, 20, 13, 24, 9, 15, 19, 8, 22, 11, 16, 7],
  },
  {
    id: "luna",
    name: "Luna",
    role: "Speaker",
    avatar: "/avatars/luna.png",
    ringColor: "#fb923c",
    angleDeg: 46,
    radiusPercent: 41,
    depth: "far",
    tiltBias: 3,
    listeners: 611,
    equalizer: [12, 7, 21, 15, 9, 25, 11, 18, 6, 22, 14, 8, 19, 26, 10, 16, 7, 23, 13, 9, 20, 15, 8, 12],
  },
  {
    id: "noah",
    name: "Noah",
    role: "Listener",
    avatar: "/avatars/noah.png",
    ringColor: "#60a5fa",
    angleDeg: 152,
    radiusPercent: 37,
    depth: "mid",
    tiltBias: -4,
    listeners: 393,
    equalizer: [18, 10, 24, 8, 16, 12, 27, 9, 20, 14, 7, 23, 11, 17, 6, 21, 13, 25, 9, 15, 19, 8, 22, 10],
  },
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
  const { user, loading: authLoading } = useAuth();

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36 lg:min-h-[calc(100svh-80px)] lg:pt-0">
      <DeepSpaceBackground />

      {/* Desktop is one above-fold stage: promise on the left, the human
          conversation scene on the right. Below lg the same pieces return
          to the centered stack that already works well on phones. */}
      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:grid lg:min-h-[calc(100svh-80px)] lg:grid-cols-[minmax(0,.92fr)_minmax(520px,1.08fr)] lg:items-center lg:gap-12 lg:px-12 lg:py-16 xl:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/15 bg-fuchsia-300/[0.06] px-3.5 py-2 text-[10.5px] font-bold tracking-[0.16em] text-fuchsia-100/80 sm:text-[11px]"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-fuchsia-300 opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-fuchsia-300" />
            </span>
            REAL PEOPLE. LIVE CONVERSATIONS.
          </motion.div>

          {/* Real server-published figures appear only when fresh. The fixed
              eyebrow above still explains the product when honest numbers are
              unavailable — it never substitutes an invented count. */}
          <div className="mt-3 w-full">
            <LiveStats />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-[family-name:var(--font-display)] text-[2.65rem] font-bold leading-[1.01] tracking-[-0.04em] text-white sm:text-7xl lg:text-[3.55rem] xl:text-[4.5rem]"
          >
            <span className="block">Stop scrolling.</span>
            <span className="text-gradient mt-1 block">Start talking.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-5 max-w-[560px] text-[15px] leading-[1.7] text-white/55 sm:mt-7 sm:text-[17px] sm:leading-7"
          >
            YO Voice brings people together in live rooms that feel less like
            another feed and more like being there. Listen first, join the
            conversation, or create a place for your people.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row lg:items-start"
          >
            <HeroPrimaryCta
              href={
                authLoading || user
                  ? APP_ENTRY_PATH
                  : `/login?redirect=${APP_ENTRY_PATH}`
              }
            >
              Start talking
              <ArrowRight className="size-4" />
            </HeroPrimaryCta>
            <HeroSecondaryCta href="#experience">
              <span className="flex size-7 items-center justify-center rounded-full bg-white text-[#0d0618]">
                <Play className="ml-0.5 size-3.5 fill-current" />
              </span>
              Explore YO Voice
            </HeroSecondaryCta>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="mt-6 flex max-w-[620px] flex-wrap justify-center gap-2 text-[11px] font-semibold text-white/55 lg:justify-start"
            aria-label="YO Voice highlights"
          >
            {[
              { icon: Mic2, label: "Live voice rooms" },
              { icon: HouseHeart, label: "Private Family Rooms" },
              { icon: UsersRound, label: "Clubs & community chats" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5"
              >
                <Icon className="size-3.5 text-fuchsia-200/75" aria-hidden="true" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* The scene: logo, orbit and people around it, with the preview
            attached to the base. It sits beside the promise on desktop so
            visitors see both the meaning and the product in one viewport. */}
        <div className="relative mx-auto mt-12 w-full max-w-[300px] sm:mt-16 sm:max-w-[520px] md:max-w-[600px] lg:mt-0 lg:max-w-[560px] xl:max-w-[600px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-square w-full"
          >
            <OrbitSystem />

            <div className="absolute inset-0 flex items-center justify-center">
              <CenterLogo />
            </div>

            <OrbitingMembers members={members} activeId={activeMember.id} />
          </motion.div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,92,246,.12),transparent_65%)]" />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-30 mx-auto -mt-16 flex justify-center px-3 sm:-mt-24"
          >
            <LiveConversationCard
              speakerName={activeMember.name}
              speakerAvatar={activeMember.avatar}
              equalizer={activeMember.equalizer}
              listeners={activeMember.listeners}
            />
          </motion.div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-16 lg:absolute lg:inset-x-0 lg:bottom-3 lg:p-0">
        <motion.a
          href="#stats"
          whileHover={{ y: 2 }}
          className="focus-ring mx-auto flex size-10 items-center justify-center text-white/30 transition hover:text-white/60"
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
