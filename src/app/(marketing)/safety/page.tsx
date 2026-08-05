import type { Metadata } from "next";
import Link from "next/link";
import { Ban, Flag, Mail, ShieldCheck, UserCog } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Community Safety",
  description: "How YO Voice keeps rooms, clubs and conversations safe.",
};

const tools = [
  {
    icon: UserCog,
    title: "Room and club moderation",
    description:
      "Hosts and club owners can mute, remove or manage the access of anyone in their room or club at any time.",
  },
  {
    icon: Ban,
    title: "Block anyone, instantly",
    description:
      "Blocking someone removes them from your friends and hides their messages and rooms from you immediately — from your Friends screen.",
  },
  {
    icon: Flag,
    title: "Report a problem",
    description:
      "An in-app report button is on our roadmap. Until then, email us with details and we'll act on it quickly — see below.",
  },
  {
    icon: ShieldCheck,
    title: "Account-level protection",
    description:
      "Email verification is required before you can post, host a room or message others, which cuts down on throwaway and spam accounts.",
  },
];

const rules = [
  "No harassment, hate speech, threats or targeted abuse.",
  "No sharing sexual content involving minors — zero tolerance, reported to authorities where required by law.",
  "No doxxing or sharing someone else's private information without consent.",
  "No recording or redistributing a room's audio without the participants' consent.",
  "No spam, scams or coordinated inauthentic behavior.",
  "No impersonating another person, brand or YO Voice staff.",
];

export default function SafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Safety"
        title="Built for real conversation, not abuse."
        description="Voice is powerful — it deserves guardrails. Here's what's in place today, and how to reach us."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2">
            {tools.map(({ icon: Icon, title, description }) => (
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
          <div className="glass-panel rounded-[36px] p-8 sm:p-10">
            <p className="eyebrow">Community guidelines</p>
            <h2 className="section-title">What&apos;s never okay on YO Voice.</h2>
            <ul className="prose-legal mt-8 space-y-3 text-sm leading-7 text-white/60">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-7 text-white/45">
              Breaking these rules can lead to content removal, room or club
              restrictions, or account suspension — see our{" "}
              <Link href="/terms" className="text-fuchsia-300 hover:text-white">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-28 sm:px-8">
        <div className="glass-panel mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-[32px] p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <Mail className="size-6" />
          </div>
          <h2 className="text-2xl font-bold">Report something</h2>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            Email <strong className="text-white">safety@yovoice.app</strong> with
            what happened, who was involved, and a screenshot or room/club
            name if you have one. Urgent safety issues get priority.
          </p>
          <a
            href="mailto:safety@yovoice.app?subject=Safety report"
            className="premium-button focus-ring mt-2 min-h-12 px-6 text-sm"
          >
            Email safety@yovoice.app
          </a>
        </div>
      </section>
    </>
  );
}
