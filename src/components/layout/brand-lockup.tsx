import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

/**
 * The YO Voice brand lockup: the supplied symbol plus live text.
 *
 * The wordmark and tagline are real HTML rather than the supplied
 * `yo-voice-with-text.png`. That asset is genuinely transparent and would
 * render correctly, but it is a 1307x375 raster — at the ~44px height this
 * sits at, its typography would be resampled down to roughly a tenth of its
 * native size, and it can't reflow when the tagline needs to shrink on
 * narrow screens. Live text stays sharp at every DPI, is selectable and
 * translatable, and costs nothing.
 *
 * The symbol is drawn with no plate behind it. The previous lockup wrapped
 * `yovoice-logo.png` in `bg-black rounded-2xl overflow-hidden` because that
 * asset has a solid black square baked in (0% transparent pixels) — the
 * wrapper existed to disguise the matte. The supplied symbol is 44.6%
 * transparent, so nothing needs disguising.
 *
 * Intrinsic width/height are given at ~2x the rendered size: they fix the
 * aspect ratio so nothing shifts while the image loads, and they keep Next's
 * generated candidates small (96px/192px) instead of shipping a 750px image
 * into a 44px slot.
 *
 * Two variants:
 * - `full` (footer, auth) keeps the letterspaced wordmark and the gradient
 *   tagline — a signature, at a size that can carry it.
 * - `compact` (site header) drops both. The slim header is 56px tall, so an
 *   uppercase, .15em-tracked wordmark stacked over a tagline would eat the
 *   width the six navigation items need before the desktop row can appear,
 *   and the tagline would sit at 11px next to 14px navigation. Sentence case
 *   at one line reads as a wordmark and costs ~70px less.
 */
export function BrandLockup({
  className,
  priority = false,
  variant = "full",
  onClick,
}: {
  className?: string;
  /** Set on the header — it's above the fold on every page. */
  priority?: boolean;
  variant?: "full" | "compact";
  onClick?: () => void;
}) {
  const compact = variant === "compact";

  return (
    <Link
      href="/"
      aria-label="YO Voice home"
      onClick={onClick}
      className={cn(
        "focus-ring flex items-center rounded-2xl",
        compact ? "gap-2.5" : "gap-3",
        className,
      )}
    >
      <Image
        src="/logos/yo-voice-symbol.png"
        alt=""
        width={88}
        height={91}
        priority={priority}
        className={cn(
          "w-auto shrink-0",
          compact ? "h-8" : "h-11 sm:h-12",
        )}
      />
      {compact ? (
        <span className="font-[family-name:var(--font-display)] text-[17px] font-extrabold leading-none tracking-[-.01em] text-white">
          YO Voice
        </span>
      ) : (
        <span className="leading-none">
          <span className="block font-[family-name:var(--font-display)] text-[17px] font-extrabold uppercase leading-none tracking-[0.15em] text-white sm:text-[19px]">
            YO Voice
          </span>
          {/* One solid accent: gradient text belongs to the hero headline
              alone. Tracking eases off below `sm` so it stays readable rather
              than stretching past the symbol on a narrow phone. */}
          <span className="mt-[7px] block font-[family-name:var(--font-display)] text-[11.5px] font-semibold leading-none tracking-[0.11em] text-[var(--accent)] sm:text-[12.5px] sm:tracking-[0.15em]">
            Speak and create
          </span>
        </span>
      )}
    </Link>
  );
}
