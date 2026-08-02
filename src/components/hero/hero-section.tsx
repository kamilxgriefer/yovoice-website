"use client";

import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  Mic2,
  Play,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const members = [
  {
    name: "Maya",
    initial: "M",
    position: "left-[4%] top-[25%] sm:left-[8%]",
    delay: 0,
  },
  {
    name: "Alex",
    initial: "A",
    position: "right-[4%] top-[19%] sm:right-[8%]",
    delay: 0.3,
  },
  {
    name: "Luna",
    initial: "L",
    position: "bottom-[17%] left-[11%] sm:left-[16%]",
    delay: 0.6,
  },
  {
    name: "Noah",
    initial: "N",
    position: "bottom-[14%] right-[9%] sm:right-[15%]",
    delay: 0.9,
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-20">
      <div className="grid-background absolute inset-0 opacity-60" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.045]" />

      <div className="absolute left-[-15%] top-[24%] size-[460px] rounded-full bg-violet-700/20 blur-[120px]" />
      <div className="absolute right-[-12%] top-[10%] size-[520px] rounded-full bg-fuchsia-600/15 blur-[140px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 max-w-2xl"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">
            <Sparkles className="size-4" />
            A new way to connect
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl lg:text-[74px]">
            Your voice.
            <span className="text-gradient mt-2 block">Your community.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-white/60 sm:text-lg">
            Meet people who share your world. Join live conversations, build
            clubs, grow communities and create moments that feel genuinely
            human.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/download"
              className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 px-7 font-bold text-white shadow-[0_18px_60px_rgba(138,43,226,0.38)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(192,38,255,0.46)]"
            >
              Download YO Voice
              <ArrowRight className="size-5" />
            </Link>

            <button
              type="button"
              className="focus-ring inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-7 font-semibold text-white backdrop-blur-xl transition hover:border-white/25 hover:bg-white/10"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#0d0618]">
                <Play className="ml-0.5 size-4 fill-current" />
              </span>
              Watch experience
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 text-sm text-white/45">
            <span className="flex items-center gap-2">
              <Radio className="size-4 text-fuchsia-400" />
              Live rooms
            </span>

            <span className="flex items-center gap-2">
              <Users className="size-4 text-violet-400" />
              Clubs and friends
            </span>

            <span className="flex items-center gap-2">
              <Headphones className="size-4 text-pink-400" />
              Made for real conversations
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.12, ease: "easeOut" }}
          className="relative mx-auto aspect-square w-full max-w-[650px]"
          id="community"
        >
          <div className="absolute inset-[4%] rounded-full border border-violet-300/[0.08]" />
          <div className="absolute inset-[16%] rounded-full border border-fuchsia-300/[0.12]" />
          <div className="absolute inset-[29%] rounded-full border border-purple-300/[0.18]" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[10%] rounded-full border border-dashed border-white/[0.07]"
          />

          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[37%] flex items-center justify-center rounded-full border border-fuchsia-200/40 bg-gradient-to-br from-violet-700 via-purple-500 to-fuchsia-500 shadow-[0_0_110px_rgba(192,38,255,0.52)]"
          >
            <div className="absolute inset-[-70%] rounded-full bg-fuchsia-500/10 blur-3xl" />
            <Mic2 className="relative size-14 text-white sm:size-16" />
          </motion.div>

          {members.map((member, index) => (
            <motion.div
              key={member.name}
              animate={{
                y: [0, index % 2 === 0 ? -10 : 10, 0],
              }}
              transition={{
                duration: 3.8 + index * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: member.delay,
              }}
              className={`absolute ${member.position}`}
            >
              <div className="relative">
                {index === 0 ? (
                  <>
                    <span className="absolute inset-[-14px] animate-ping rounded-full border border-fuchsia-400/20" />
                    <span className="absolute inset-[-8px] rounded-full border border-fuchsia-300/40" />
                  </>
                ) : (
                  <span className="absolute inset-[-7px] rounded-full border border-white/10" />
                )}

                <div className="glass-panel flex size-14 items-center justify-center rounded-full border-fuchsia-300/25 bg-gradient-to-br from-[#35204d] to-[#160b25] text-sm font-bold text-white shadow-[0_0_34px_rgba(192,38,255,0.22)] sm:size-16">
                  {member.initial}
                </div>

                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-white/45">
                  {member.name}
                </span>
              </div>
            </motion.div>
          ))}

          <div className="glass-panel absolute bottom-[1%] left-1/2 w-[230px] -translate-x-1/2 rounded-2xl px-5 py-4 text-center sm:bottom-[4%]">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-fuchsia-300">
              Heart of the Community
            </p>
            <p className="mt-1.5 text-sm font-semibold text-white">
              Maya is speaking
            </p>

            <div className="mt-3 flex h-5 items-end justify-center gap-1">
              {[10, 18, 13, 20, 15, 8, 17, 11].map((height, index) => (
                <motion.span
                  key={`${height}-${index}`}
                  animate={{ height: [5, height, 5] }}
                  transition={{
                    duration: 0.7 + index * 0.08,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-300"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
