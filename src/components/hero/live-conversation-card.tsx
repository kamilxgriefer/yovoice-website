"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export function LiveConversationCard({
  speakerName,
  speakerAvatar,
  equalizer,
}: {
  speakerName: string;
  speakerAvatar: string;
  equalizer: number[];
}) {
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[11%] left-1/2 w-[240px] -translate-x-1/2"
    >
      <div className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5 text-center shadow-[0_24px_70px_rgba(0,0,0,.55),0_0_50px_rgba(192,38,255,.18)] backdrop-blur-2xl">
        {/* Top reflection sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent" />
        {/* Gradient border glow ring */}
        <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-fuchsia-300/10" />

        <div className="relative">
          <div className="mx-auto mb-3 flex w-fit items-center gap-1.5 rounded-full bg-fuchsia-400/[0.12] px-2.5 py-1">
            <motion.span
              className="size-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-fuchsia-200">
              Live conversation
            </span>
          </div>

          <div className="relative mx-auto mb-2 size-11">
            <motion.div
              className="absolute inset-[-6px] rounded-full border border-fuchsia-300/30"
              animate={{ scale: [0.9, 1.25], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <div className="relative size-full overflow-hidden rounded-full border border-white/15 shadow-[0_0_18px_rgba(192,38,255,.4)]">
              <Image src={speakerAvatar} alt={speakerName} fill className="object-cover" sizes="44px" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={speakerName}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="text-[13px] font-semibold text-white"
            >
              {speakerName} is speaking
            </motion.p>
          </AnimatePresence>

          <div className="mt-3.5 flex h-6 items-end justify-center gap-[3px]">
            {equalizer.map((height, index) => (
              <motion.span
                key={`${speakerName}-${index}`}
                initial={{ height: 4 }}
                animate={{ height: [4, height, 4] }}
                transition={{
                  duration: 0.55 + index * 0.045,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 via-fuchsia-300 to-pink-200"
              />
            ))}
          </div>

          {/* Progress shimmer bar */}
          <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300"
              animate={{ width: ["12%", "78%", "35%", "62%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
