import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Hash,
  Lock,
  MessageCircle,
  Mic2,
  Radio,
  UserCog,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Build a lasting community around your rooms with YO Voice clubs.",
};

const highlights = [
  {
    icon: Crown,
    title: "Yours to run",
    description:
      "Create a club in minutes and own it — set the name, the vibe and who's welcome.",
  },
  {
    icon: Lock,
    title: "Public or invite-only",
    description:
      "Open your club to anyone, or keep it invite-only with member requests you approve.",
  },
  {
    icon: Hash,
    title: "Channels for chat",
    description:
      "Text channels keep conversation organized between live rooms, so nothing gets lost.",
  },
  {
    icon: Mic2,
    title: "Rooms tied to your club",
    description:
      "Host community, broadcast or podcast rooms directly from your club so members always know where to find you.",
  },
  {
    icon: UserCog,
    title: "Roles and permissions",
    description:
      "Promote trusted members to moderators, manage who can post or speak, and keep control as your club grows.",
  },
  {
    icon: MessageCircle,
    title: "Voice moments",
    description:
      "Members can record and share short voice clips in the club — a quick way to keep the energy going between live rooms.",
  },
];

const steps = [
  { title: "Create your club", description: "Name it, describe it, and choose public or invite-only." },
  { title: "Invite your people", description: "Share an invite link or approve requests as they come in." },
  { title: "Go live", description: "Start a room from inside your club and bring the conversation to life." },
];

export default function ClubsPage() {
  return (
    <>
      <PageHero
        eyebrow="Clubs"
        title="Find your people. Keep them close."
        description="A club is your own space on YO Voice — chat, roles, rooms and members, all in one place you control."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
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
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="eyebrow">Getting started</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-.04em] text-white sm:text-4xl">
              From idea to live club in three steps
            </h2>
          </div>
          <div className="mt-10 space-y-4">
            {steps.map((step, index) => (
              <div key={step.title} className="glass-panel flex items-start gap-5 rounded-3xl p-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/50">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-28 sm:px-8">
        <div className="glass-panel mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-[32px] p-10 text-center">
          <Radio className="size-8 text-fuchsia-300" />
          <h2 className="text-2xl font-bold">Start your club today</h2>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            Sign up, verify your email, and create your first club from the
            app in a couple of minutes.
          </p>
          <Link href="/register" className="premium-button focus-ring mt-2 min-h-12 px-6 text-sm">
            Create your account <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
