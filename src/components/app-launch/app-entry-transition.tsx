"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

const PHRASES = ["Speak freely", "Find your people", "Create your space"] as const;

/**
 * Timeline (ms from mount). This is a *minimum* — the sequence never runs
 * shorter than this, and it never runs a second time. Total in the normal
 * case: 440 + 3×660 + 380 = 2.8s.
 *
 * Each phrase owns a 660ms slot: 220ms in, ~280ms fully opaque, 160ms out.
 * The slot is the phrase's on-screen lifetime; AnimatePresence `mode="wait"`
 * makes the exit finish before the next enter starts, so two phrases are
 * never on screen together — which is also why the fully-opaque window is
 * shorter than the slot. The last phrase gets the extra hold: it stays up
 * through the outro instead of exiting.
 */
const INTRO_MS = 440;
const PHRASE_MS = 660;
const ENTER_MS = 220;
const EXIT_MS = 160;
const OUTRO_MS = 380;

/** Reduced motion: no phrase rotation to watch, so there is nothing to wait
 * for — fill the three segments quickly and hand off. */
const REDUCED_SEGMENT_MS = 300;
const REDUCED_OUTRO_MS = 160;

/** Where the last segment parks when initialization hasn't finished yet.
 * Deliberately short of 100% — the bar stops being a countdown and starts
 * being "still working" until readiness is real. */
const HOLD_AT = 0.92;
/** Floor for the last segment's fill so a 92% → 100% finish still reads as a
 * movement rather than a snap. */
const MIN_FILL_MS = 180;

/** Expo-out. Fast start, long settle, no overshoot — nothing bounces. */
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IN: [number, number, number, number] = [0.55, 0, 1, 0.45];

export type AppEntryTransitionProps = {
  /** Real initialization state, owned by the caller. The sequence will not
   * finish while this is false — it parks at {@link HOLD_AT} instead. */
  ready: boolean;
  /** Fired once, after the outro, when it's time to navigate. */
  onComplete: () => void;
  /** The mark is the only asset this screen needs; the caller folds this
   * into its own `ready` so progress tracks something real. */
  onLogoReady?: () => void;
};

export function AppEntryTransition(props: AppEntryTransitionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  // Keyed remount rather than in-effect resets: if the motion preference
  // resolves after first paint, the sequence restarts from a clean slate
  // instead of being unwound by hand.
  return (
    <EntrySequence
      key={prefersReducedMotion ? "reduced" : "full"}
      reduced={prefersReducedMotion}
      {...props}
    />
  );
}

