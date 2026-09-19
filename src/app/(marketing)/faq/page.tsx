import { FaqAccordion, type FaqGroup } from "@/components/marketing/faq-accordion";
import { PageHero } from "@/components/marketing/page-hero";
import {
  currentRelease,
  currentReleaseAvailability,
  nextReleaseCandidateStatus,
} from "@/content/current-release";
import { SELF_SERVICE_DELETION_LIVE } from "@/content/account-deletion";
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
          "Yes. Creating an account, using the web app, adding friends, starting private Chats and using Servers are free. A Free account can own up to 5 Servers, a Premium account up to 30, and everyone can join without a limit.",
      },
      {
        question: "Which mobile build can testers use?",
        answer:
          `YO Voice ${currentRelease.version} is the current tester build. ${currentReleaseAvailability} ${nextReleaseCandidateStatus} None of this is a public App Store or Google Play release, and desktop installers are not published yet.`,
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
          "Yes. Servers have been open to every signed-in account since 16 September 2026. In the current tester build and the web app you can create a Server, join one, send invites and use its voice and text channels. Podcast recording remains disabled.",
      },
      {
        question: "Can a Podcast Server record an episode?",
        answer:
          "No. Podcast recording is disabled in the current tester build and is planned as a separate release. Hosts, guests, audience questions and episode planning describe the interface direction; no Podcast recording or published-episode promise is active at this release boundary.",
      },
      {
        question: "Will I need Premium to create a Server?",
        answer:
          "No. A Free account can own up to 5 Servers and a Premium account up to 30. Joining other Servers is unlimited for both. One Family Server per owner counts toward the same ownership limit, and the server enforces these allowances.",
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
          "Yes, since Build 30. The composer offers 16 original YO Voice GIF animations that you can send in private Chats. They are a first-party catalogue; no third-party GIF provider is connected.",
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
        answer: SELF_SERVICE_DELETION_LIVE
          ? "Yes, yourself. In the app open Settings, then Account, then Delete account; on this website sign in and open yovoice.app/account/delete. Both confirm your password first, and deletion is permanent. An account created with Google or Apple sign-in is deleted from the app or by writing to privacy@yovoice.app. yovoice.app/delete-account lists what is removed, the short list we keep and the reason for each entry."
          : "Yes, by email — there is no self-service account deletion in the app yet. Email support@yovoice.app with the subject \"Delete my YO Voice account\" (the Delete account row in Settings opens that email for you), or write to privacy@yovoice.app. We may need to verify your identity. Deletion automatically removes your public profile, presence, public badges, member-directory entry and website-showcase consent; your private account record is kept and marked as deleted, and your messages, uploaded media and other content are removed by hand on your request. yovoice.app/delete-account and the Privacy Policy set out exactly what is deleted and what is retained.",
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
        description={`${currentRelease.version} is available on our existing internal testing channels and as the web app. These answers separate what is live today from what is still switched off.`}
      />
      <section className="px-5 pb-28 sm:px-8">
        <FaqAccordion groups={groups} />
      </section>
    </>
  );
}
