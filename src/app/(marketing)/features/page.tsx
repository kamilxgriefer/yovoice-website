import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Crown,
  Mic,
  Mic2,
  Radio,
  ShieldCheck,
  Trophy,
  UserPlus,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Voice rooms, clubs, friends, achievements and notifications — everything inside YO Voice.",
};

const features = [
  {
    icon: Mic2,
    title: "Community rooms",
    description:
      "Open voice spaces where anyone can speak. No stage, no hierarchy — just a conversation everyone is part of.",
  },
  {
    icon: Radio,
    title: "Broadcast rooms",
    description:
      "Host events with structure: a stage, raised hands, and moderator controls for managing speakers and larger audiences.",
  },
  {
    icon: Mic,
    title: "Podcast rooms",
    description:
      "A focused format for hosts and guests to run a show-style conversation, built on the same real-time voice infrastructure.",
  },
  {
    icon: Crown,
    title: "Clubs",
    description:
      "Persistent communities with their own chat, roles, invites and dedicated rooms — public or invite-only.",
  },
  {
    icon: UserPlus,
    title: "Friends & following",
    description:
      "Follow creators, add friends and keep a feed of the people and communities you actually care about.",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description:
      "A real progression system across messages, hosting time, communities and more — from common to mythic.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Push and in-app alerts for friend requests, mentions and club activity, with granular controls for what you hear about.",
  },
  {
    icon: ShieldCheck,
    title: "Safety by default",
    description:
      "Email verification before you can post or host, plus blocking and room moderation tools built in from day one.",
  },
];

const deepDives = [
  { title: "Community", description: "Rooms, friends and discovery in depth.", href: "/community" },
  { title: "Clubs", description: "Build and run your own community.", href: "/clubs" },
  { title: "Achievements", description: "How progression works, tier by tier.", href: "/achievements" },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Everything inside YO Voice"
        description="Voice-first tools for hosting, connecting and belonging — built together, not bolted on."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="glass-panel rounded-[28px] p-7">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                  <Icon className="size-6" />
                </div>
                <h2 className="mt-6 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
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
              Explore each part of the experience
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {deepDives.map(({ title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="glass-panel group rounded-[28px] p-7 transition hover:-translate-y-1 hover:border-fuchsia-300/25"
              >
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-300 transition group-hover:text-white">
                  Learn more
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
