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
  Waves,
} from "lucide-react";
import { motion } from "framer-motion";

import { StarField } from "@/components/animations/star-field";
import { AvatarPortrait } from "@/components/ui/avatar-portrait";

type Member = {
  name: string;
  variant: "maya" | "alex" | "luna" | "noah";
  position: string;
  delay: number;
  active: boolean;
  statusColor: string;
};

const members: Member[] = [
  {
    name: "Maya",
    variant: "maya",
    position: "left-[1%] top-[22%] sm:left-[6%]",
    delay: 0,
    active: true,
    statusColor: "bg-emerald-400",
  },
  {
    name: "Alex",
    variant: "alex",
    position: "right-[1%] top-[16%] sm:right-[6%]",
    delay: 0.3,
    active: false,
    statusColor: "bg-emerald-400",
  },
  {
    name: "Luna",
    variant: "luna",
    position: "bottom-[15%] left-[8%] sm:left-[14%]",
    delay: 0.6,
    active: false,
    statusColor: "bg-amber-300",
  },
  {
    name: "Noah",
    variant: "noah",
    position: "bottom-[13%] right-[6%] sm:right-[13%]",
    delay: 0.9,
    active: false,
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
    <section className="relative min-h-[1100px] overflow-hidden pt-20 lg:min-h-screen">
      <StarField />

      <div className="grid-background absolute inset-0 opacity-45" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.038]" />

      <div className="cosmic-cloud cosmic-cloud-left" />
      <div className="cosmic-cloud cosmic-cloud-right" />
      <div className="cosmic-cloud cosmic-cloud-bottom" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[1440px] items-center gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 lg:px-12 lg:py-28 xl:grid-cols-[0.98fr_1.02fr] xl:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.75,
            ease: "easeOut",
          }}
          className="relative z-10 max-w-[670px]"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">
            <Sparkles className="size-4" />
            The future of voice communities
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.93] tracking-[-0.058em] text-white sm:text-6xl lg:text-[68px] xl:text-[78px]">
            <span className="block">Your voice.</span>

            <span className="text-gradient mt-2 block xl:whitespace-nowrap">
              Your community.
            </span>
          </h1>

          <p className="mt-8 max-w-[620px] text-base leading-8 text-white/60 sm:text-lg">
            Where conversations become communities. Meet people who understand
            your world, speak freely and build something meaningful together.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="#download"
              className="focus-ring group relative inline-flex min-h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 px-7 font-bold text-white shadow-[0_18px_65px_rgba(138,43,226,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_78px_rgba(192,38,255,0.5)]"
            >
              <span className="absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-[130%]" />
              <span className="relative">Download YO Voice</span>
              <ArrowRight className="relative size-5 transition group-hover:translate-x-1" />
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

          <div className="mt-11">
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
          className="relative mx-auto aspect-square w-full max-w-[700px]"
        >
          <div className="absolute inset-[3%] rounded-full bg-[radial-gradient(circle,rgba(192,38,255,0.12),transparent_66%)]" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 82,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[2%] rounded-full border border-violet-300/[0.09]"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 59,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[14%] rounded-full border border-dashed border-fuchsia-300/[0.14]"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 38,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[27%] rounded-full border border-purple-300/[0.2]"
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
                x1="18"
                y1="29"
                x2="50"
                y2="50"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#F0ABFC" stopOpacity="0.95" />
                <stop offset="1" stopColor="#A855F7" stopOpacity="0.05" />
              </linearGradient>

              <linearGradient
                id="networkConnection"
                x1="50"
                y1="50"
                x2="80"
                y2="27"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#A855F7" stopOpacity="0.15" />
                <stop offset="1" stopColor="#60A5FA" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            <motion.path
              d="M18 29 C 29 32, 37 41, 47 48"
              stroke="url(#speakerConnection)"
              strokeWidth="0.45"
              strokeLinecap="round"
              strokeDasharray="2.4 2.4"
              animate={{
                strokeDashoffset: [10, 0],
                opacity: [0.35, 1, 0.35],
              }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <motion.path
              d="M52 48 C 62 40, 72 33, 82 27"
              stroke="url(#networkConnection)"
              strokeWidth="0.3"
              strokeLinecap="round"
              strokeDasharray="1.8 2.8"
              animate={{
                strokeDashoffset: [8, 0],
                opacity: [0.15, 0.6, 0.15],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <motion.path
              d="M48 53 C 40 65, 33 72, 25 78"
              stroke="url(#speakerConnection)"
              strokeWidth="0.25"
              strokeLinecap="round"
              strokeDasharray="1.5 3"
              animate={{
                strokeDashoffset: [7, 0],
                opacity: [0.12, 0.45, 0.12],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </svg>

          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              filter: [
                "brightness(1)",
                "brightness(1.2)",
                "brightness(1)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-[34%] flex items-center justify-center rounded-full border border-fuchsia-200/30 bg-gradient-to-br from-[#2c123d] via-[#13071e] to-[#08030d] p-[7%] shadow-[0_0_150px_rgba(192,38,255,0.55)]"
          >
            <motion.span
              className="absolute inset-[-20%] rounded-full border border-fuchsia-300/12"
              animate={{
                scale: [0.8, 1.25],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />

            <motion.span
              className="absolute inset-[-38%] rounded-full border border-violet-300/10"
              animate={{
                scale: [0.78, 1.18],
                opacity: [0.35, 0],
              }}
              transition={{
                duration: 3.3,
                delay: 0.7,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />

            <div className="absolute inset-[-90%] rounded-full bg-fuchsia-500/12 blur-3xl" />
            <div className="absolute inset-[4%] rounded-full border border-fuchsia-300/10 bg-fuchsia-400/[0.03]" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-[-7%] rounded-full border border-dashed border-fuchsia-300/18"
            />

            <motion.div
              animate={{ rotate: [0, 1.8, -1.8, 0] }}
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
                width={240}
                height={240}
                className="size-full scale-[1.04] object-cover mix-blend-screen"
                priority
              />
            </motion.div>

            <motion.div
              className="absolute -bottom-5 flex items-center gap-1 rounded-full border border-fuchsia-300/15 bg-[#14091f]/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.17em] text-fuchsia-200 backdrop-blur-xl"
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 2.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Waves className="size-3" />
              Community energy
            </motion.div>
          </motion.div>

          {members.map((member, index) => (
            <motion.div
              key={member.name}
              animate={{
                y: [0, index % 2 === 0 ? -11 : 11, 0],
                x: [0, index % 2 === 0 ? 5 : -5, 0],
              }}
              transition={{
                duration: 4 + index * 0.4,
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
                      className="absolute inset-[-20px] rounded-full border border-fuchsia-300/30"
                      animate={{
                        scale: [0.8, 1.55],
                        opacity: [0.85, 0],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />

                    <motion.span
                      className="absolute inset-[-11px] rounded-full border border-fuchsia-300/35"
                      animate={{
                        scale: [0.9, 1.85],
                        opacity: [0.68, 0],
                      }}
                      transition={{
                        duration: 2.25,
                        delay: 0.45,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  </>
                ) : (
                  <span className="absolute inset-[-8px] rounded-full border border-white/10" />
                )}

                <div className="relative flex size-16 items-center justify-center rounded-full border border-white/15 bg-[#150c22] p-[3px] shadow-[0_15px_42px_rgba(0,0,0,0.4)] sm:size-[72px]">
                  <AvatarPortrait
                    variant={member.variant}
                    name={member.name}
                  />

                  <span
                    className={`absolute bottom-0 right-0 size-4 rounded-full border-[3px] border-[#12091e] ${member.statusColor}`}
                    aria-label={`${member.name} status`}
                  />
                </div>

                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-white/52">
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
            className="glass-panel absolute bottom-[0%] left-1/2 w-[242px] -translate-x-1/2 rounded-2xl px-5 py-4 text-center sm:bottom-[3%] sm:w-[252px]"
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0b0712] via-[#0b0712]/55 to-transparent" />
    </section>
  );
}
