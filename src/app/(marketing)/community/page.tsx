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
      "Home shows your friends' Moments, the channels that are live right now and your servers, in one calmer design in Dark and Pearl.",
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
        <div className="mx-auto max-w-5xl">
          <ul className="grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="feature-row">
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[var(--foreground)]">{title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="panel mx-auto flex max-w-4xl flex-col items-center gap-4 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">See where every circle can begin</h2>
          <p className="max-w-xl text-base leading-[1.6] text-[var(--text-secondary)]">
            The Servers selector covers Friends, Community, Podcast, Family
            and Company, and every signed-in account can create or join one.
            Podcast recording remains disabled.
          </p>
          <Link href="/servers" className="premium-button focus-ring mt-2">
            Explore Servers <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
