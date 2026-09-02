import Link from "next/link";
import { ArrowRight, Compass, DoorOpen, Mic2, ShieldCheck, UserPlus, Users } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Community",
  description: "Community rooms, friends and discovery on YO Voice.",
  path: "/community",
});

const highlights = [
  {
    icon: Users,
    title: "Look before you connect",
    description:
      "Opening a room shows a passive preview first. Audio, presence and microphone access begin only after you choose Join conversation.",
  },
  {
    icon: DoorOpen,
    title: "A lifecycle you choose",
    description:
      "When creating a room, choose whether it stays open or ends when its host leaves. The rule is clear before anyone joins.",
  },
  {
    icon: UserPlus,
    title: "Friends and follows",
    description:
      "Send, accept or cancel a friend request without duplicate states, then keep that identity current across search, Home and Chats.",
  },
  {
    icon: Compass,
    title: "Discover new people",
    description:
      "Find active rooms and clubs around topics you care about instead of starting from an empty feed.",
  },
  {
    icon: Mic2,
    title: "Chat stays within reach",
    description:
      "Compact room chat is visible when you arrive, remains readable beside the conversation and folds away whenever you want more space.",
  },
  {
    icon: ShieldCheck,
    title: "Moderated, not chaotic",
    description:
      "Hosts can mute or remove participants from People, helping every conversation stay focused and welcoming.",
  },
];

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title="Feel the room, not the interface."
        description="Community on YO Voice starts with one shared, live conversation — then grows into the friends, Clubs and creators you keep coming back to."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
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
        <div className="glass-panel mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-[32px] p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to build with others?</h2>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            Clubs turn a one-time conversation into an ongoing community —
            with chat, roles and rooms of its own.
          </p>
          <Link href="/clubs" className="premium-button focus-ring mt-2 min-h-12 px-6 text-sm">
            Explore clubs <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
