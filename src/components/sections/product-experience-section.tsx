"use client";

import {
  Crown,
  MessageCircle,
  Mic2,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Mic2,
    number: "01",
    title: "Community Rooms",
    description:
      "Natural voice spaces where everyone feels present. No rigid stage, no cold meeting-room atmosphere.",
    accent: "from-violet-500/25 to-fuchsia-500/5",
  },
  {
    icon: Radio,
    number: "02",
    title: "Broadcast Rooms",
    description:
      "Host structured live events, invite speakers and manage conversations with confidence.",
    accent: "from-red-500/20 to-fuchsia-500/5",
  },
  {
    icon: Crown,
    number: "03",
    title: "Clubs",
    description:
      "Create your own community, invite members, assign roles and build a space that belongs to you.",
    accent: "from-amber-500/20 to-purple-500/5",
  },
  {
    icon: UserPlus,
    number: "04",
    title: "Friends & Creators",
    description:
      "Connect with friends, follow creators and discover the people behind the voices.",
    accent: "from-cyan-500/20 to-violet-500/5",
  },
  {
    icon: Trophy,
    number: "05",
    title: "Achievements",
    description:
      "Unlock titles, collect achievements and turn your community journey into something visible.",
    accent: "from-fuchsia-500/25 to-orange-500/5",
  },
  {
    icon: ShieldCheck,
    number: "06",
    title: "Safe by Design",
    description:
      "Privacy, moderation and account controls are built into the experience from the beginning.",
    accent: "from-emerald-500/20 to-violet-500/5",
  },
];

export function ProductExperienceSection() {
  return (
    <section
      id="experience"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#0b0712] py-24 sm:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(138,43,226,0.15),transparent_34%)]" />
      <div className="grid-background absolute inset-0 opacity-30" />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-fuchsia-400">
              Built around people
            </p>

            <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
              More than another voice chat.
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 text-white/50 lg:justify-self-end">
            YO Voice combines communities, live conversation, creator tools and
            social discovery in one coherent experience. Every feature is
            designed to make online interaction feel more personal.
          </p>
        </div>

        <div
          id="features"
          className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="glass-panel group relative overflow-hidden rounded-3xl p-7 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/25"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-70 transition group-hover:opacity-100`}
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-fuchsia-300">
                      <Icon className="size-5" />
                    </span>

                    <span className="text-xs font-bold tracking-[0.2em] text-white/25">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-8 font-[family-name:var(--font-display)] text-xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/48">
                    {feature.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div
          id="clubs"
          className="mt-20 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
            className="glass-panel relative min-h-[520px] overflow-hidden rounded-[34px] p-7 sm:p-9"
          >
            <div className="absolute right-[-12%] top-[-20%] size-[360px] rounded-full bg-violet-600/20 blur-[100px]" />
            <div className="absolute bottom-[-25%] left-[-15%] size-[360px] rounded-full bg-fuchsia-600/14 blur-[110px]" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400">
                Clubs
              </p>

              <h3 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
                Build a place your people can call home.
              </h3>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/50">
                Create private or public clubs, organize members, assign roles
                and keep every conversation connected.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <ClubCard
                  icon={<ShieldCheck className="size-5" />}
                  title="Cybersecurity Hub"
                  members="312 members"
                  event="Blue Team Workshop"
                  accent="from-cyan-500/20 to-violet-500/10"
                />

                <ClubCard
                  icon={<Sparkles className="size-5" />}
                  title="Creator Circle"
                  members="184 members"
                  event="Growth Session"
                  accent="from-fuchsia-500/20 to-pink-500/10"
                />

                <ClubCard
                  icon={<Users className="size-5" />}
                  title="Gaming Nights"
                  members="1.2K members"
                  event="Community Night"
                  accent="from-violet-500/20 to-blue-500/10"
                />

                <ClubCard
                  icon={<MessageCircle className="size-5" />}
                  title="Open Conversations"
                  members="527 members"
                  event="Coffee & Voice"
                  accent="from-amber-500/15 to-purple-500/10"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            id="achievements"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
            className="glass-panel relative overflow-hidden rounded-[34px] p-7 sm:p-9"
          >
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-fuchsia-500/10 to-transparent" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400">
                Your journey
              </p>

              <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
                Every voice leaves a mark.
              </h3>

              <p className="mt-5 text-sm leading-7 text-white/50">
                Earn achievements, unlock titles and show how you contribute to
                the people around you.
              </p>

              <div className="mt-10 space-y-4">
                <AchievementCard
                  icon={<Trophy className="size-6" />}
                  title="First Speaker"
                  subtitle="Hosted your first conversation"
                  status="Unlocked"
                  progress={100}
                />

                <AchievementCard
                  icon={<Crown className="size-6" />}
                  title="Community Builder"
                  subtitle="Help your club reach 100 members"
                  status="82%"
                  progress={82}
                />

                <AchievementCard
                  icon={<Mic2 className="size-6" />}
                  title="Voice of the Week"
                  subtitle="Become one of the most active speakers"
                  status="Rare"
                  progress={38}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type ClubCardProps = {
  icon: React.ReactNode;
  title: string;
  members: string;
  event: string;
  accent: string;
};

function ClubCard({
  icon,
  title,
  members,
  event,
  accent,
}: ClubCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#120b1e]/75 p-5">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent}`}
      />

      <div className="relative">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-fuchsia-300">
          {icon}
        </div>

        <h4 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-white">
          {title}
        </h4>

        <p className="mt-1 text-xs text-white/40">{members}</p>

        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300">
            Tonight
          </p>
          <p className="mt-1 text-sm font-semibold text-white/75">{event}</p>
        </div>
      </div>
    </div>
  );
}

type AchievementCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: string;
  progress: number;
};

function AchievementCard({
  icon,
  title,
  subtitle,
  status,
  progress,
}: AchievementCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#120b1e]/72 p-5">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/35 to-fuchsia-500/25 text-fuchsia-200">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <h4 className="font-[family-name:var(--font-display)] font-bold text-white">
              {title}
            </h4>

            <span className="text-xs font-bold text-fuchsia-300">
              {status}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-white/40">{subtitle}</p>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
