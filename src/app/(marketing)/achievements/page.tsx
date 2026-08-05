import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Achievements",
  description: "How the YO Voice achievement system works, tier by tier.",
};

const tracks = [
  { icon: MessageSquare, title: "Messages", description: "Sent in chats and clubs." },
  { icon: UserPlus, title: "Followers", description: "People following your profile." },
  { icon: Mic2, title: "Voice minutes", description: "Time spent speaking in rooms." },
  { icon: Radio, title: "Rooms", description: "Rooms you've joined or hosted." },
  { icon: Users, title: "Communities", description: "Clubs you're part of." },
  { icon: Heart, title: "Friends", description: "Friend connections you've made." },
  { icon: Sparkles, title: "Reactions", description: "Reactions you've given and received." },
  { icon: Crown, title: "Host minutes", description: "Time spent hosting a room." },
  { icon: CalendarDays, title: "Active days", description: "Days you've shown up on YO Voice." },
  { icon: Activity, title: "Moments", description: "Voice moments you've recorded and shared." },
];

const rarities = [
  { name: "Common", color: "from-slate-400 to-slate-200" },
  { name: "Uncommon", color: "from-emerald-400 to-emerald-200" },
  { name: "Rare", color: "from-sky-400 to-sky-200" },
  { name: "Epic", color: "from-violet-500 to-fuchsia-300" },
  { name: "Legendary", color: "from-amber-400 to-amber-200" },
  { name: "Mythic", color: "from-fuchsia-500 to-rose-300" },
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
          <div className="text-center">
            <p className="eyebrow">Rarity tiers</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-.04em] text-white sm:text-4xl">
              From your first message to a mythic milestone
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {rarities.map((rarity) => (
              <div key={rarity.name} className="glass-panel rounded-2xl p-5 text-center">
                <div
                  className={`mx-auto h-2 w-10 rounded-full bg-gradient-to-r ${rarity.color}`}
                />
                <p className="mt-4 text-sm font-bold text-white">{rarity.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="eyebrow">Ten tracks</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-.04em] text-white sm:text-4xl">
              What actually earns you achievements
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/48">
              Each track has ten milestones, from your first step to a
              10,000-strong feat. Progress is tracked automatically as you
              use YO Voice.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {tracks.map(({ icon: Icon, title, description }) => (
              <article key={title} className="glass-panel rounded-[24px] p-6">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-bold text-white">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-white/45">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
