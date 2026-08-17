"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
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
    <section className="relative overflow-hidden pt-28 sm:pt-40">
      <DeepSpaceBackground />

      {/* The eye moves: headline -> CTAs -> hero center -> avatars ->
          live widget -> stats (below). Every block here is centered on
          that single vertical line, on purpose — one scene, not a stack
          of independent components. */}
      <div className="relative mx-auto flex w-full max-w-[860px] flex-col items-center px-5 text-center sm:px-8">
        {/* Not a category label — a sign of life. The first thing anyone
            reads should already feel like a room full of people, not a
            product description.

            This was "2,481 people talking right now", hardcoded. It read as
            a sign of life and was a string literal. LiveStats replaces it
            with real figures from publicStats/live, and renders nothing at
            all when there is nothing true to say — which on a pre-launch
            product is most of the time, and is the honest outcome. */}
        <LiveStats />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-[1.03] tracking-[-0.035em] text-white sm:text-7xl xl:text-[6.4rem]"
        >
          <span className="block">Your voice.</span>
          <span className="text-gradient mt-1 block">Your community.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-5 max-w-[400px] text-[15px] leading-[1.65] text-white/50 sm:mt-7 sm:leading-[1.85]"
        >
          Somewhere right now, someone is telling a story, making a friend,
          or hosting a room full of people who get it. Come listen in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-9 flex flex-col items-center gap-3.5 sm:flex-row"
        >
          {/* Using YO Voice means opening the web app — one click, no
              detour through a downloads section. A visitor with a live
              session goes straight there; everyone else goes through the
              existing sign-in and is returned to the app afterwards
              (resolveAuthRedirect handles ?redirect=/app). Native
              downloads stay a SECONDARY choice until they exist. */}
          <HeroPrimaryCta
            href={
              authLoading || user
                ? APP_ENTRY_PATH
                : `/login?redirect=${APP_ENTRY_PATH}`
            }
          >
            Open YO Voice
            <ArrowRight className="size-4" />
          </HeroPrimaryCta>
          <HeroSecondaryCta href="#experience">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[#0d0618]">
              <Play className="ml-0.5 size-3.5 fill-current" />
            </span>
            Watch experience
          </HeroSecondaryCta>
        </motion.div>
      </div>

      {/* The scene: logo, orbit and the people around it, with the live
          widget pulled up to overlap its base — physically attached to
          the center rather than a separate card stacked below it. */}
      <div className="relative mx-auto mt-12 w-full max-w-[300px] sm:mt-20 sm:max-w-[520px] md:max-w-[600px] lg:max-w-[680px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square w-full"
        >
          <OrbitSystem />

          <div className="absolute inset-0 flex items-center justify-center">
            <CenterLogo />
          </div>

          <OrbitingMembers members={members} activeId={activeMember.id} />
        </motion.div>

        {/* The light bridging logo and widget — one glow, not a new
            element, so the two read as parts of the same object. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,92,246,.12),transparent_65%)]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30 mx-auto -mt-16 flex justify-center px-5 sm:-mt-24"
        >
          <LiveConversationCard
            speakerName={activeMember.name}
            speakerAvatar={activeMember.avatar}
            equalizer={activeMember.equalizer}
            listeners={activeMember.listeners}
          />
        </motion.div>
      </div>

      {/* No device/logistics line here on purpose — that's what the
          download section further down is for. The hero's job is the
          feeling, not the spec sheet. */}
      <div className="relative mx-auto max-w-[1400px] px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-20 lg:px-12">
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
