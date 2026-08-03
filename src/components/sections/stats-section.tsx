import { Activity, ShieldCheck, Users, Zap } from "lucide-react";

const stats = [
  { icon: Users, value: "500+", label: "Communities" },
  { icon: Activity, value: "20K+", label: "Voice Hours" },
  { icon: ShieldCheck, value: "99.9%", label: "Uptime" },
  { icon: Zap, value: "<120ms", label: "Latency" },
];

export function StatsSection() {
  return (
    <section id="stats" className="relative bg-[#060511] px-5 pb-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1320px] overflow-hidden rounded-2xl border border-fuchsia-300/[0.14] bg-[#0b0817]/82 shadow-[0_20px_80px_rgba(0,0,0,.25)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }, index) => (
          <div
            key={label}
            className={`flex items-center justify-center gap-4 px-7 py-6 ${
              index ? "border-t border-white/[0.08] sm:border-l sm:border-t-0" : ""
            }`}
          >
            <Icon className="size-8 text-fuchsia-400" />
            <div>
              <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
                {value}
              </div>
              <div className="text-xs text-white/45">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
