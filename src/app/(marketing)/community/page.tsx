import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  House,
  MessageCircle,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Community",
  description: "How Home, Chats, Friends, Creator audience and YO Moments connect people in the current YO Voice tester build.",
  path: "/community",
});

const highlights = [
  {
    icon: House,
    title: "Your people lead Home",
    description:
      "Friends stay at the top, recent private Chats stay close, and a clear server invitation replaces the old room-heavy starting point.",
  },
  {
    icon: MessageCircle,
    title: "Chats open the next connection",
    description:
      "Add Friend is visible beside New Message, so a new member can move from conversation to discovery without hunting through settings.",
  },
  {
    icon: UserPlus,
    title: "Friends explains each path",
    description:
      "Adding someone new is separate from filtering current friends, with dedicated All, Online, Requests and Blocked views.",
  },
  {
    icon: Users,
    title: "Following belongs to Creators",
    description:
      "Audience visibility appears only for a Premium Creator profile after age verification and explicit opt-in. The server derives eligibility before it becomes public.",
  },
  {
    icon: Clapperboard,
    title: "Voice and Yeels feel related",
    description:
      "YO Moments keeps one header, typography and control language across voice posts and media-first Yeels, while preserving the needs of each format.",
  },
  {
    icon: ShieldCheck,
    title: "Boundaries stay visible",
    description:
      "Blocking, reporting, email verification and server-side checks remain part of the path into friendship, publishing and Creator visibility.",
  },
] as const;

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="People on YO Voice"
        title="A clearer path from hello to conversation."
        description="Home, Chats and Friends now explain where to start. Creator following stays behind verified Premium Creator eligibility instead of appearing as a default social layer for every account."
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
        <div className="glass-panel mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-[32px] p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold">See where every circle can begin</h2>
          <p className="max-w-xl text-sm leading-7 text-white/60">
            The Servers selector covers Friends, Community, Podcast, Family
            and Company. The interface is in internal testing while
            server-backed activation remains gated.
          </p>
          <Link href="/servers" className="premium-button focus-ring mt-2 min-h-12 px-6 text-sm">
            Explore Servers <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
