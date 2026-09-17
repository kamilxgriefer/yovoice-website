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
 */
export function WelcomeIntro() {
  return (
    <section
      id="welcome"
      aria-labelledby="welcome-heading"
      className="relative overflow-hidden border-t border-white/[.06] bg-[var(--background)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="grid-background absolute inset-0 opacity-15" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(123,47,247,.16),transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:gap-14">
        <div>
          <p className="eyebrow">Welcome</p>
          <h2
            id="welcome-heading"
            className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.06] tracking-[-.045em] text-white sm:text-5xl"
          >
            Small communities that
            <span className="text-gradient text-gradient-descender-safe block">
              talk out loud.
            </span>
          </h2>
        </div>

        <div>
          <p className="max-w-2xl text-[15px] leading-7 text-[var(--text-secondary)] sm:text-base sm:leading-8">
            YO Voice is built for small groups who would rather speak than
            scroll. Your people gather in a Server, talk in its voice channels,
            and keep the conversation going in Chats when nobody is live. Short
            Voice Moments and media-first Yeels carry the rest.
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="What YO Voice is for">
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
              <li key={title} className="glass-panel rounded-[20px] p-4 sm:p-5">
                <span className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[.045] text-[var(--accent)]">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
