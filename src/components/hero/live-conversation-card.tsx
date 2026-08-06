"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { SignalHigh, Users } from "lucide-react";

function useElapsed() {
  const [seconds, setSeconds] = useState(102);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** A full "Now Playing"-grade widget, not a notification toast: a wide
 * 24-bar waveform (real organic variance, not 5 identical bars), a
 * connection-quality glyph, a live listener count, and a pulsing LIVE
 * indicator — the level of detail of Spotify/Apple Music/Discord's voice
 * UI, styled in this product's glass language. GPU-only animation
 * (scaleY/scaleX/opacity, never width/height) throughout. */
export function LiveConversationCard({
  speakerName,
  speakerAvatar,
  equalizer,
  listeners,
}: {
  speakerName: string;
  speakerAvatar: string;
  equalizer: number[];
  listeners: number;
}) {
  const elapsed = useElapsed();

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-full max-w-[380px]"
    >
      <div
        className="relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-white/[0.015] p-5 backdrop-blur-2xl sm:p-6"
        style={{
          boxShadow:
            "0 32px 90px rgba(0,0,0,.6), 0 0 70px rgba(192,38,255,.18), inset 0 1px 0 rgba(255,255,255,.14), inset 0 -1px 0 rgba(0,0,0,.35)",
        }}
      >
        {/* Top reflection sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.09] to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-fuchsia-300/[0.08]" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <motion.span
              className="size-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-fuchsia-200/90">
              Live Conversation
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/35">
            <span className="flex items-center gap-1 text-[10px] font-semibold tabular-nums">
              <Users className="size-3" />
              {listeners.toLocaleString("en-US")}
            </span>
            <span className="flex items-center gap-0.5" title="Connection quality: excellent">
              <SignalHigh className="size-3.5 text-emerald-400" />
            </span>
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-3">
          <div className="relative size-12 shrink-0">
            <motion.div
              className="absolute inset-[-6px] rounded-full border border-fuchsia-300/30"
              animate={{ scale: [0.9, 1.22], opacity: [0.55, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <div className="relative size-full overflow-hidden rounded-full border border-white/15 shadow-[0_0_18px_rgba(192,38,255,.4)]">
              <Image src={speakerAvatar} alt={speakerName} fill className="object-cover" sizes="48px" />
            </div>
          </div>

          <div className="min-w-0 flex-1 text-left">
            <AnimatePresence mode="wait">
              <motion.p
                key={speakerName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="truncate text-[14px] font-semibold text-white"
              >
                {speakerName} is speaking
              </motion.p>
            </AnimatePresence>
            <p className="mt-0.5 text-[11px] text-white/35">Broadcast Room · Weekly Sync</p>
          </div>
        </div>

        {/* Wide organic waveform — 24 bars with real variance */}
        <div className="relative mt-4 flex h-9 items-end justify-center gap-[3px]">
          {equalizer.map((height, index) => (
            <motion.span
              key={`${speakerName}-${index}`}
              style={{ height: 36, transformOrigin: "bottom" }}
              animate={{ scaleY: [Math.max(height / 36, 0.08) * 0.35, height / 36, Math.max(height / 36, 0.08) * 0.5] }}
              transition={{
                duration: 0.5 + (index % 7) * 0.045,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: index * 0.02,
              }}
              className="w-[3px] shrink-0 rounded-full bg-gradient-to-t from-violet-500 via-fuchsia-300 to-pink-200"
            />
          ))}
        </div>

        {/* Progress */}
        <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300"
            animate={{ scaleX: [0.06, 0.4, 0.68, 0.92] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="relative mt-1.5 flex items-center justify-between text-[10px] font-medium tabular-nums text-white/35">
          <span>{elapsed}</span>
          <span className="flex items-center gap-1 font-bold text-rose-300">
            <span className="size-1.5 rounded-full bg-rose-400" />
            LIVE
          </span>
        </div>
      </div>

      {/* Reflection beneath the card — the "floor" this widget casts */}
      <div className="pointer-events-none mx-auto mt-2 h-8 w-[85%] rounded-full bg-gradient-to-b from-fuchsia-500/[0.1] to-transparent blur-md" />
    </motion.div>
  );
}
