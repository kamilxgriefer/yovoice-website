import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Hand, Mic2, ShieldCheck, UserPlus, Users } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Community",
  description: "Community rooms, friends and discovery on YO Voice.",
};

const highlights = [
  {
    icon: Mic2,
    title: "Open by design",
    description:
      "Community rooms have no stage and no gatekeeping — everyone in the room can speak, and everyone is visible.",
  },
  {
    icon: Hand,
    title: "Raise your hand",
    description:
      "In structured rooms, raising your hand signals you want to speak without interrupting — hosts bring you up when it's your turn.",
  },
  {
    icon: UserPlus,
    title: "Friends and follows",
    description:
      "Follow the creators and rooms you like, add friends you meet, and build a circle that follows you across YO Voice.",
  },
  {
    icon: Compass,
    title: "Discover new people",
    description:
      "Find active rooms and clubs around topics you care about instead of starting from an empty feed.",
  },
  {
    icon: Users,
    title: "Presence that feels real",
    description:
      "See who's online, who's speaking, and who just joined — community should feel alive, not like a static directory.",
  },
  {
    icon: ShieldCheck,
    title: "Moderated, not chaotic",
    description:
      "Hosts can mute, remove or manage access at any time, so open rooms stay open without becoming unmanageable.",
  },
];

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title="Feel the room, not the interface."
        description="Community on YO Voice starts with a real, live conversation — then grows into the friends, clubs and creators you keep coming back to."
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
        <div className="glass-panel mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-[32px] p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to build with others?</h2>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            Clubs turn a one-time conversation into an ongoing community —
            with chat, roles and rooms of its own.
          </p>
          <Link href="/clubs" className="premium-button focus-ring mt-2 min-h-12 px-6 text-sm">
            Explore clubs <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
