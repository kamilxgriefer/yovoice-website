"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
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
};

const members: Member[] = [
  {
    name: "Maya",
    avatar: "/avatars/maya.jpg",
    position: "left-[2%] top-[17%]",
    delay: 0,
    active: true,
    status: "bg-emerald-400",
    message: "Hey everyone! 👋",
  },
  {
    name: "Alex",
    avatar: "/avatars/alex.jpg",
    position: "right-[2%] top-[20%]",
    delay: 0.4,
    status: "bg-emerald-400",
    message: "Great to be here! 🚀",
  },
  {
    name: "Luna",
    avatar: "/avatars/luna.jpg",
    position: "bottom-[11%] left-[10%]",
    delay: 0.8,
    status: "bg-amber-300",
    message: "Let's go! 💜",
  },
  {
    name: "Noah",
    avatar: "/avatars/noah.jpg",
    position: "bottom-[9%] right-[7%]",
    delay: 1.2,
    status: "bg-emerald-400",
    message: "Awesome talk! 🔥",
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
      <div className="grid-background absolute inset-0 opacity-30" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[.035]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_38%,rgba(192,38,255,.18),transparent_30%),radial-gradient(circle_at_20%_24%,rgba(88,28,135,.12),transparent_32%)]" />

      <div className="relative mx-auto grid min-h-[740px] w-full max-w-[1480px] items-center gap-10 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[.83fr_1.17fr] lg:px-12 lg:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .75, ease: "easeOut" }}
          className="relative z-10 max-w-[620px]"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-fuchsia-100">
            <Sparkles className="size-4" />
            The future of voice communities
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[.95] tracking-[-.06em] text-white sm:text-6xl xl:text-[78px]">
            <span className="block">Your voice.</span>
            <span className="text-gradient mt-2 block">Your community.</span>
          </h1>

          <p className="mt-7 max-w-[575px] text-base leading-8 text-white/60 sm:text-lg">
            Where conversations become communities. Meet people who understand your world, speak freely and build something meaningful together.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="#download" className="premium-button focus-ring min-h-14 px-7">
              <span className="relative">Download YO Voice</span>
              <ArrowDown className="relative size-5" />
            </Link>
            <Link href="#experience" className="focus-ring inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[.035] px-7 font-semibold text-white backdrop-blur-xl transition hover:border-white/25 hover:bg-white/[.07]">
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#0d0618]">
                <Play className="ml-0.5 size-4 fill-current" />
              </span>
              Watch experience
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-4 text-sm text-white/50">
            <span className="flex items-center gap-2"><Radio className="size-4 text-fuchsia-400" />Live voice rooms</span>
            <span className="flex items-center gap-2"><Users className="size-4 text-violet-400" />Clubs and friends</span>
            <span className="flex items-center gap-2"><Sparkles className="size-4 text-pink-400" />Built for creators</span>
          </div>

          <div className="mt-10">
            <p className="text-[10px] font-bold uppercase tracking-[.24em] text-white/30">Available across your devices</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {platforms.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-white/[.09] bg-white/[.035] px-3.5 py-2 text-xs text-white/55 backdrop-blur-xl">
                  <Icon className="size-3.5 text-fuchsia-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          id="community"
          initial={{ opacity: 0, scale: .92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .9, delay: .12, ease: "easeOut" }}
          className="relative mx-auto aspect-[1.12/1] w-full max-w-[780px]"
        >
          <div className="absolute inset-[8%] rounded-full border border-fuchsia-300/[.12]" />
          <div className="absolute inset-[19%] rounded-full border border-fuchsia-300/[.15]" />
          <div className="absolute inset-[31%] rounded-full border border-fuchsia-300/[.18]" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[13%] rounded-full border border-dashed border-fuchsia-300/[.16]"
          />

          <div className="absolute left-1/2 top-1/2 h-[2px] w-[53%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-fuchsia-400/55 to-transparent shadow-[0_0_20px_rgba(232,121,249,.45)]" />

          <motion.div
            animate={{ scale: [1, 1.055, 1], filter: ["brightness(1)", "brightness(1.18)", "brightness(1)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[37%] flex items-center justify-center rounded-full border border-fuchsia-200/35 bg-[#09030f] shadow-[0_0_130px_rgba(192,38,255,.58)]"
          >
            <motion.span className="absolute inset-[-22%] rounded-full border border-fuchsia-300/15" animate={{ scale: [.82, 1.28], opacity: [.55, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }} />
            <motion.span className="absolute inset-[-42%] rounded-full border border-violet-300/10" animate={{ scale: [.8, 1.2], opacity: [.35, 0] }} transition={{ duration: 3.2, delay: .7, repeat: Infinity, ease: "easeOut" }} />
            <Image src="/logos/yovoice-logo.png" alt="YO Voice community heart" fill className="rounded-full object-cover mix-blend-screen" priority />
          </motion.div>

          {members.map((member, index) => (
            <motion.div
              key={member.name}
              animate={{ y: [0, index % 2 === 0 ? -8 : 8, 0], x: [0, index % 2 === 0 ? 4 : -4, 0] }}
              transition={{ duration: 4 + index * .35, repeat: Infinity, ease: "easeInOut", delay: member.delay }}
              className={`absolute ${member.position}`}
            >
              <div className="relative">
                <motion.div
                  animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -5] }}
                  transition={{ duration: 5.4, repeat: Infinity, delay: member.delay * 1.8 + .6, times: [0, .12, .82, 1] }}
                  className={`absolute bottom-[calc(100%+16px)] z-20 whitespace-nowrap rounded-2xl border border-white/10 bg-[#171022]/92 px-4 py-3 text-xs font-medium text-white shadow-[0_14px_38px_rgba(0,0,0,.35)] backdrop-blur-xl ${
                    index % 2 === 0 ? "left-1/2 -translate-x-1/2" : "right-0"
                  }`}
                >
                  {member.message}
                  <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[#171022]" />
                </motion.div>

                {member.active && (
                  <>
                    <motion.span className="absolute inset-[-20px] rounded-full border border-fuchsia-300/30" animate={{ scale: [.82, 1.55], opacity: [.85, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
                    <motion.span className="absolute inset-[-11px] rounded-full border border-fuchsia-300/35" animate={{ scale: [.9, 1.85], opacity: [.68, 0] }} transition={{ duration: 2.25, delay: .45, repeat: Infinity, ease: "easeOut" }} />
                  </>
                )}

                <div className="relative size-[76px] overflow-hidden rounded-full border-2 border-fuchsia-300/55 bg-[#150c22] p-[3px] shadow-[0_0_30px_rgba(192,38,255,.45)]">
                  <Image src={member.avatar} alt={`${member.name} avatar`} fill className="rounded-full object-cover" />
                  <span className={`absolute bottom-0 right-0 size-4 rounded-full border-[3px] border-[#12091e] ${member.status}`} />
                </div>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-white/62">{member.name}</span>
              </div>
            </motion.div>
          ))}

          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="glass-panel absolute bottom-[14%] left-1/2 w-[255px] -translate-x-1/2 rounded-2xl px-5 py-4 text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-fuchsia-300/80">Heart of the Community</p>
            <p className="mt-1.5 text-sm font-semibold text-white">Maya is speaking</p>
            <div className="mt-3 flex h-5 items-end justify-center gap-1">
              {[10, 18, 13, 20, 15, 8, 17, 11, 14, 19].map((height, i) => (
                <motion.span key={i} animate={{ height: [5, height, 5] }} transition={{ duration: .65 + i * .05, repeat: Infinity, ease: "easeInOut" }} className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-300" />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-[1420px] px-5 pb-8 sm:px-8 lg:px-12">
        <a href="#stats" className="focus-ring mx-auto flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.035] text-white/60 transition hover:bg-white/[.07] hover:text-white" aria-label="Scroll to statistics">
          <ArrowDown className="size-5" />
        </a>
      </div>
    </section>
  );
}
