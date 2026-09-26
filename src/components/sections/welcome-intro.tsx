"use client";

import { AudioLines, MessageCircle, Mic2, type LucideIcon } from "lucide-react";

import { useCinema } from "@/components/animations/cinema";
import { WelcomeIntroCinema } from "@/components/sections/welcome-intro-cinema";

/**
 * The homepage's welcome, not its changelog.
 *
 * This section answers the only question a first-time visitor actually has —
 * what is YO Voice — and it answers it in the present tense with names that
 * exist today: Servers and their voice channels, Chats, Voice Moments and
 * Yeels. Retired product names (Rooms, Clubs) do not appear, and neither do
 * build numbers or "what changed" framing: the release boundary is stated
 * precisely on /updates and /download rather than compressed into a greeting.
 *
 * Presentation only: the grid overlay and the violet bloom that used to sit
 * behind this copy are gone, the highlighted line is the solid accent rather
 * than the hero's gradient, and the three answers are rows instead of cards.
 *
 * With the scroll cinema on, the same words become the page's spoken moment
 * (`welcome-intro-cinema.tsx`): the sentence is set large and lights up word
 * by word as it is read, a waveform speaks under the heading, and the three
 * answers rise in after it. Without it — on the server, before hydration,
 * with reduced motion, large text or a short window — this layout is what
 * renders, and it reads the same.
 */

export const WELCOME_SENTENCE =
  "YO Voice is built for small groups who would rather speak than scroll. Your people gather in a Server, talk in its voice channels, and keep the conversation going in Chats when nobody is live. Short Voice Moments and media-first Yeels carry the rest.";

export type WelcomeRow = { icon: LucideIcon; title: string; text: string };

export const WELCOME_ROWS: readonly WelcomeRow[] = [
  {
    icon: Mic2,
    title: "Talk",
    text: "Voice channels inside a Server your circle shares.",
  },
  {
    icon: MessageCircle,
    title: "Stay",
    text: "Chats keep the thread between the people you know.",
  },
  {
    icon: AudioLines,
    title: "Share",
    text: "Voice Moments and Yeels for the hours in between.",
  },
];

export function WelcomeIntro() {
  const cinema = useCinema();
  return cinema ? (
    <WelcomeIntroCinema sentence={WELCOME_SENTENCE} rows={WELCOME_ROWS} />
  ) : (
    <WelcomeIntroStatic />
  );
}

/**
 * The static welcome. Its grid is one shrinkable track until `lg` and its
 * columns are `minmax(0, …)`, so at 200 % text on a phone a long word such as
 * "communities" wraps inside the page instead of widening it.
 */
function WelcomeIntroStatic() {
  return (
    <section
      id="welcome"
      aria-labelledby="welcome-heading"
      className="relative border-t border-[var(--border)] bg-[var(--background)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-8 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <p className="eyebrow">Welcome</p>
          <h2
            id="welcome-heading"
            className="section-title max-w-xl break-words hyphens-auto"
          >
            {/* The soft hyphen lets "communities" break as "commu-nities"
                where it cannot fit a line (200 % text on a phone) without
                relying on the browser having an English hyphenation
                dictionary; everywhere else it is invisible. */}
            Small commu{"\u00AD"}nities that{" "}
            <span className="text-[var(--accent)]">talk out loud.</span>
          </h2>
        </div>

        <div className="min-w-0">
          <p className="max-w-2xl break-words text-base leading-[1.6] text-[var(--text-secondary)]">
            {WELCOME_SENTENCE}
          </p>

          <ul className="mt-8 grid gap-6" aria-label="What YO Voice is for">
            {WELCOME_ROWS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="feature-row">
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="break-words text-[0.9375rem] font-bold text-[var(--foreground)]">
                    {title}
                  </h3>
                  <p className="mt-1 break-words text-sm leading-6 text-[var(--text-secondary)]">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
