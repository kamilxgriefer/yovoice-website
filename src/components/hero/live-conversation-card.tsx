"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

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

/** Styled like a premium audio player (Apple Music / Spotify Now Playing)
 * rather than a generic notification card: bigger speaker art, a real
 * elapsed-time readout, GPU-only animation (scaleY/scaleX + opacity, never
 * width/height) so it stays smooth under load. */
export function LiveConversationCard({
  speakerName,
  speakerAvatar,
  equalizer,
}: {
  speakerName: string;
  speakerAvatar: string;
  equalizer: number[];
}) {
  const elapsed = useElapsed();

  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[9%] left-1/2 w-[86%] max-w-[252px] -translate-x-1/2"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-gradient-to-b from-white/[0.055] to-white/[0.012] p-5 backdrop-blur-2xl shadow-[0_28px_80px_rgba(0,0,0,.55),0_0_56px_rgba(192,38,255,.16)]">
        {/* Top reflection sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-fuchsia-300/[0.08]" />

        <div className="relative flex items-center gap-3">
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
            <div className="flex items-center gap-1.5">
              <motion.span
                className="size-1.5 shrink-0 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-fuchsia-200">
                Live
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={speakerName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="truncate text-[13.5px] font-semibold text-white"
              >
                {speakerName} is speaking
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Equalizer — scaleY only, never height, for GPU-only animation */}
          <div className="flex h-6 shrink-0 items-end justify-center gap-[3px]">
            {equalizer.slice(0, 5).map((height, index) => (
              <motion.span
                key={`${speakerName}-${index}`}
                style={{ height: 22, transformOrigin: "bottom" }}
                animate={{ scaleY: [0.18, height / 22, 0.18] }}
                transition={{
                  duration: 0.55 + index * 0.045,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 via-fuchsia-300 to-pink-200"
              />
            ))}
          </div>
        </div>

        {/* Progress — scaleX with left transform-origin, not width */}
        <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300"
            animate={{ scaleX: [0.06, 0.4, 0.68, 0.92] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="relative mt-1.5 flex items-center justify-between text-[10px] font-medium tabular-nums text-white/35">
          <span>{elapsed}</span>
          <span>Live</span>
        </div>
      </div>

      {/* Soft reflection beneath the card */}
      <div className="pointer-events-none mx-auto mt-1.5 h-6 w-[80%] rounded-full bg-gradient-to-b from-fuchsia-500/[0.08] to-transparent blur-md" />
    </motion.div>
  );
}
