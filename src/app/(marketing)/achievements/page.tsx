import {
  Activity,
  CalendarDays,
  Crown,
  Heart,
  Mic2,
  MessageSquare,
  Radio,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Achievements",
  description: "How the YO Voice achievement system works, tier by tier.",
  path: "/achievements",
});

const tracks = [
  { icon: MessageSquare, title: "Messages", description: "Sent in private Chats and compatible community spaces." },
  { icon: UserPlus, title: "Creator audience", description: "Follower milestones for eligible, opted-in Creator profiles." },
  { icon: Mic2, title: "Voice minutes", description: "Time spent speaking in live voice conversations." },
  { icon: Radio, title: "Voice activity", description: "Compatible participation and hosting activity from existing data." },
  { icon: Users, title: "Communities", description: "Community membership progress preserved as Servers arrive." },
  { icon: Heart, title: "Friends", description: "Friend connections you've made." },
  { icon: Sparkles, title: "Reactions", description: "Reactions you've given and received." },
  { icon: Crown, title: "Host minutes", description: "Time spent hosting live voice conversations." },
  { icon: CalendarDays, title: "Active days", description: "Days you've shown up on YO Voice." },
  { icon: Activity, title: "Moments", description: "Voice Moments you've recorded and shared." },
];

const rarities = [
  { name: "Common", color: "bg-slate-300" },
  { name: "Uncommon", color: "bg-emerald-300" },
  { name: "Rare", color: "bg-sky-300" },
  { name: "Epic", color: "bg-violet-400" },
  { name: "Legendary", color: "bg-amber-300" },
  { name: "Mythic", color: "bg-fuchsia-400" },
];

export default function AchievementsPage() {
  return (
    <>
      <PageHero
        eyebrow="Achievements"
        title="Every voice leaves a mark."
        description="Ten tracks, each with ten tiers from Common to Mythic — a real record of how you've shown up on YO Voice."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Rarity tiers</p>
            <h2 className="section-title">
              From your first message to a mythic milestone
            </h2>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {rarities.map((rarity) => (
              <li key={rarity.name} className="panel flex min-h-12 items-center gap-3 px-4 py-3">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${rarity.color}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-[var(--foreground)]">{rarity.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Ten tracks</p>
            <h2 className="section-title">
              What actually earns you achievements
            </h2>
            <p className="section-copy">
              Each track has ten milestones, from your first step to a
              10,000-strong feat. Progress is tracked automatically as you
              use YO Voice. Some counters retain earlier internal data names so
              existing progress is not discarded during the Servers transition.
            </p>
          </div>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
            {tracks.map(({ icon: Icon, title, description }) => (
              <li key={title} className="feature-row">
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[var(--foreground)]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
