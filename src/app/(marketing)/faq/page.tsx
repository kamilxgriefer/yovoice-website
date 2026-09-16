import { FaqAccordion, type FaqGroup } from "@/components/marketing/faq-accordion";
import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FAQ",
  description: "Answers about tester builds, Servers, Yeels, Chats, Friends, Creator audience, Premium and downloads.",
  path: "/faq",
});

const groups: FaqGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        question: "Is YO Voice free?",
        answer:
          "Yes. Creating an account, using the web app, adding friends and starting private Chats are free. After Servers launch, a Free account can own up to 5 Servers, a Premium account up to 30, and everyone can join without a limit. Those allowances and server-backed actions are not active while the backend release gate remains closed.",
      },
      {
        question: "Which mobile build can testers use?",
        answer:
          "YO Voice 2.0.0 (26) is available to our existing Google Play Internal Testing list and TestFlight internal group. Build 27 is being prepared for the same testers and is not yet confirmed as available. Neither is a public App Store or Google Play release. The web app remains available in modern browsers; desktop installers are not published yet.",
      },
      {
        question: "Do I need to verify my email?",
        answer:
          "Yes. Verifying your email unlocks protected actions such as posting and messaging. It is a short link sent after registration.",
      },
    ],
  },
  {
    title: "Servers",
    items: [
      {
        question: "What are the five Server types?",
        answer:
          "Friends begins with close-group voice and text; Community is shaped for shared interests and events; Podcast brings hosts, guests and audience questions together; Family focuses on private plans and memories; Company points toward team channels, meetings and collaboration tools.",
      },
      {
        question: "Can testers create and use a Server yet?",
        answer:
          "The Build 26 tester app includes the real five-type selector and server-first workspace interface. Server creation, membership and channel activity still depend on backend activation, which remains gated, so the website does not present those actions as available.",
      },
      {
        question: "Can a Podcast Server record an episode?",
        answer:
          "No. Podcast recording is disabled in the current tester build and is planned as a separate release. Hosts, guests, audience questions and episode planning describe the interface direction; no Podcast recording or published-episode promise is active at this release boundary.",
      },
      {
        question: "Will I need Premium to create a Server?",
        answer:
          "After activation, a Free account can own up to 5 Servers and a Premium account up to 30. Joining other Servers is unlimited for both. One Family Server per owner counts toward the same ownership limit. These allowances are not active until the backend gate is cleared.",
      },
      {
        question: "What happened to Rooms and Clubs from older versions?",
        answer:
          "The current app interface uses Servers, and the old marketing /clubs address redirects to /servers. Servers are built over the existing data so identities, memberships, moderation and media history stay compatible; no production data migration is implied by the website redesign.",
      },
    ],
  },
  {
    title: "Chats, Friends and Yeels",
    items: [
      {
        question: "How do I add someone from Chats?",
        answer:
          "Choose Add Friend at the top of Chats. It opens the redesigned Friends area, where adding a new person is kept separate from searching the friends you already have.",
      },
      {
        question: "Can I open a private photo or video full screen?",
        answer:
          "Yes, in the current tester build. Received private photos and videos open in a responsive full-screen viewer with visible loading, retry and close states. Transfer speed still depends on the media size, device and network.",
      },
      {
        question: "Who can have followers?",
        answer:
          "Following is a Creator feature. Public audience visibility appears only for a Premium Creator profile after age verification and explicit opt-in. Eligibility is derived on the server; an ordinary account does not gain a public follower surface from a browser setting alone.",
      },
      {
        question: "What are Yeels?",
        answer:
          "Yeels are media-first posts inside YO Moments. You can use your own photo or short video, place text and link overlays before publishing, and add audio you own or are licensed to use. Voice and Yeels share one visual language while keeping their own creation needs.",
      },
      {
        question: "Can I use GIFs yet?",
        answer:
          "Not yet. The Build 27 candidate bundles 16 original YO Voice GIF animations, but GIF search and sending need a backend rollout that has not happened yet, so GIFs are not presented as available.",
      },
      {
        question: "Are private voice and video calls guaranteed to be smooth?",
        answer:
          "Tester builds include call setup, teardown and retry corrections that are still being checked on real devices. Call quality depends on the devices, permissions and network on both sides, so the website does not promise flawless or zero-latency calling.",
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
          "Use the report or block controls available in the relevant profile or content view, and email safety@yovoice.app if you need further help.",
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
        description="Build 26 is available on our existing internal testing channels. These answers separate what the interface shows from what the gated backend currently enables."
      />
      <section className="px-5 pb-28 sm:px-8">
        <FaqAccordion groups={groups} />
      </section>
    </>
  );
}
