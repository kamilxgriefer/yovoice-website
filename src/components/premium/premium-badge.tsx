import { Sparkles } from "lucide-react";

/**
 * The "✦ YO VOICE PREMIUM" eyebrow pill — the website rendition of the
 * app's PremiumBadgePill. One component so every Premium surface opens
 * with the same glowing badge.
 */
export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/45 bg-fuchsia-500/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#e9b8ff] shadow-[0_0_18px_rgba(192,38,255,0.28)]">
      <Sparkles className="size-3" aria-hidden />
      YO Voice Premium
    </span>
  );
}
