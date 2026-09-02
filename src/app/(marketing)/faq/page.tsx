import { FaqAccordion, type FaqGroup } from "@/components/marketing/faq-accordion";
import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FAQ",
  description: "Answers to common questions about accounts, rooms, clubs and downloads.",
  path: "/faq",
});

const groups: FaqGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        question: "Is YO Voice free?",
        answer:
          "Yes. Creating an account, joining rooms and clubs, and using the web app are all free.",
      },
      {
        question: "What platforms is YO Voice available on?",
        answer:
          "The web app is live in modern browsers. YO Voice 1.0.0 build 18 is available to invited testers through Google Play Internal Testing and TestFlight. Public store and desktop releases are not available yet.",
      },
      {
        question: "Do I need to verify my email?",
        answer:
          "Yes. Verifying your email unlocks posting, hosting rooms, messaging and downloads. It's a quick link sent to your inbox after you register.",
      },
    ],
  },
  {
    title: "Rooms and voice",
    items: [
      {
        question: "What's the difference between a community room and a podcast room?",
        answer:
          "Community rooms are open conversations where everyone can speak. Podcast rooms give a host structure — a stage, raised hands and speaker management — for events and larger audiences.",
      },
      {
        question: "Can I record a room?",
        answer:
          "We don't record live rooms. You can record and share a standalone voice moment any time you want to post a specific clip.",
      },
      {
        question: "Who can moderate a room?",
        answer:
          "The host and anyone they grant moderator access to can mute or remove participants and manage who can speak. Community Rooms keep everyone in one People here roster; Podcast Rooms keep the structured host and speaker workflow.",
      },
    ],
  },
  {
    title: "Clubs and achievements",
    items: [
      {
        question: "What is a club?",
        answer:
          "A club is a community space with its own chat, members and rooms — public or invite-only, run by its owner and moderators.",
      },
      {
        question: "How do achievements work?",
        answer:
          "Achievements unlock as you use YO Voice — sending messages, growing your following, hosting rooms and more — across common, uncommon, rare, epic, legendary and mythic tiers.",
      },
    ],
  },
  {
    title: "Account and privacy",
    items: [
      {
        question: "Can I delete my account?",
        answer:
          "Yes, at any time from your account settings, or by emailing privacy@yovoice.app if you need help.",
      },
      {
        question: "Do you sell my data?",
        answer:
          "No. See our Privacy Policy for exactly what we collect and why.",
      },
      {
        question: "How do I report abuse?",
        answer:
          "Block the person from your Friends screen, and email safety@yovoice.app with details — see our Safety page.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Can't find your answer here? Reach out on our Contact page."
      />
      <section className="px-5 pb-28 sm:px-8">
        <FaqAccordion groups={groups} />
      </section>
    </>
  );
}
