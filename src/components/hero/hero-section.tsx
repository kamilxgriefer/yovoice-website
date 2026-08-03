"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  Globe2,
  Monitor,
  Play,
  Radio,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import { StarField } from "@/components/animations/star-field";

type Member = {
  name: string;
  avatar: string;
  position: string;
  delay: number;
  active?: boolean;
  status: string;
  message: string;
  bubble: string;
};

const members: Member[] = [
  {
    name: "Maya",
    avatar: "/avatars/maya.jpg",
    position: "left-[5%] top-[13%]",
    delay: 0,
    active: true,
    status: "bg-emerald-400",
    message: "Hey everyone! 👋",
    bubble: "left-1/2 -translate-x-1/2",
  },
  {
    name: "Alex",
    avatar: "/avatars/alex.jpg",
    position: "right-[4%] top-[18%]",
    delay: 0.4,
    status: "bg-emerald-400",
    message: "Great to be here! 🚀",
    bubble: "right-[-22px]",
  },
  {
    name: "Luna",
    avatar: "/avatars/luna.jpg",
    position: "bottom-[8%] left-[11%]",
    delay: 0.8,
    status: "bg-amber-300",
    message: "Let's go! 💜",
    bubble: "left-1/2 -translate-x-1/2",
  },
  {
    name: "Noah",
    avatar: "/avatars/noah.jpg",
    position: "bottom-[6%] right-[8%]",
    delay: 1.2,
    status: "bg-emerald-400",
    message: "Awesome talk! 🔥",
    bubble: "right-[-18px]",
  },
];

