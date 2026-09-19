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
 *
 * The descriptions are unchanged. What changed is that five boxes became
 * five rows: an icon tile, a title and the same sentence, in two columns on
 * a wide screen and one on a phone.
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
      className="relative border-t border-[var(--border)] bg-[var(--surface-sunken)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="max-w-2xl">
          <p className="eyebrow">What you get</p>
          <h2 id="welcome-features-heading" className="section-title">
            One place for the{" "}
            <span className="text-[var(--accent)]">people you talk to.</span>
          </h2>
        </div>

        <ul className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="feature-row">
              <span className="icon-tile">
                <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Link href="/features" className="premium-button-secondary focus-ring mt-10 w-fit">
          See every feature
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
