"use client";

import { ArrowDown, ArrowRight, HouseHeart, Mic2, Play, UsersRound } from "lucide-react";
import { motion } from "framer-motion";

import { AppExperiencePreview } from "@/components/hero/app-experience-preview";
import { DeepSpaceBackground } from "@/components/hero/deep-space-background";
import { HeroPrimaryCta, HeroSecondaryCta } from "@/components/hero/hero-cta";
import { HeroPromptRotator } from "@/components/hero/hero-prompt-rotator";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";
import { LiveStats } from "@/components/hero/live-stats";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36 lg:min-h-[calc(100svh-80px)] lg:pt-0">
      <DeepSpaceBackground />

      {/* Desktop is one above-fold stage: promise on the left, the human
          conversation scene on the right. Below lg the same pieces return
          to the centered stack that already works well on phones. */}
      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:grid lg:min-h-[calc(100svh-80px)] lg:grid-cols-[minmax(0,.92fr)_minmax(520px,1.08fr)] lg:items-center lg:gap-12 lg:px-12 lg:py-16 xl:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={false}
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
            initial={false}
            className="mt-5 font-[family-name:var(--font-display)] text-[2.65rem] font-bold leading-[1.01] tracking-[-0.04em] text-white sm:text-7xl lg:text-[3.55rem] xl:text-[4.5rem]"
          >
            <span className="block">Stop scrolling.</span>
            <span className="text-gradient text-gradient-descender-safe mt-1 block">
              Start talking.
            </span>
          </motion.h1>

          <motion.div
            initial={false}
          >
            <HeroPromptRotator />
          </motion.div>

          <motion.div
            initial={false}
            className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row lg:items-start"
          >
            <HeroPrimaryCta href={APP_ENTRY_PATH}>
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
            initial={false}
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

        <div className="relative mx-auto mt-12 w-full max-w-[320px] sm:mt-16 sm:max-w-[560px] lg:mt-0">
          <motion.div
            initial={false}
            className="relative w-full"
          >
            <AppExperiencePreview />
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
