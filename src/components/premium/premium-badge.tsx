import { Sparkles } from "lucide-react";

/**
 * The "✦ YO VOICE PREMIUM" eyebrow pill — the website rendition of the
 * app's PremiumBadgePill. One component so every Premium surface opens
 * with the same badge: accent hairline on the surface, no glow.
 */
export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_38%,transparent)] bg-[var(--surface)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--accent)]">
      <Sparkles className="size-3" aria-hidden />
      YO Voice Premium
    </span>
  );
}
