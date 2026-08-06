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

/** A premium media-player widget, sized like one — not a giant card. Avatar,
 * speaker name, a real waveform, listener count, connection quality, an
 * elapsed timer and a progress bar, in a thin glass shell. GPU-only
 * animation (scaleY/scaleX/opacity, never width/height) throughout. */
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
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-full max-w-[340px]"
    >
      <div
        className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.012] p-4 backdrop-blur-2xl sm:p-5"
        style={{
          boxShadow: "0 20px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <motion.span
              className="size-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/80">
              Live Conversation
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-white/35">
            <span className="flex items-center gap-1 text-[10px] font-semibold tabular-nums">
              <Users className="size-3" />
              {listeners.toLocaleString("en-US")}
            </span>
            <SignalHigh className="size-3.5 text-emerald-400" aria-label="Connection quality: excellent" />
          </div>
        </div>

        <div className="relative mt-3.5 flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-white/10">
            <Image src={speakerAvatar} alt={speakerName} fill className="object-cover" sizes="40px" />
          </div>

          <div className="min-w-0 flex-1 text-left">
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
        </div>

        <div className="relative mt-3.5 flex h-7 items-end justify-center gap-[2.5px]">
          {equalizer.map((height, index) => (
            <motion.span
              key={`${speakerName}-${index}`}
              style={{ height: 28, transformOrigin: "bottom" }}
              animate={{ scaleY: [Math.max(height / 28, 0.08) * 0.35, height / 28, Math.max(height / 28, 0.08) * 0.5] }}
              transition={{
                duration: 0.5 + (index % 7) * 0.045,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: index * 0.02,
              }}
              className="w-[2.5px] shrink-0 rounded-full bg-gradient-to-t from-violet-500 via-fuchsia-300 to-pink-200"
            />
          ))}
        </div>

        <div className="relative mt-3.5 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
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
    </motion.div>
  );
}
