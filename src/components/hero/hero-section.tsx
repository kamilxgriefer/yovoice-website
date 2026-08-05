"use client";

import { useEffect, useMemo, useState } from "react";
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
import { AnimatePresence, motion } from "framer-motion";

import { StarField } from "@/components/animations/star-field";
import { RadarRing } from "@/components/hero/radar-ring";
import { SpacePlanets } from "@/components/hero/space-planets";

type MemberId = "maya" | "alex" | "luna" | "noah";

type Member = {
  id: MemberId;
  name: string;
  avatar: string;
  position: string;
  bubble: string;
  status: string;
  messages: string[];
  equalizer: number[];
};

const members: Member[] = [
  {
    id: "maya",
    name: "Maya",
    avatar: "/avatars/maya.svg",
    position: "left-[7%] top-[14%]",
    bubble: "left-[6px]",
    status: "bg-emerald-400",
    messages: [
      "Hey everyone! 👋",
      "How's your day going?",
      "Love this community 💜",
      "Ready to start?",
    ],
    equalizer: [8, 18, 12, 21, 15, 9, 17, 12, 19],
  },
  {
    id: "alex",
    name: "Alex",
    avatar: "/avatars/alex.svg",
    position: "right-[6%] top-[17%]",
    bubble: "right-[0px]",
    status: "bg-emerald-400",
    messages: [
      "Great to be here! 🚀",
      "This sounds amazing!",
      "Can I join the stage?",
      "Count me in 🙌",
    ],
    equalizer: [13, 8, 20, 11, 18, 14, 7, 17, 12],
  },
  {
    id: "luna",
    name: "Luna",
    avatar: "/avatars/luna.svg",
    position: "bottom-[9%] left-[13%]",
    bubble: "left-[2px]",
    status: "bg-amber-300",
    messages: [
      "Let's go! 💜",
      "That was brilliant!",
      "I totally agree.",
      "This room feels alive ✨",
    ],
    equalizer: [10, 16, 9, 19, 12, 20, 8, 14, 18],
  },
  {
    id: "noah",
    name: "Noah",
    avatar: "/avatars/noah.svg",
    position: "bottom-[8%] right-[10%]",
    bubble: "right-[0px]",
    status: "bg-emerald-400",
    messages: [
      "Awesome talk! 🔥",
      "Good point, Maya.",
      "I'm listening 👂",
      "What happens next?",
    ],
    equalizer: [18, 14, 9, 20, 12, 7, 16, 11, 19],
  },
];

const platforms = [
  { label: "iOS & Android", icon: Smartphone },
  { label: "Windows & macOS", icon: Monitor },
  { label: "Web", icon: Globe2 },
];

