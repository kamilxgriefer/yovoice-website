"use client";

import { AnimatePresence, motion } from "framer-motion";

export function PremiumChatBubble({
  message,
  visible,
  active,
  align = "left",
  size = "md",
}: {
  message: string;
  visible: boolean;
  active: boolean;
  align?: "left" | "right";
  size?: "sm" | "md";
}) {
  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.94 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute bottom-[calc(100%+14px)] z-40 ${align === "left" ? "left-0" : "right-0"}`}
        >
          <div
            className={`relative overflow-hidden whitespace-nowrap rounded-2xl border px-4 py-2.5 backdrop-blur-2xl ${
              size === "sm" ? "text-[10.5px]" : "text-[11.5px]"
            } font-medium tracking-[-0.01em] ${
              active
                ? "border-fuchsia-200/30 text-white"
                : "border-white/[0.1] text-white/85"
            }`}
            style={{
              background: active
                ? "linear-gradient(155deg, rgba(56,20,74,.92), rgba(24,12,38,.94))"
                : "linear-gradient(155deg, rgba(28,20,42,.9), rgba(18,11,30,.92))",
              boxShadow: active
                ? "0 18px 48px rgba(0,0,0,.5), 0 0 28px rgba(192,38,255,.22), inset 0 1px 0 rgba(255,255,255,.14)"
                : "0 14px 36px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)",
            }}
          >
            {/* Gradient border glow (only when active) */}
            {active ? (
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-300/20 via-transparent to-violet-400/10" />
            ) : null}
            <span className="relative">{message}</span>
          </div>
          <span
            className={`absolute -bottom-1.5 size-3 rotate-45 border-b border-r ${
              align === "left" ? "left-6" : "right-6"
            } ${
              active
                ? "border-fuchsia-200/30 bg-[#2c1244]"
                : "border-white/[0.09] bg-[#180f24]"
            }`}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
