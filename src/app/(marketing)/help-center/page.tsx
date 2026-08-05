import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Download,
  Mail,
  Mic2,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Guides and answers for getting the most out of YO Voice.",
};

const topics = [
  {
    icon: UserCircle,
    title: "Account & verification",
    description:
      "Registering, verifying your email, resetting your password and managing your profile.",
    href: "/faq",
    linkLabel: "Account FAQs",
  },
  {
    icon: Mic2,
    title: "Rooms & voice",
    description:
      "Community rooms, broadcast rooms, raising your hand, and hosting your own conversation.",
    href: "/features",
    linkLabel: "How rooms work",
  },
  {
    icon: Crown,
    title: "Clubs & achievements",
    description:
      "Creating a club, managing members, and how the achievement system works.",
    href: "/clubs",
    linkLabel: "Explore clubs",
  },
  {
    icon: Download,
    title: "Downloads",
    description:
      "Getting YO Voice on web today, and what's coming to desktop and mobile.",
    href: "/download",
    linkLabel: "Download YO Voice",
  },
  {
    icon: ShieldCheck,
    title: "Safety & moderation",
    description:
      "Blocking, room moderation tools and how to report a problem.",
    href: "/safety",
    linkLabel: "Read our safety guidelines",
  },
  {
    icon: Mail,
    title: "Still stuck?",
    description:
      "Email us directly and a real person will get back to you.",
    href: "/contact",
    linkLabel: "Contact support",
  },
];

export default function HelpCenterPage() {
  return (
    <>
      <PageHero
        eyebrow="Help Center"
        title="How can we help?"
        description="Browse by topic, or jump straight to our FAQ or Contact page."
      />
      <section className="px-5 pb-28 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topics.map(({ icon: Icon, title, description, href, linkLabel }) => (
            <article key={title} className="glass-panel flex flex-col rounded-[28px] p-7">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                <Icon className="size-6" />
              </div>
              <h2 className="mt-6 text-lg font-bold">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-white/50">{description}</p>
              <Link
                href={href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-300 transition hover:text-white"
              >
                {linkLabel} <ArrowRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
