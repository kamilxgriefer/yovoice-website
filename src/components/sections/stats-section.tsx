"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ShieldCheck, Users, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";

const stats = [
  { icon: Users, prefix: "", value: 500, decimals: 0, suffix: "+", label: "Communities" },
  { icon: Activity, prefix: "", value: 20, decimals: 0, suffix: "K+", label: "Voice Hours" },
  { icon: ShieldCheck, prefix: "", value: 99.9, decimals: 1, suffix: "%", label: "Uptime" },
  { icon: Zap, prefix: "<", value: 120, decimals: 0, suffix: "ms", label: "Latency" },
];

function AnimatedNumber({
  target,
  decimals,
  prefix,
  suffix,
}: {
  target: number;
  decimals: number;
  prefix: string;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section id="stats" className="relative px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, prefix, value, decimals, suffix, label }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="glass-panel group relative overflow-hidden rounded-[22px] p-6 hover:border-fuchsia-300/25"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-fuchsia-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
            <motion.div
              className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
            >
              <Icon className="size-5" />
            </motion.div>
            <div className="relative mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
              <AnimatedNumber target={value} decimals={decimals} prefix={prefix} suffix={suffix} />
            </div>
            <div className="relative mt-1 text-xs text-white/45">{label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
