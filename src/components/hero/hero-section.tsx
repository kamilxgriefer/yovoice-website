"use client";

import Image from "next/image";
import Link from "next/link";
import {
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
  initials: string;
  position: string;
  delay: number;
  active: boolean;
  gradient: string;
  statusColor: string;
};

const members: Member[] = [
  {
    name: "Maya",
    initials: "MA",
    position: "left-[2%] top-[24%] sm:left-[7%]",
    delay: 0,
    active: true,
    gradient: "from-fuchsia-500 via-purple-500 to-violet-700",
    statusColor: "bg-emerald-400",
  },
  {
    name: "Alex",
    initials: "AX",
    position: "right-[2%] top-[17%] sm:right-[7%]",
    delay: 0.3,
    active: false,
    gradient: "from-cyan-500 via-blue-500 to-violet-700",
    statusColor: "bg-emerald-400",
  },
  {
    name: "Luna",
    initials: "LU",
    position: "bottom-[17%] left-[9%] sm:left-[15%]",
    delay: 0.6,
    active: false,
    gradient: "from-pink-500 via-rose-500 to-purple-700",
    statusColor: "bg-amber-300",
  },
  {
    name: "Noah",
    initials: "NO",
    position: "bottom-[14%] right-[7%] sm:right-[14%]",
    delay: 0.9,
    active: false,
    gradient: "from-violet-500 via-indigo-500 to-blue-700",
    statusColor: "bg-emerald-400",
  },
];