const platforms = [
  { label: "iOS & Android", icon: Smartphone },
  { label: "Windows & macOS", icon: Monitor },
  { label: "Web", icon: Globe2 },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20">
      <StarField />
      <div className="grid-background absolute inset-0 opacity-25" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_36%,rgba(192,38,255,.22),transparent_29%),radial-gradient(circle_at_18%_28%,rgba(88,28,135,.14),transparent_33%)]" />

      <div className="relative mx-auto grid min-h-[625px] w-full max-w-[1320px] items-center gap-6 px-5 pb-5 pt-7 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 max-w-[535px]"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-100">
            <Sparkles className="size-4" />
            The future of voice communities
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-white sm:text-6xl xl:text-[66px]">
            <span className="block">Your voice.</span>
            <span className="text-gradient mt-2 block">Your community.</span>
          </h1>

          <p className="mt-6 max-w-[500px] text-[15px] leading-7 text-white/62">
            Where conversations become communities. Meet people who understand
            your world, speak freely and build something meaningful together.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#download" className="premium-button focus-ring min-h-12 px-6 text-sm">
              <span className="relative">Download YO Voice</span>
              <ArrowDown className="relative size-4" />
            </Link>
            <Link
              href="#experience"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.035] px-6 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#0d0618]">
                <Play className="ml-0.5 size-4 fill-current" />
              </span>
              Watch experience
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-white/50">
            <span className="flex items-center gap-2"><Radio className="size-4 text-fuchsia-400" />Live voice rooms</span>
            <span className="flex items-center gap-2"><Users className="size-4 text-violet-400" />Clubs and friends</span>
            <span className="flex items-center gap-2"><Sparkles className="size-4 text-pink-400" />Built for creators</span>
          </div>

          <div className="mt-8">
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
          id="community"
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.1, ease: "easeOut" }}
          className="relative mx-auto aspect-[1.16/1] w-full max-w-[690px]"
        >
          <div className="absolute inset-[7%] rounded-full border border-fuchsia-300/[0.13]" />
          <div className="absolute inset-[18%] rounded-full border border-fuchsia-300/[0.16]" />
          <div className="absolute inset-[31%] rounded-full border border-fuchsia-300/[0.2]" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[12%] rounded-full border border-dashed border-fuchsia-300/[0.16]"
          />

          <div className="absolute left-1/2 top-1/2 h-[2px] w-[54%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent shadow-[0_0_22px_rgba(232,121,249,.48)]" />

          <motion.div
            animate={{
              scale: [1, 1.045, 1],
              filter: ["brightness(1)", "brightness(1.15)", "brightness(1)"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[39%] flex items-center justify-center rounded-full border border-fuchsia-200/35 bg-[#09030f] shadow-[0_0_115px_rgba(192,38,255,.6)]"
          >
            <motion.span
              className="absolute inset-[-22%] rounded-full border border-fuchsia-300/16"
              animate={{ scale: [0.82, 1.28], opacity: [0.55, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            />
            <Image
              src="/logos/yovoice-logo.png"
              alt="YO Voice community heart"
              fill
              className="rounded-full object-cover mix-blend-screen"
              priority
            />
          </motion.div>

          {members.map((member, index) => (
            <motion.div
              key={member.name}
              animate={{
                y: [0, index % 2 === 0 ? -7 : 7, 0],
                x: [0, index % 2 === 0 ? 4 : -4, 0],
              }}
              transition={{
                duration: 4 + index * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: member.delay,
              }}
              className={`absolute ${member.position}`}
            >
              <div className="relative">
                <motion.div
                  animate={{ opacity: [0, 1, 1, 0], y: [7, 0, 0, -5] }}
                  transition={{
                    duration: 5.6,
                    repeat: Infinity,
                    delay: member.delay * 1.9 + 0.5,
                    times: [0, 0.12, 0.82, 1],
                  }}
                  className={`absolute bottom-[calc(100%+14px)] z-20 whitespace-nowrap rounded-2xl border border-white/10 bg-[#171022]/94 px-4 py-3 text-[11px] font-medium text-white shadow-[0_14px_38px_rgba(0,0,0,.35)] backdrop-blur-xl ${member.bubble}`}
                >
                  {member.message}
                  <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[#171022]" />
                </motion.div>

                {member.active && (
                  <>
                    <motion.span
                      className="absolute inset-[-18px] rounded-full border border-fuchsia-300/30"
                      animate={{ scale: [0.82, 1.52], opacity: [0.8, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.span
                      className="absolute inset-[-10px] rounded-full border border-fuchsia-300/35"
                      animate={{ scale: [0.9, 1.8], opacity: [0.66, 0] }}
                      transition={{ duration: 2.2, delay: 0.45, repeat: Infinity, ease: "easeOut" }}
                    />
                  </>
                )}

                <div className="relative size-[70px] overflow-hidden rounded-full border-2 border-fuchsia-300/60 bg-[#150c22] p-[3px] shadow-[0_0_30px_rgba(192,38,255,.48)]">
                  <Image
                    src={member.avatar}
                    alt={`${member.name} avatar`}
                    fill
                    className="rounded-full object-cover"
                    sizes="70px"
                  />
                  <span className={`absolute bottom-0 right-0 size-4 rounded-full border-[3px] border-[#12091e] ${member.status}`} />
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-white/62">
                  {member.name}
                </span>
              </div>
            </motion.div>
          ))}

          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="glass-panel absolute bottom-[11%] left-1/2 w-[235px] -translate-x-1/2 rounded-2xl px-5 py-4 text-center"
          >
            <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-fuchsia-300/80">
              Heart of the Community
            </p>
            <p className="mt-1.5 text-sm font-semibold text-white">Maya is speaking</p>
            <div className="mt-3 flex h-5 items-end justify-center gap-1">
              {[10, 18, 13, 20, 15, 8, 17, 11, 14, 19].map((height, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [5, height, 5] }}
                  transition={{ duration: 0.65 + i * 0.05, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-300"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 pb-5 sm:px-8 lg:px-10">
        <a
          href="#stats"
          className="focus-ring mx-auto flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/60 transition hover:bg-white/[0.07] hover:text-white"
          aria-label="Scroll to statistics"
        >
          <ArrowDown className="size-4" />
        </a>
      </div>
    </section>
  );
}