function RotatingChatBubble({
  member,
  active,
  delay,
}: {
  member: Member;
  active: boolean;
  delay: number;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let nextTimer: ReturnType<typeof setTimeout> | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const showBubble = () => {
      setVisible(true);

      hideTimer = setTimeout(() => {
        setVisible(false);

        nextTimer = setTimeout(() => {
          setMessageIndex((current) => (current + 1) % member.messages.length);
        }, 350);
      }, 3200);
    };

    const startTimer = setTimeout(() => {
      showBubble();
      interval = setInterval(showBubble, 7600);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (nextTimer) clearTimeout(nextTimer);
      if (interval) clearInterval(interval);
    };
  }, [delay, member.messages.length]);

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key={`${member.id}-${messageIndex}`}
          initial={{ opacity: 0, y: 7, scale: 0.96 }}
          animate={{
            opacity: active ? 1 : 0.86,
            y: 0,
            scale: active ? 1 : 0.98,
          }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`absolute bottom-[calc(100%+12px)] z-40 max-w-[180px] whitespace-nowrap rounded-2xl border px-4 py-2.5 text-[11px] font-semibold text-white backdrop-blur-2xl ${
            active
              ? "border-fuchsia-200/25 bg-[#1b1027]/98 shadow-[0_16px_45px_rgba(0,0,0,.45),0_0_32px_rgba(192,38,255,.16)]"
              : "border-white/10 bg-[#171022]/94 shadow-[0_16px_38px_rgba(0,0,0,.34)]"
          } ${member.bubble}`}
        >
          {member.messages[messageIndex]}
          <span
            className={`absolute -bottom-1.5 left-7 size-3 rotate-45 border-b border-r ${
              active
                ? "border-fuchsia-200/25 bg-[#1b1027]"
                : "border-white/10 bg-[#171022]"
            }`}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMember = members[activeIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % members.length);
    }, 6200);

    return () => clearInterval(timer);
  }, []);

  const connectionPaths = useMemo(
    () => [
      "M20 25 C31 30 40 39 48 48",
      "M52 48 C63 39 73 31 81 27",
      "M47 53 C39 63 31 71 25 78",
      "M53 53 C63 63 72 70 80 76",
    ],
    [],
  );

  return (
    <section className="relative overflow-hidden pt-20">
      <SpacePlanets />
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
            <Link
              href="#download"
              className="premium-button focus-ring min-h-12 px-6 text-sm"
            >
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
          id="hero-orbit"
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.1, ease: "easeOut" }}
          className="relative mx-auto aspect-[1.16/1] w-full max-w-[690px]"
        >
          <div className="absolute inset-[7%] rounded-full border border-fuchsia-300/[0.13]" />
          <RadarRing inset="7%" opacity={0.22} />
          <div className="absolute inset-[18%] rounded-full border border-fuchsia-300/[0.16]" />
          <RadarRing inset="18%" opacity={0.16} />
          <div className="absolute inset-[31%] rounded-full border border-fuchsia-300/[0.2]" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[12%] rounded-full border border-dashed border-fuchsia-300/[0.16]"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[25%] rounded-full border border-dashed border-violet-300/[0.12]"
          />

          <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-0 size-full"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="orbitLine" x1="15" y1="18" x2="88" y2="84">
                <stop stopColor="#F0ABFC" stopOpacity="0.75" />
                <stop offset="0.52" stopColor="#C026FF" stopOpacity="0.18" />
                <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {connectionPaths.map((path, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.path
                  key={path}
                  d={path}
                  stroke="url(#orbitLine)"
                  strokeWidth={isActive ? 0.48 : 0.26}
                  strokeLinecap="round"
                  strokeDasharray="2.2 2.7"
                  animate={{
                    strokeDashoffset: [9, 0],
                    opacity: isActive ? [0.45, 1, 0.45] : [0.1, 0.28, 0.1],
                  }}
                  transition={{
                    duration: isActive ? 1.7 : 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              );
            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 h-[2px] w-[50%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-fuchsia-400/55 to-transparent shadow-[0_0_22px_rgba(232,121,249,.42)]" />

          <motion.div
            animate={{
              scale: [1, 1.035, 1],
              filter: ["brightness(1)", "brightness(1.13)", "brightness(1)"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[40%] flex items-center justify-center rounded-full border border-fuchsia-200/35 bg-black shadow-[0_0_95px_rgba(192,38,255,.55)]"
          >
            <motion.span
              className="absolute inset-[-24%] rounded-full border border-fuchsia-300/15"
              animate={{ scale: [0.84, 1.24], opacity: [0.48, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
            />

            <div className="relative size-[92%] overflow-hidden rounded-full bg-black">
              <Image
                src="/logos/yovoice-logo.png"
                alt="YO Voice community heart"
                fill
                sizes="(max-width: 1024px) 220px, 300px"
                className="object-contain p-[4%] drop-shadow-[0_0_18px_rgba(232,121,249,.45)]"
                priority
              />
            </div>
          </motion.div>

          {members.map((member, index) => {
            const isActive = index === activeIndex;

            return (
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
                  delay: index * 0.25,
                }}
                className={`absolute ${member.position}`}
              >
                <div className="relative">
                  <RotatingChatBubble
                    member={member}
                    active={isActive}
                    delay={index * 950}
                  />

                  <AnimatePresence>
                    {isActive ? (
                      <>
                        <motion.span
                          className="absolute inset-[-15px] rounded-full border border-fuchsia-300/35"
                          initial={{ opacity: 0 }}
                          animate={{
                            scale: [0.84, 1.46],
                            opacity: [0.75, 0],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 1.9,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />

                        <motion.span
                          className="absolute inset-[-8px] rounded-full border border-fuchsia-300/40"
                          initial={{ opacity: 0 }}
                          animate={{
                            scale: [0.92, 1.72],
                            opacity: [0.6, 0],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 2.3,
                            delay: 0.45,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                      </>
                    ) : null}
                  </AnimatePresence>

                  <motion.div
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      filter: isActive
                        ? "brightness(1.12)"
                        : "brightness(0.88)",
                    }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                    className={`relative size-[66px] overflow-hidden rounded-full border-2 bg-[#150c22] p-[3px] ${
                      isActive
                        ? "border-fuchsia-200/85 shadow-[0_0_34px_rgba(192,38,255,.62)]"
                        : "border-fuchsia-300/30 shadow-[0_0_18px_rgba(192,38,255,.2)]"
                    }`}
                  >
                    <Image
                      src={member.avatar}
                      alt={`${member.name} avatar`}
                      fill
                      className="rounded-full object-cover"
                      sizes="66px"
                    />

                    <span
                      className={`absolute bottom-0 right-0 size-4 rounded-full border-[3px] border-[#12091e] ${member.status}`}
                    />
                  </motion.div>

                  <span
                    className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium ${
                      isActive ? "text-white" : "text-white/58"
                    }`}
                  >
                    {member.name}
                  </span>
                </div>
              </motion.div>
            );
          })}

          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="glass-panel absolute bottom-[12%] left-1/2 w-[222px] -translate-x-1/2 rounded-2xl px-5 py-4 text-center shadow-[0_18px_48px_rgba(0,0,0,.32)]"
          >
            <div className="mx-auto mb-2 flex w-fit items-center gap-2 rounded-full bg-fuchsia-400/10 px-2.5 py-1">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
                Live conversation
              </span>
            </div>

            <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-fuchsia-300/80">
              Heart of the Community
            </p>

            <AnimatePresence mode="wait">
              <motion.p
                key={activeMember.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="mt-1.5 text-sm font-semibold text-white"
              >
                {activeMember.name} is speaking
              </motion.p>
            </AnimatePresence>

            <div className="mt-3 flex h-5 items-end justify-center gap-1">
              {activeMember.equalizer.map((height, index) => (
                <motion.span
                  key={`${activeMember.id}-${index}`}
                  initial={{ height: 5 }}
                  animate={{ height: [5, height, 5] }}
                  transition={{
                    duration: 0.58 + index * 0.045,
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
