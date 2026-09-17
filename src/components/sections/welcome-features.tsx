import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Clapperboard,
  LayoutGrid,
  MessageCircle,
  UserPlus,
} from "lucide-react";

/**
 * What YO Voice gives you, described the way the audited /features page
 * describes it. Each card names a surface that exists under its current
 * name, and the Servers card repeats the one boundary that matters to a
 * newcomer — the interface is in internal testing and the backend gate has
 * not been cleared — without turning the homepage into release notes.
 */
const features = [
  {
    icon: LayoutGrid,
    title: "Servers",
    description:
      "Friends, Community, Podcast, Family and Company: five kinds of space, each with its own voice channels and chats. The interface is in internal testing; creation and channel activity stay behind the backend release gate.",
  },
  {
    icon: MessageCircle,
    title: "Chats",
    description:
      "Start a private conversation, send text, voice, photos or video, and open shared media in a responsive full-screen viewer.",
  },
  {
    icon: AudioLines,
    title: "Voice Moments",
    description:
      "Record, review and share a short voice update inside YO Moments. Published Moments last a day, then make room for the next one.",
  },
  {
    icon: Clapperboard,
    title: "Yeels",
    description:
      "Your own photo or short video comes first, with movable text and link overlays, and audio you own or license.",
  },
  {
    icon: UserPlus,
    title: "Friends",
    description:
      "A visible Add Friend action, plain-language search, and separate All, Online, Requests and Blocked views.",
  },
] as const;

export function WelcomeFeatures() {
  return (
    <section
      id="features"
      aria-labelledby="welcome-features-heading"
      className="relative overflow-hidden border-t border-white/[.06] bg-[var(--surface-sunken)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div
        className="pointer-events-none absolute right-[-10%] top-[10%] size-[420px] rounded-full bg-fuchsia-700/10 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1240px]">
        <div className="max-w-2xl">
          <p className="eyebrow">What you get</p>
          <h2
            id="welcome-features-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.06] tracking-[-.045em] text-white sm:text-5xl"
          >
            One place for the
            <span className="text-gradient text-gradient-descender-safe block">
              people you talk to.
            </span>
          </h2>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="glass-panel min-w-0 rounded-[24px] p-5 sm:p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[.045] text-[var(--accent)]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold text-white">
                {title}
              </h3>
              <p className="mt-2.5 text-sm leading-6 text-[var(--text-secondary)]">
                {description}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href="/features"
          className="premium-button-secondary focus-ring mt-8 min-h-12 w-fit px-5 text-sm"
        >
          See every feature
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
