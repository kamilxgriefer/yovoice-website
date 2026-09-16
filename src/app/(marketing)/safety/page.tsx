import Link from "next/link";
import { Ban, Flag, Mail, ShieldCheck, UserCog } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Community Safety",
  description: "How YO Voice protects private Chats, moments, voice conversations and community activity.",
  path: "/safety",
});

const tools = [
  {
    icon: UserCog,
    title: "Conversation and content moderation",
    description:
      "Supported live-voice and content surfaces provide host, moderator and reporting controls. Server actions in the tester build remain behind the backend release gate.",
  },
  {
    icon: Ban,
    title: "Block anyone, instantly",
    description:
      "Blocking is available from Friends and supported profile or content views, removing the connection and limiting future contact through the app.",
  },
  {
    icon: Flag,
    title: "Report a problem",
    description:
      "Supported content and profiles include in-app reporting. You can also email the safety address below when you need more help.",
  },
  {
    icon: ShieldCheck,
    title: "Account-level protection",
    description:
      "Email verification is required before protected posting and messaging actions, which reduces throwaway and spam activity.",
  },
];

const rules = [
  "No harassment, hate speech, threats or targeted abuse.",
  "No sharing sexual content involving minors — zero tolerance, reported to authorities where required by law.",
  "No doxxing or sharing someone else's private information without consent.",
  "No recording or redistributing live audio without the participants' consent.",
  "No spam, scams or coordinated inauthentic behavior.",
  "No impersonating another person, brand or YO Voice staff.",
];

export default function SafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Safety"
        title="Built for real conversation, not abuse."
        description="Voice is powerful — it deserves guardrails. Here's what's in place today, and how to reach us."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2">
            {tools.map(({ icon: Icon, title, description }) => (
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
        <div className="mx-auto max-w-4xl">
          <div className="glass-panel rounded-[36px] p-8 sm:p-10">
            <p className="eyebrow">Community guidelines</p>
            <h2 className="section-title">What&apos;s never okay on YO Voice.</h2>
            <ul className="prose-legal mt-8 space-y-3 text-sm leading-7 text-white/60">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-7 text-white/65">
              Breaking these rules can lead to content removal, community
              restrictions or account suspension — see our{" "}
              <Link href="/terms" className="text-fuchsia-300 hover:text-white">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-28 sm:px-8">
        <div className="glass-panel mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-[32px] p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <Mail className="size-6" />
          </div>
          <h2 className="text-2xl font-bold">Report something</h2>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            Email <strong className="text-white">safety@yovoice.app</strong> with
            what happened, who was involved, and a screenshot or content or
            profile name if you have one. Urgent safety issues get priority.
          </p>
          <a
            href="mailto:safety@yovoice.app?subject=Safety report"
            className="premium-button focus-ring mt-2 min-h-12 px-6 text-sm"
          >
            Email safety@yovoice.app
          </a>
        </div>
      </section>
    </>
  );
}
