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
    title: "Servers · in internal testing",
    description:
      "Choose Friends, Community, Podcast, Family or Company from one compact selector. The interface is in internal testing; server creation and channel activity remain behind the backend release gate.",
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
      "The Build 27 candidate bundles 16 original GIF animations. GIF search and sending wait for a backend rollout that has not happened yet, so GIFs are not available in any build today.",
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
  { title: "Servers", description: "Five types and the backend release boundary.", href: "/servers" },
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
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="glass-panel rounded-[28px] p-7">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="eyebrow">Go deeper</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-.04em] text-white sm:text-4xl">
              Explore the current experience
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {deepDives.map(({ title, description, href }) => (
              <Link key={title} href={href} className="glass-panel group rounded-[28px] p-7 transition hover:-translate-y-1 hover:border-fuchsia-300/25">
                <Sparkles className="size-5 text-fuchsia-200" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-300 transition group-hover:text-white">
                  Learn more <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