const platforms = [
  {
    label: "iOS & Android",
    icon: Smartphone,
  },
  {
    label: "Windows & macOS",
    icon: Monitor,
  },
  {
    label: "Web",
    icon: Globe2,
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-20">
      <StarField />

      <div className="grid-background absolute inset-0 opacity-45" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.04]" />

      <div className="absolute left-[-18%] top-[26%] size-[520px] rounded-full bg-violet-700/20 blur-[140px]" />
      <div className="absolute right-[-14%] top-[5%] size-[620px] rounded-full bg-fuchsia-600/15 blur-[160px]" />
      <div className="absolute bottom-[-32%] left-[30%] size-[560px] rounded-full bg-purple-800/20 blur-[160px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 lg:px-10 lg:py-24 xl:grid-cols-[0.98fr_1.02fr] xl:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.75,
            ease: "easeOut",
          }}
          className="relative z-10 max-w-[650px]"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">
            <Sparkles className="size-4" />
            The future of voice communities
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.94] tracking-[-0.058em] text-white sm:text-6xl lg:text-[68px] xl:text-[76px]">
            <span className="block">Your voice.</span>

            <span className="text-gradient mt-2 block xl:whitespace-nowrap">
              Your community.
            </span>
          </h1>

          <p className="mt-8 max-w-[590px] text-base leading-8 text-white/60 sm:text-lg">
            YO Voice brings creators, friends and communities together through
            live conversations that feel natural, personal and genuinely human.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="#download"
              className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 px-7 font-bold text-white shadow-[0_18px_65px_rgba(138,43,226,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_75px_rgba(192,38,255,0.48)]"
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

          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-4 text-sm text-white/45">
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
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/30">
              Available across your devices
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;

                return (
                  <div
                    key={platform.label}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-xs text-white/50 backdrop-blur-xl transition hover:border-fuchsia-300/20 hover:text-white/70"
                  >
                    <Icon className="size-3.5 text-fuchsia-300" />
                    {platform.label}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          id="community"
          initial={{ opacity: 0, scale: 0.91 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.9,
            delay: 0.12,
            ease: "easeOut",
          }}
          className="relative mx-auto aspect-square w-full max-w-[660px]"
        >
          <div className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle,rgba(192,38,255,0.08),transparent_65%)]" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 80,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[3%] rounded-full border border-violet-300/[0.08]"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 58,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[15%] rounded-full border border-dashed border-fuchsia-300/[0.12]"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 38,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[28%] rounded-full border border-purple-300/[0.18]"
          />

          <svg
            className="pointer-events-none absolute inset-0 size-full"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="speakerConnection"
                x1="19"
                y1="31"
                x2="50"
                y2="50"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#E879F9" stopOpacity="0.7" />
                <stop offset="1" stopColor="#A855F7" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <motion.path
              d="M20 31 C 30 34, 37 42, 46 48"
              stroke="url(#speakerConnection)"
              strokeWidth="0.35"
              strokeLinecap="round"
              strokeDasharray="2 2"
              animate={{
                strokeDashoffset: [8, 0],
                opacity: [0.3, 0.9, 0.3],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </svg>

          <motion.div
            animate={{
              scale: [1, 1.055, 1],
              filter: [
                "brightness(1)",
                "brightness(1.15)",
                "brightness(1)",
              ],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-[35%] flex items-center justify-center rounded-full border border-fuchsia-200/25 bg-gradient-to-br from-[#241033] via-[#12071c] to-[#09030e] p-[7%] shadow-[0_0_130px_rgba(192,38,255,0.48)]"
          >
            <div className="absolute inset-[-80%] rounded-full bg-fuchsia-500/10 blur-3xl" />

            <div className="absolute inset-[5%] rounded-full border border-fuchsia-300/10 bg-fuchsia-400/[0.025]" />

            <motion.div
              animate={{ rotate: [0, 1.5, -1.5, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative size-full overflow-hidden rounded-full"
            >
              <Image
                src="/logos/yovoice-logo.png"
                alt="YO Voice community heart"
                width={220}
                height={220}
                className="size-full scale-[1.06] object-cover mix-blend-screen"
                priority
              />
            </motion.div>
          </motion.div>

          {members.map((member, index) => (
            <motion.div
              key={member.name}
              animate={{
                y: [0, index % 2 === 0 ? -10 : 10, 0],
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
                {member.active ? (
                  <>
                    <motion.span
                      className="absolute inset-[-18px] rounded-full border border-fuchsia-300/25"
                      animate={{
                        scale: [0.8, 1.5],
                        opacity: [0.8, 0],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />

                    <motion.span
                      className="absolute inset-[-10px] rounded-full border border-fuchsia-300/30"
                      animate={{
                        scale: [0.9, 1.75],
                        opacity: [0.65, 0],
                      }}
                      transition={{
                        duration: 2.2,
                        delay: 0.45,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  </>
                ) : (
                  <span className="absolute inset-[-7px] rounded-full border border-white/10" />
                )}

                <div
                  className={`relative flex size-14 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br ${member.gradient} text-[11px] font-extrabold tracking-[0.08em] text-white shadow-[0_12px_35px_rgba(0,0,0,0.38)] sm:size-16`}
                >
                  <span className="absolute inset-[3px] rounded-full border border-white/10 bg-black/10" />

                  <span className="relative">{member.initials}</span>

                  <span
                    className={`absolute bottom-0 right-0 size-3.5 rounded-full border-[3px] border-[#12091e] ${member.statusColor}`}
                    aria-label={`${member.name} status`}
                  />
                </div>

                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-white/48">
                  {member.name}
                </span>
              </div>
            </motion.div>
          ))}

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="glass-panel absolute bottom-[2%] left-1/2 w-[226px] -translate-x-1/2 rounded-2xl px-5 py-4 text-center sm:bottom-[5%] sm:w-[236px]"
          >
            <div className="mx-auto mb-2 flex w-fit items-center gap-2 rounded-full bg-fuchsia-400/10 px-2.5 py-1">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
                Live conversation
              </span>
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-fuchsia-300/75">
              Heart of the Community
            </p>

            <p className="mt-1.5 text-sm font-semibold text-white">
              Maya is speaking
            </p>

            <div className="mt-3 flex h-5 items-end justify-center gap-1">
              {[10, 18, 13, 20, 15, 8, 17, 11].map((height, index) => (
                <motion.span
                  key={`${height}-${index}`}
                  animate={{
                    height: [5, height, 5],
                  }}
                  transition={{
                    duration: 0.65 + index * 0.08,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-300"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0712] to-transparent" />
    </section>
  );
}