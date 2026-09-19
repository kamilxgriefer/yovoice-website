import { AudioLines, MessageCircle, Mic2 } from "lucide-react";

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
 */
export function WelcomeIntro() {
  return (
    <section
      id="welcome"
      aria-labelledby="welcome-heading"
      className="relative border-t border-[var(--border)] bg-[var(--background)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:gap-14">
        <div>
          <p className="eyebrow">Welcome</p>
          <h2 id="welcome-heading" className="section-title max-w-xl">
            Small communities that{" "}
            <span className="text-[var(--accent)]">talk out loud.</span>
          </h2>
        </div>

        <div>
          <p className="max-w-2xl text-base leading-[1.6] text-[var(--text-secondary)]">
            YO Voice is built for small groups who would rather speak than
            scroll. Your people gather in a Server, talk in its voice channels,
            and keep the conversation going in Chats when nobody is live. Short
            Voice Moments and media-first Yeels carry the rest.
          </p>

          <ul className="mt-8 grid gap-6" aria-label="What YO Voice is for">
            {[
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
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="feature-row">
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-[var(--foreground)]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
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
