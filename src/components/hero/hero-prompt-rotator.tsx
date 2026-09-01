"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export const heroPrompts = [
  "Drop into a Community Room and join one shared conversation when you are ready.",
  "Find people who are into what you are into — or start the room they have been looking for.",
  "Host a Podcast Room with a stage, raised hands, and room for real questions.",
  "Create a Club where the conversation continues after the room ends.",
  "Bring your favorite people closer in a private Family Room.",
  "Follow voices you enjoy, make friends, and know where to meet again.",
  "No polished post required — just a topic, a microphone, and people worth meeting.",
  "Join live, take part naturally, or start a room of your own.",
] as const;

const ROTATION_INTERVAL_MS = 6200;

export function HeroPromptRotator() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);

  const autoRotationPaused = paused || interactionPaused || reduceMotion === true;

  function showPreviousPrompt() {
    setActiveIndex((current) =>
      current === 0 ? heroPrompts.length - 1 : current - 1,
    );
  }

  function showNextPrompt() {
    setActiveIndex((current) => (current + 1) % heroPrompts.length);
  }

  useEffect(() => {
    if (autoRotationPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroPrompts.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [autoRotationPaused]);

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
        Join live voice rooms, meet people, create Clubs and private Family
        Rooms, or host a Podcast Room when you are ready to speak.
      </span>

      <div
        className="flex min-h-[96px] items-start sm:min-h-[76px] lg:min-h-[92px]"
        onMouseEnter={() => setInteractionPaused(true)}
        onMouseLeave={() => setInteractionPaused(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={activeIndex}
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, y: 8, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -7, filter: "blur(3px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="text-pretty text-[15px] leading-[1.7] text-white/60 sm:text-[17px] sm:leading-7"
          >
            {heroPrompts[activeIndex]}
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
        {reduceMotion !== true && (
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-white/55 transition hover:bg-white/[.04] hover:text-white/80 reduce-motion:transition-none"
            aria-label={paused ? "Resume welcome messages" : "Pause welcome messages"}
          >
            {paused ? (
              <Play className="size-3" aria-hidden="true" />
            ) : (
              <Pause className="size-3" aria-hidden="true" />
            )}
            {paused ? "Play" : "Pause"}
          </button>
        )}

        <div className="flex items-center rounded-full border border-white/[.08] bg-white/[.025]">
          <button
            type="button"
            onClick={showPreviousPrompt}
            className="focus-ring flex size-11 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[.06] hover:text-white reduce-motion:transition-none"
            aria-label="Show previous welcome message"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </button>
          <span
            className="min-w-12 text-center text-[11px] font-bold tabular-nums tracking-[.12em] text-white/55"
            aria-hidden="true"
          >
            {String(activeIndex + 1).padStart(2, "0")} / {String(heroPrompts.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={showNextPrompt}
            className="focus-ring flex size-11 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[.06] hover:text-white reduce-motion:transition-none"
            aria-label="Show next welcome message"
          >
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
