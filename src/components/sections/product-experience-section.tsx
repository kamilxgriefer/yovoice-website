"use client";

import {
  Crown,
  Hand,
  Headphones,
  LockKeyhole,
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

const featureCards = [
  {
    icon: Mic2,
    title: "Community Rooms",
    label: "Speak naturally",
    description:
      "Open voice spaces built around shared presence instead of rigid stages and cold meeting layouts.",
    gradient: "from-violet-500/25 via-purple-500/8 to-transparent",
  },
  {
    icon: Radio,
    title: "Broadcast Rooms",
    label: "Lead the conversation",
    description:
      "Host live events, manage speakers, accept raised hands and connect with listeners at scale.",
    gradient: "from-rose-500/22 via-red-500/7 to-transparent",
  },
  {
    icon: Crown,
    title: "Clubs",
    label: "Build your home",
    description:
      "Create lasting communities with member roles, dedicated chats, events and private voice spaces.",
    gradient: "from-amber-500/18 via-fuchsia-500/7 to-transparent",
  },
  {
    icon: UserPlus,
    title: "Friends & Creators",
    label: "Stay connected",
    description:
      "Make friends, follow creators and discover the people behind the conversations you enjoy.",
    gradient: "from-cyan-500/20 via-violet-500/7 to-transparent",
  },
];

export function ProductExperienceSection() {
  return (
    <section
      id="experience"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#0b0712] py-28 sm:py-36"
    >
      <div className="grid-background absolute inset-0 opacity-20" />
      <div className="absolute left-[-10%] top-[5%] size-[500px] rounded-full bg-violet-700/12 blur-[150px]" />
      <div className="absolute right-[-12%] top-[42%] size-[520px] rounded-full bg-fuchsia-700/10 blur-[160px]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-400">
              Product experience
            </p>

            <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-white sm:text-6xl">
              Voice first.
              <span className="text-gradient block">Community always.</span>
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 text-white/50 lg:justify-self-end">
            YO Voice brings live conversations, friendships and communities
            into one connected world. Each part of the product is designed to
            make online interaction feel personal rather than mechanical.
          </p>
        </div>

        <div
          id="features"
          className="mt-16 grid gap-5 md:grid-cols-2"
        >
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.07,
                }}
                className="glass-panel group relative min-h-[310px] overflow-hidden rounded-[32px] p-7 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-300/25 sm:p-9"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-75 transition duration-500 group-hover:opacity-100`}
                />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex size-13 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-fuchsia-200">
                      <Icon className="size-6" />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/25">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="mt-auto pt-16">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
                      {feature.label}
                    </p>

                    <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
                      {feature.title}
                    </h3>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/48">
                      {feature.description}
                    </p>
                  </div>
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
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="glass-panel relative min-h-[650px] overflow-hidden rounded-[38px] p-7 sm:p-10"
          >
            <div className="absolute right-[-15%] top-[-20%] size-[420px] rounded-full bg-violet-600/20 blur-[110px]" />
            <div className="absolute bottom-[-25%] left-[-15%] size-[420px] rounded-full bg-fuchsia-600/14 blur-[120px]" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400">
                Community Room
              </p>

              <h3 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                Feel the room, not the interface.
              </h3>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">
                The Heart of the Community reacts to every voice. Speakers,
                listeners and shared energy become part of one living scene.
              </p>

              <div className="relative mx-auto mt-12 aspect-[1.25/1] w-full max-w-[700px] overflow-hidden rounded-[34px] border border-white/10 bg-[#100819]/80">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(192,38,255,0.26),transparent_32%)]" />
                <div className="grid-background absolute inset-0 opacity-25" />

                <div className="absolute left-[8%] top-[18%] flex items-center gap-3 rounded-2xl border border-fuchsia-300/20 bg-[#1a0d28]/85 px-4 py-3 backdrop-blur-xl">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-700 text-xs font-bold text-white">
                    MA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Maya</p>
                    <p className="text-[10px] text-fuchsia-300">
                      Speaking now
                    </p>
                  </div>
                </div>

                <div className="absolute right-[8%] top-[20%] rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white/60 backdrop-blur-xl">
                  <Users className="size-5" />
                </div>

                <div className="absolute left-1/2 top-1/2 flex size-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-fuchsia-300/30 bg-gradient-to-br from-violet-700 via-purple-500 to-fuchsia-500 shadow-[0_0_100px_rgba(192,38,255,0.55)]">
                  <Mic2 className="size-14 text-white" />
                </div>

                <div className="absolute bottom-[12%] left-1/2 flex -translate-x-1/2 gap-3">
                  {[Mic2, Headphones, MessageCircle, ShieldCheck].map(
                    (ControlIcon, index) => (
                      <div
                        key={index}
                        className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-[#170c23]/90 text-white/60 backdrop-blur-xl"
                      >
                        <ControlIcon className="size-4" />
                      </div>
                    ),
                  )}
                </div>

                <motion.div
                  className="absolute left-[27%] top-[38%] h-px w-[22%] origin-left bg-gradient-to-r from-fuchsia-300/70 to-transparent"
                  animate={{
                    opacity: [0.25, 0.9, 0.25],
                    scaleX: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="glass-panel relative min-h-[650px] overflow-hidden rounded-[38px] p-7 sm:p-10"
          >
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-red-500/10 to-transparent" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-400">
                Broadcast Room
              </p>

              <h3 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                Lead. Listen. Join.
              </h3>

              <p className="mt-5 text-sm leading-7 text-white/50">
                Broadcast rooms give hosts structure without losing the
                humanity of a real conversation.
              </p>

              <div className="mt-10 space-y-4">
                <BroadcastRow
                  icon={<Radio className="size-5" />}
                  title="Live broadcast"
                  subtitle="1,248 listeners"
                  badge="LIVE"
                />

                <BroadcastRow
                  icon={<Mic2 className="size-5" />}
                  title="Current speakers"
                  subtitle="Host and 3 guests"
                  badge="4"
                />

                <BroadcastRow
                  icon={<Hand className="size-5" />}
                  title="Raised hands"
                  subtitle="Listeners waiting to speak"
                  badge="12"
                />

                <BroadcastRow
                  icon={<ShieldCheck className="size-5" />}
                  title="Moderator controls"
                  subtitle="Mute, remove and manage access"
                  badge="ON"
                />
              </div>

              <div className="mt-8 rounded-[30px] border border-rose-400/15 bg-gradient-to-br from-rose-500/12 to-transparent p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">
                      Next speaker
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      Alex requested the stage
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div
          id="achievements"
          className="mt-20 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="glass-panel rounded-[38px] p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400">
              Clubs and friends
            </p>

            <h3 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
              Find your people.
            </h3>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/50">
              Build private clubs, meet new friends and stay close to the
              creators and communities that matter to you.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <SocialCard
                icon={<Crown className="size-5" />}
                title="Cybersecurity Hub"
                subtitle="312 members"
                action="Join club"
              />

              <SocialCard
                icon={<Users className="size-5" />}
                title="Gaming Nights"
                subtitle="1.2K members"
                action="View club"
              />

              <SocialCard
                icon={<MessageCircle className="size-5" />}
                title="Alex"
                subtitle="Online now"
                action="Message"
              />

              <SocialCard
                icon={<UserPlus className="size-5" />}
                title="Maya"
                subtitle="Creator"
                action="Follow"
              />
            </div>
          </div>

          <div className="glass-panel relative overflow-hidden rounded-[38px] p-7 sm:p-10">
            <div className="absolute right-[-16%] top-[-20%] size-[380px] rounded-full bg-fuchsia-600/15 blur-[110px]" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400">
                Achievements
              </p>

              <h3 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                Every voice leaves a mark.
              </h3>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/50">
                Unlock titles, collect achievements and show how you contribute
                to the communities around you.
              </p>

              <div className="mt-10 space-y-4">
                <AchievementCard
                  icon={<Trophy className="size-6" />}
                  title="First Speaker"
                  description="Hosted your first live conversation"
                  label="Unlocked"
                  progress={100}
                />

                <AchievementCard
                  icon={<Crown className="size-6" />}
                  title="Community Builder"
                  description="Help your club reach 100 members"
                  label="82%"
                  progress={82}
                />

                <AchievementCard
                  icon={<Sparkles className="size-6" />}
                  title="Voice of the Week"
                  description="Become one of the most active speakers"
                  label="Rare"
                  progress={38}
                />

                <AchievementCard
                  icon={<LockKeyhole className="size-6" />}
                  title="Hidden achievement"
                  description="Keep exploring YO Voice to discover it"
                  label="Locked"
                  progress={8}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type BroadcastRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
};

function BroadcastRow({
  icon,
  title,
  subtitle,
  badge,
}: BroadcastRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#130b1e]/75 p-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-white/40">{subtitle}</p>
      </div>

      <span className="rounded-full border border-rose-400/15 bg-rose-400/10 px-3 py-1 text-[10px] font-bold text-rose-300">
        {badge}
      </span>
    </div>
  );
}

type SocialCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: string;
};

function SocialCard({
  icon,
  title,
  subtitle,
  action,
}: SocialCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#130b1e]/72 p-5">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-300">
        {icon}
      </div>

      <h4 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-white">
        {title}
      </h4>

      <p className="mt-1 text-xs text-white/40">{subtitle}</p>

      <button
        type="button"
        className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        {action}
      </button>
    </div>
  );
}

type AchievementCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  label: string;
  progress: number;
};

function AchievementCard({
  icon,
  title,
  description,
  label,
  progress,
}: AchievementCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#130b1e]/72 p-5">
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
              {label}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-white/40">
            {description}
          </p>

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
