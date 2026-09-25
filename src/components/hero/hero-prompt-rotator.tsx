"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { heroPrompts, useHeroTour } from "@/components/hero/hero-tour";

/**
 * The welcome sentence. It no longer keeps a clock of its own: the step, the
 * pause state and the reduced-motion gate all come from the hero's one tour
 * (`hero-tour.tsx`), which the phone beside it reads too. This row carries the
 * tour's single Pause control, because on a phone it is the first thing that
 * moves and the phone frames sit well below it.
 */
export function HeroPromptRotator() {
  const {
    promptIndex,
    paused,
    reduceMotion,
    togglePaused,
    setInteractionPaused,
    showPreviousPrompt,
    showNextPrompt,
  } = useHeroTour();

  return (
    <div
      className="mt-5 w-full max-w-[560px] sm:mt-7"
      aria-label="What you can do on YO Voice"
    >
      {/* A stable summary is better for assistive technology than replacing
          a sentence underneath someone while they are reading it. The
          visual sequence is decorative enrichment and therefore hidden from
          the accessibility tree. Reduced-motion users see the first prompt
          until they deliberately choose another one. */}
      <span className="sr-only">
        YO Voice is for small communities that talk out loud: Servers with
        voice channels, private Chats, short Voice Moments and media-first
        Yeels.
      </span>

      <div
        className="flex min-h-[96px] items-start sm:min-h-[76px] lg:min-h-[92px]"
        onMouseEnter={() => setInteractionPaused(true)}
        onMouseLeave={() => setInteractionPaused(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={promptIndex}
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, y: 8, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -7, filter: "blur(3px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="text-pretty text-[15px] leading-[1.7] text-white/60 sm:text-[17px] sm:leading-7"
          >
            {heroPrompts[promptIndex].text}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        className="mt-1 flex flex-wrap items-center justify-center gap-1.5 lg:justify-start"
        role="group"
        aria-label="Choose a welcome message"
        onMouseEnter={() => setInteractionPaused(true)}
        onMouseLeave={() => setInteractionPaused(false)}
        onFocusCapture={() => setInteractionPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setInteractionPaused(false);
          }
        }}
      >
        {/* The one Pause for the whole hero: it stops the welcome messages
            and the app screens together. */}
        {reduceMotion !== true && (
          <button
            type="button"
            onClick={togglePaused}
            className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-white/55 transition hover:bg-white/[.04] hover:text-white/80 motion-reduce:transition-none"
            aria-label={paused ? "Play the welcome tour" : "Pause the welcome tour"}
          >
            {paused ? (
              <Play className="size-3" aria-hidden="true" />
            ) : (
              <Pause className="size-3" aria-hidden="true" />
            )}
            {/* On a span: the unlayered `button { font: inherit }` reset in
                globals.css would discard type utilities on the button. */}
            <span className="text-[11px] font-bold leading-none">{paused ? "Play" : "Pause"}</span>
          </button>
        )}

        <div className="flex items-center rounded-full border border-white/[.08] bg-white/[.025]">
          <button
            type="button"
            onClick={showPreviousPrompt}
            className="focus-ring flex size-11 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[.06] hover:text-white motion-reduce:transition-none"
            aria-label="Show previous welcome message"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </button>
          <span
            className="min-w-12 text-center text-[11px] font-bold tabular-nums tracking-[.12em] text-white/55"
            aria-hidden="true"
          >
            {String(promptIndex + 1).padStart(2, "0")} / {String(heroPrompts.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={showNextPrompt}
            className="focus-ring flex size-11 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[.06] hover:text-white motion-reduce:transition-none"
            aria-label="Show next welcome message"
          >
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