function EntrySequence({
  reduced,
  ready,
  onComplete,
  onLogoReady,
}: AppEntryTransitionProps & { reduced: boolean }) {
  const segment1 = useMotionValue(0);
  const segment2 = useMotionValue(0);
  const segment3 = useMotionValue(0);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [lastSegmentArmed, setLastSegmentArmed] = useState(false);
  const [timelineDone, setTimelineDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Latest-value ref so the outro effect can stay keyed only on the signals
  // that gate it — re-running it because `onComplete` got a new identity
  // would clear the very timer that fires it.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const outroStarted = useRef(false);
  const handleLogoLoad = useCallback(() => onLogoReady?.(), [onLogoReady]);

  // The timeline itself. Phrase changes and the first two segment fills are
  // pure schedule; only the last segment answers to `ready`.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const running: { stop: () => void }[] = [];
    const at = (ms: number, run: () => void) => {
      timers.push(setTimeout(run, ms));
    };
    const fillTo = (value: MotionValue<number>, ms: number) => {
      running.push(animate(value, 1, { duration: ms / 1000, ease: "linear" }));
    };

    if (reduced) {
      const step = REDUCED_SEGMENT_MS;
      at(0, () => fillTo(segment1, step));
      at(step, () => fillTo(segment2, step));
      at(step * 2, () => setLastSegmentArmed(true));
      at(step * 3, () => setTimelineDone(true));
    } else {
      at(INTRO_MS, () => fillTo(segment1, PHRASE_MS));
      at(INTRO_MS + PHRASE_MS, () => {
        setPhraseIndex(1);
        fillTo(segment2, PHRASE_MS);
      });
      at(INTRO_MS + PHRASE_MS * 2, () => {
        setPhraseIndex(2);
        setLastSegmentArmed(true);
      });
      at(INTRO_MS + PHRASE_MS * 3, () => setTimelineDone(true));
    }

    return () => {
      timers.forEach(clearTimeout);
      running.forEach((controls) => controls.stop());
    };
  }, [reduced, segment1, segment2, segment3]);

  // Last segment: fills to 100% if initialization is already done, otherwise
  // to HOLD_AT and waits there. Retargets in place when `ready` flips, so a
  // late-arriving app finishes the fill it was already in the middle of.
  useEffect(() => {
    if (!lastSegmentArmed) return;
    const target = ready ? 1 : HOLD_AT;
    const from = segment3.get();
    if (target <= from) return;
    const slot = reduced ? REDUCED_SEGMENT_MS : PHRASE_MS;
    const duration = Math.max(MIN_FILL_MS, (target - from) * slot);
    const controls = animate(segment3, target, {
      duration: duration / 1000,
      ease: "linear",
    });
    return () => controls.stop();
  }, [lastSegmentArmed, ready, reduced, segment3]);

  // Outro, latched: runs at most once, and only when the minimum timeline is
  // done *and* initialization is real.
  useEffect(() => {
    if (!timelineDone || !ready || outroStarted.current) return;
    outroStarted.current = true;

    // If the bar was parked at HOLD_AT, let it reach 100% before anything
    // fades — the fill completing is what says "we're going".
    const fillDelay = segment3.get() >= 0.999 ? 0 : MIN_FILL_MS;
    const outro = reduced ? REDUCED_OUTRO_MS : OUTRO_MS;

    const startOutro = setTimeout(() => setExiting(true), fillDelay);
    const finish = setTimeout(() => onCompleteRef.current(), fillDelay + outro);
    return () => {
      clearTimeout(startOutro);
      clearTimeout(finish);
    };
  }, [timelineDone, ready, reduced, segment3]);

  const outroDuration = (reduced ? REDUCED_OUTRO_MS : OUTRO_MS) / 1000;

  return (
    <div className="relative flex w-full flex-col items-center px-6">
      {/* The animated phrases are aria-hidden (they'd re-announce on every
          swap); this carries the same copy once, for assistive tech. */}
      <p className="sr-only" role="status">
        Opening YO Voice. Speak freely. Find your people. Create your space.
      </p>

      <motion.div
        className="flex w-full flex-col items-center"
        animate={
          exiting
            ? { opacity: 0, scale: reduced ? 1 : 1.015 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration: outroDuration, ease: EASE_OUT }}
      >
        {/* Mark — the shipped asset, unaltered: it only fades and scales,
            never rotates, never gets a filter of its own. */}
        <motion.div
          className="relative flex size-[88px] items-center justify-center sm:size-[104px]"
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.62, delay: 0.06, ease: EASE_OUT }}
        >
          {/* Purple→magenta glow. A radial gradient rather than a blurred
              layer: same softness, none of the filter cost on mobile. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[80%] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.28),rgba(217,70,239,0.11)_42%,transparent_70%)]"
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={
              exiting && !reduced
                ? { opacity: 0.9, scale: 1.16 }
                : { opacity: 1, scale: 1 }
            }
            transition={{
              duration: exiting ? outroDuration : 0.8,
              delay: exiting ? 0 : 0.04,
              ease: EASE_OUT,
            }}
          />
          {/* Explicit width/height rather than `fill`: this renders at ~104px,
              and `fill` had Next reaching for the largest generated variant —
              the one asset gating the hand-off would have been the slowest
              thing on the page. Asked for at the size it's actually drawn.
              scale matches the hero: the supplied symbol is a tight crop, so
              it needs to sit slightly inside its box to read the same weight
              as the mark it replaced. */}
          <Image
            src="/logos/yo-voice-symbol.png"
            alt=""
            width={208}
            height={215}
            quality={100}
            priority
            onLoad={handleLogoLoad}
            className="relative size-full scale-[0.86] object-contain"
          />
        </motion.div>

        <motion.h1
          // Negative right margin cancels the trailing letter-space so the
          // wordmark is optically centred, not centred-plus-one-gap.
          className="-mr-[0.34em] mt-6 font-[family-name:var(--font-display)] text-[25px] font-extrabold uppercase leading-none tracking-[0.34em] text-white sm:text-[29px]"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: EASE_OUT }}
        >
          YO Voice
        </motion.h1>

        {/* Fixed height, absolutely positioned children: the phrase swap can
            never move anything below it. */}
        <div className="relative mt-3.5 h-6 w-full sm:h-7" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              className="absolute inset-0 flex items-center justify-center text-[15px] font-medium text-white/55 sm:text-base"
              initial={reduced ? false : { opacity: 0, y: 9, filter: "blur(4px)" }}
              // Enter and exit each carry their own transition rather than
              // sharing one via the `transition` prop: the first phrase's
              // INTRO_MS delay would otherwise be inherited by the exit too,
              // stalling AnimatePresence's swap by an extra 440ms.
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: ENTER_MS / 1000,
                  delay: phraseIndex === 0 && !reduced ? INTRO_MS / 1000 : 0,
                  ease: EASE_OUT,
                },
              }}
              // Exits are quicker and ease *in*, so a phrase leaves
              // decisively instead of lingering into the next one.
              exit={{
                opacity: 0,
                y: -9,
                filter: "blur(2px)",
                transition: { duration: EXIT_MS / 1000, ease: EASE_IN },
              }}
            >
              {reduced ? PHRASES[PHRASES.length - 1] : PHRASES[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <ProgressBar
          segments={[segment1, segment2, segment3]}
          showSweep={!reduced}
        />
      </motion.div>
    </div>
  );
}

