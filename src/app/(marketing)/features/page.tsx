import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Bell,
  CircleUserRound,
  Clapperboard,
  Languages,
  LayoutGrid,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Volume2,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Features",
  description:
    "Explore the Servers interface, refreshed Home, Chats, Friends, YO Moments and media-first Yeels in YO Voice internal testing.",
  path: "/features",
});

const features = [
  {
    icon: LayoutGrid,
    title: "Servers · open to every signed-in account",
    description:
      "Choose Friends, Community, Podcast, Family or Company from one compact selector. Creating a Server, joining one, sending invites and using its voice and text channels have been open to every signed-in account since Build 30; Podcast recording remains disabled.",
  },
  {
    icon: MessageCircle,
    title: "Private Chats",
    description:
      "Start a private conversation, send text, voice, photos or video, and open shared media in a responsive full-screen viewer with clear loading and recovery states.",
  },
  {
    icon: UserPlus,
    title: "Friends",
    description:
      "A visible Add Friend action, plain-language search and separate All, Online, Requests and Blocked views make the social graph easier to understand.",
  },
  {
    icon: AudioLines,
    title: "Voice Moments",
    description:
      "Record, review and share short voice updates inside YO Moments. Discovery, playback and creation use the same visual hierarchy as Yeels.",
  },
  {
    icon: Clapperboard,
    title: "Yeels",
    description:
      "Create with your own photo or short video, movable text and link overlays, and audio you own or license. Media remains the focus across phone and desktop.",
  },
  {
    icon: Sparkles,
    title: "YO Voice Originals",
    description:
      "Sixteen original YO Voice GIF animations ship in the app and can be sent in private Chats since Build 30. They are a first-party catalogue; no third-party GIF provider is connected.",
  },
  {
    icon: PhoneCall,
    title: "Private voice and video calls",
    description:
      "Tester builds carry call setup, teardown and retry corrections into internal testing. Quality still depends on the devices and network involved.",
  },
  {
    icon: CircleUserRound,
    title: "Creator audience",
    description:
      "Following is reserved for a Premium Creator profile after age verification and explicit opt-in. Public audience visibility is derived by the server, rather than trusted from a browser control.",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description:
      "A progression system recognises messages, moments and community milestones across common, uncommon, rare, epic, legendary and mythic tiers.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Push and in-app alerts cover friend requests, private messages, mentions and replies, with account-level controls that preserve the existing backend preference keys.",
  },
  {
    icon: ShieldCheck,
    title: "Safety by default",
    description:
      "Email verification, blocking, reporting and moderation checks stay part of the product foundation, with privileged actions enforced on the server.",
  },
  {
    icon: Volume2,
    title: "An original sound identity",
    description:
      "Optional original sound cues mark meaningful events without replacing device volume, notification settings or Do Not Disturb controls.",
  },
  {
    icon: Languages,
    title: "A broader language choice",
    description:
      "Polish is a production option and the core interface spans major European and global locales, with English fallback where specialist screens are still being translated.",
  },
] as const;

const deepDives = [
  { title: "Servers", description: "Five types, open to every signed-in account.", href: "/servers" },
  { title: "Community", description: "Home, Chats, Friends and Creator audience.", href: "/community" },
  { title: "Updates", description: "Verified tester-build and release status.", href: "/updates" },
] as const;

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features in testing"
        title="One YO Voice, from Home to Yeels"
        description="The same visual language now connects Servers, private Chats, Friends and YO Moments. Every release boundary is stated where it matters."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <ul className="grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="feature-row">
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[var(--foreground)]">{title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[var(--border)] px-5 py-16 sm:mt-8 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Go deeper</p>
            <h2 className="section-title">Explore the current experience</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {deepDives.map(({ title, description, href }) => (
              <Link key={title} href={href} className="panel focus-ring group p-6 hover:border-[var(--border-strong)]!">
                <h3 className="text-lg font-bold text-[var(--foreground)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition group-hover:text-[var(--foreground)]">
                  Learn more <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
