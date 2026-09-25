import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Download,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Help Center",
  description: "Guides and answers for getting the most out of YO Voice.",
  path: "/help-center",
});

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
    icon: MessageCircle,
    title: "Chats, Friends & Yeels",
    description:
      "Adding friends, private media, voice and video calls, Voice Moments and media-first Yeels.",
    href: "/features",
    linkLabel: "Explore conversations",
  },
  {
    icon: Crown,
    title: "Servers",
    description:
      "Understand the five server types, what you can do in a Server today, and what is still switched off.",
    href: "/servers",
    linkLabel: "Explore Servers",
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
      "Blocking, reporting, server-side eligibility checks and how to report a problem.",
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
            <article key={title} className="panel flex flex-col p-7">
              <div className="icon-tile">
                <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-bold text-[var(--foreground)]">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              <Link
                href={href}
                className="link-accent focus-ring mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold"
              >
                {linkLabel} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