/**
 * One continuous track with two background-coloured notches cut into it —
 * three sections visually, but a single fill and a single highlight, so the
 * sweep travels the filled region as one light rather than three.
 *
 * No `aria-valuenow`: the fill is a paced minimum timeline, not measured
 * progress, and publishing a number would be inventing one.
 */
function ProgressBar({
  segments,
  showSweep,
}: {
  segments: [MotionValue<number>, MotionValue<number>, MotionValue<number>];
  showSweep: boolean;
}) {
  const [first, second, third] = segments;
  const clipPath = useTransform(() => {
    const filled = (first.get() + second.get() + third.get()) / 3;
    return `inset(0 ${((1 - filled) * 100).toFixed(3)}% 0 0)`;
  });

  return (
    <div
      role="progressbar"
      aria-label="Opening YO Voice"
      className="relative mt-8 h-[3px] w-[min(200px,58vw)] overflow-hidden rounded-full bg-white/[0.07]"
    >
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#7c3aed,#a855f7_55%,#d946ef)]" />
        {showSweep ? (
          <motion.div
            className="absolute inset-y-0 left-0 w-[38%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.30),transparent)]"
            initial={{ x: "-100%" }}
            animate={{ x: "265%" }}
            transition={{
              duration: 2.1,
              repeat: Infinity,
              repeatDelay: 0.45,
              ease: "easeInOut",
            }}
          />
        ) : null}
      </motion.div>

      {/* Section dividers, painted in the page background so they read as
          gaps rather than as marks on top of the fill. */}
      <span className="absolute inset-y-0 left-1/3 w-[3px] -translate-x-1/2 bg-[var(--background)]" />
      <span className="absolute inset-y-0 left-2/3 w-[3px] -translate-x-1/2 bg-[var(--background)]" />
    </div>
  );
}
