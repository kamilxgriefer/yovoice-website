"use client";

import { useSyncExternalStore } from "react";

import { STAGGER } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import { SceneOpener } from "@/components/animations/scene-opener";
import { ScrollWave } from "@/components/animations/scroll-wave";
import { WordReveal } from "@/components/animations/word-reveal";
import type { WelcomeOpenerCopy, WelcomeRow } from "@/components/sections/welcome-intro";

/**
 * The welcome as a spoken moment.
 *
 * It opens the way every scene does (`SceneOpener`): the eyebrow's rule
 * draws, and "Small communities that talk out loud." rises out of its
 * baseline word by word, as if said. Under it the page's voice
 * (`ScrollWave`) speaks while you scroll, and the sentence that explains
 * YO Voice is set large and lights up word by word as it is read
 * (`WordReveal`). The three answers rise in after it, a beat apart.
 *
 * The story's violet does not stop at a line: the welcome has no hairline in
 * the cinema, and its ground starts in the story's last light (the finale
 * flood over the page) and settles into the page's own ground before the
 * sentence begins, so the sentence's unlit words only ever sit on
 * `--background`, where they read at 4.6:1.
 *
 * Only mounted while the scroll cinema is on; `WelcomeIntro` renders the
 * static layout otherwise, with the same heading, id, sentence and rows.
 * Scrubbed motion here is transform-only, plus `WordReveal`'s colour, so
 * every line meets WCAG AA wherever the visitor stops. The only fades are
 * triggered entrances (the opener, the rows) that run once and finish.
 */
export function WelcomeIntroCinema({
  opener,
  sentence,
  rows,
}: {
  opener: WelcomeOpenerCopy;
  sentence: string;
  rows: readonly WelcomeRow[];
}) {
  const bars = useWaveBars();
  return (
    <section
      id="welcome"
      aria-labelledby="welcome-heading"
      className="relative overflow-x-clip bg-[var(--background)] pb-[var(--section-bottom)] pt-[var(--opener-top)]"
      style={{ backgroundImage: SEAM_GROUND }}
    >
      <div className="frame min-w-0">
        {/* The title breaks by measure, not by a forced line: 11.6em holds
            "Small communities that" (10.75em) but not "… talk" (12.6em), so
            wherever it fits, "talk out loud." takes the second line; where
            even that does not fit (phones, very large text) it wraps as
            "Small communities / that talk out loud." and never leaves "that"
            on a line of its own. Where it needs three lines or more (a
            phone narrower than 24rem: 384px, or 768px at 200 % text) it is
            balanced, so "loud." never stands alone on the last line:
            "Small / communities / that talk out loud.". Wider, balancing
            would undo the break above, so it is left alone. */}
        <SceneOpener
          size="scene"
          eyebrow={opener.eyebrow}
          ink={opener.ink}
          title={opener.title}
          accent={opener.accent}
          headingId="welcome-heading"
          titleClassName="max-w-[11.6em] hyphens-auto max-[24rem]:text-balance"
        />

        <ScrollWave bars={bars} className="mt-[var(--opener-gap)] h-14 sm:h-16 lg:h-20" />

        <div className="lg:pl-[calc(100%/6)]">
          <WordReveal
            text={sentence}
            className="mt-12 max-w-[26em] break-words text-[clamp(1.5rem,0.95rem+1.7vw,2.625rem)] font-semibold leading-[1.3] tracking-[-0.02em] sm:mt-16"
          />

          <ul
            className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-20 md:grid-cols-3"
            aria-label="What YO Voice is for"
          >
            {rows.map(({ icon: Icon, title, text }, index) => (
              <Reveal
                as="li"
                key={title}
                delay={Math.min(index, 4) * STAGGER.item}
                className="min-w-0 border-t border-[var(--border)] pt-6"
              >
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="mt-5 break-words font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.02em] text-[var(--foreground)]">
                  {title}
                </h3>
                <p className="mt-2 max-w-[22rem] break-words text-base leading-[1.6] text-[var(--text-secondary)]">
                  {text}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * The welcome's ground in the cinema. It starts in the story's last light —
 * `--seam`, the story's finale flood laid over the page, which the story's
 * own foot fades into — and settles into the page's ground over
 * `SEAM_DEPTH`. The fade is eased (smoothstep), flat where it leaves the
 * story and flat where it lands, so neither end reads as an edge. It is over
 * well before the sentence starts (about 525px down at 1440, 357px at 390,
 * 419px at 320×568), so the sentence's unlit words sit on `--background` only.
 */
const SEAM_DEPTH = "min(36svh, 20rem)";
const SEAM_GROUND = `linear-gradient(to bottom, ${[0, 0.2, 0.4, 0.6, 0.8, 1]
  .map((at) => {
    const settled = at * at * (3 - 2 * at);
    return `color-mix(in srgb, var(--background) ${(settled * 100).toFixed(1)}%, var(--seam, #12092d)) calc(${SEAM_DEPTH} * ${at})`;
  })
  .join(", ")})`;

/**
 * How many bars the welcome's waveform draws: roughly one per 9–13 px of
 * width.
 * `ScrollWave` keeps a fixed gap between bars, so a phone-width wave with the
 * desktop's 96 bars would have no room left for the bars themselves.
 */
const WAVE_QUERIES = [
  ["(min-width: 64rem)", 96],
  ["(min-width: 40rem)", 64],
] as const;
const PHONE_BARS = 40;

function subscribeWaveBars(onChange: () => void) {
  const queries = WAVE_QUERIES.map(([query]) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}

function waveBarsSnapshot() {
  return WAVE_QUERIES.find(([query]) => window.matchMedia(query).matches)?.[1] ?? PHONE_BARS;
}

function useWaveBars(): number {
  return useSyncExternalStore(subscribeWaveBars, waveBarsSnapshot, () => PHONE_BARS);
}
