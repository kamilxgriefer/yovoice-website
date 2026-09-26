"use client";

import { ArrowDown, ArrowRight, AudioLines, Clapperboard, Download, MessageCircle, Mic2 } from "lucide-react";
import { motion } from "framer-motion";

import { AppScreenRotator } from "@/components/hero/app-screen-rotator";
import { HeroPrimaryCta, HeroSecondaryCta } from "@/components/hero/hero-cta";
import { HeroPromptRotator } from "@/components/hero/hero-prompt-rotator";
import {
  HeroCopyDepth,
  HeroDuskDepth,
  HeroFramesDepth,
  HeroGlowDepth,
} from "@/components/hero/hero-scroll-depth";
import { HeroTourProvider } from "@/components/hero/hero-tour";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";
import { LiveStats } from "@/components/hero/live-stats";

export function HeroSection() {
  return (
    /* pt matches --header-height plus the hero's own breathing room; the
       min-height subtracts the same token, so the fold follows the header
       instead of a hard-coded 80px. */
    <section className="relative overflow-hidden pt-22 sm:pt-30 lg:min-h-[calc(100svh-var(--header-height))] lg:pt-0">
      {/* The whole decorative layer of this page is this one radial glow in
          the top-left corner. The starfield, the nebula wisp, the dust motes
          and the vignette are gone: the first thing a visitor notices should
          be the sentence, not the backdrop. On the way out it drifts down
          after the scroll, so the light leaves the hero last. */}
      <HeroGlowDepth className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-18%] size-[640px] rounded-full bg-[radial-gradient(circle,rgba(123,47,247,.14),transparent_70%)]" />
      </HeroGlowDepth>
      <HeroDuskDepth className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_calc(100%-14rem),var(--background))]" />

      {/* Desktop is one above-fold stage: promise on the left, the human
          conversation scene on the right. Below lg the same pieces return
          to the centered stack that already works well on phones. The tour
          provider gives the welcome sentence and the phone one clock and one
          Pause control, so the screen always matches the sentence. */}
      <HeroTourProvider>
        <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:grid lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-[minmax(0,.92fr)_minmax(520px,1.08fr)] lg:items-center lg:gap-12 lg:px-12 lg:py-16 xl:gap-16">
          {/* The copy is the far layer of the hero's exit: it drifts up
              slower than the page and softens as it leaves. */}
          <HeroCopyDepth className="flex origin-top flex-col items-center text-center lg:origin-top-left lg:items-start lg:text-left">
            <motion.div initial={false} className="chip">
              <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
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
              className="mt-5 font-[family-name:var(--font-display)] text-[2.5rem] font-extrabold leading-[1.03] tracking-[-.03em] text-white sm:text-6xl lg:text-[3.25rem] xl:text-[4rem]"
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
              className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:items-start"
            >
              <HeroPrimaryCta href={APP_ENTRY_PATH}>
                Start talking
                <ArrowRight className="size-4" aria-hidden="true" />
              </HeroPrimaryCta>
              <HeroSecondaryCta href="/download">
                <Download className="size-4" aria-hidden="true" />
                Where to get it
              </HeroSecondaryCta>
            </motion.div>

            <motion.ul
              initial={false}
              className="mt-6 flex max-w-[620px] flex-wrap justify-center gap-2 lg:justify-start"
              aria-label="YO Voice highlights"
            >
              {[
                { icon: Mic2, label: "Servers & voice channels" },
                { icon: MessageCircle, label: "Chats" },
                { icon: AudioLines, label: "Voice Moments" },
                { icon: Clapperboard, label: "Yeels" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="chip">
                  <Icon className="size-3.5 text-[var(--accent)]" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </motion.ul>
          </HeroCopyDepth>

          {/* The device frames. What used to stand here was a hand-drawn
              approximation of the app that had drifted a long way from it — a
              dock with a centre logo and no Servers destination. These are
              screenshots of the current build's real screens, and they follow
              the welcome sentence through the app's own first four
              destinations. */}
          <div className="relative mx-auto mt-12 w-full max-w-[560px] sm:mt-16 lg:mt-0">
            {/* The near layer: on the way out the frames recline and settle
                back, handing the phone to the tour that follows. */}
            <HeroFramesDepth className="relative w-full">
              <AppScreenRotator />
            </HeroFramesDepth>
          </div>
        </div>
      </HeroTourProvider>

      <div className="relative mx-auto max-w-[1400px] px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-16 lg:absolute lg:inset-x-0 lg:bottom-3 lg:p-0">
        <motion.a
          href="#inside"
          whileHover={{ y: 2 }}
          className="focus-ring mx-auto flex size-11 items-center justify-center rounded-full text-[var(--text-tertiary)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          aria-label="Scroll to the tour of YO Voice"
        >
          <ArrowDown className="size-4" aria-hidden="true" />
        </motion.a>
      </div>
    </section>
  );
}
