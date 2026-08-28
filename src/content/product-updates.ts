export type ProductUpdateStatus =
  | "live"
  | "testing"
  | "ready"
  | "verification";

export type ProductUpdate = {
  slug: string;
  updatedOn: string;
  status: ProductUpdateStatus;
  eyebrow: string;
  title: string;
  summary: string;
  highlights: readonly string[];
};

// This is a release-truth ledger, not aspirational marketing copy. Only mark
// an item `live` after the production artifact has been independently checked.
// `testing` means the update is available on the channels named in its copy,
// while final store/device acceptance is still in progress.
// `ready` means the source and its release gates are complete but rollout is
// still pending. `verification` means the implementation is intentionally not
// represented as shipped yet.
export const productUpdates: readonly ProductUpdate[] = [
  {
    slug: "ios-build-7-processing",
    updatedOn: "2026-08-28",
    status: "verification",
    eyebrow: "iOS",
    title: "iOS build 7 has reached App Store Connect",
    summary:
      "YO Voice 1.0.0 build 7, built from source commit 9a92072, was accepted by App Store Connect on August 28 at 13:34 CEST and is processing. It is not yet confirmed as available to testers.",
    highlights: [
      "App Store Connect accepted iOS build 7 (1.0.0)",
      "Source commit: 9a92072",
      "Tester-group availability has not yet been confirmed",
    ],
  },
  {
    slug: "premium-plan-chooser",
    updatedOn: "2026-08-28",
    status: "verification",
    eyebrow: "Premium",
    title: "Premium checkout has passed sandbox verification",
    summary:
      "Stripe's sandbox now has the YO Voice Premium product and all four intended prices. Card, PayPal and BLIK Checkout paths were verified without completing a payment; live checkout remains disabled while seller activation and production configuration are completed.",
    highlights: [
      "Recurring: €6 monthly or €60 yearly, payable by card or PayPal",
      "Prepaid BLIK: PLN 26 for 30 days or PLN 260 for 365 days, with no renewal",
      "Sandbox paths are verified without a payment; live checkout remains disabled",
    ],
  },
  {
    slug: "social-sign-in-recovery",
    updatedOn: "2026-08-28",
    status: "testing",
    eyebrow: "Account access",
    title: "Google and Apple sign-in recovery has reached testing",
    summary:
      "Login and Registration now share the same provider flows, while delayed profile setup retries without throwing away a valid sign-in.",
    highlights: [
      "Google and Apple are available from both Login and Registration",
      "A delayed profile shows clear Retry or Sign out actions",
      "Live on web; Android build 7 is internal; iOS build 7 is processing",
    ],
  },
  {
    slug: "android-adaptive-icon",
    updatedOn: "2026-08-28",
    status: "testing",
    eyebrow: "Android",
    title: "The Android launcher icon has more breathing room",
    summary:
      "Build 7 remains active and available on Google Play Internal Testing and keeps the complete YO mark inside Android's adaptive safe area. No newer mobile client code has landed since this build.",
    highlights: [
      "Safer spacing for circle, squircle and rounded-square launcher masks",
      "Join through the existing opt-in using the correct Google Account",
      "Update and fresh-install device checks remain in tester acceptance",
    ],
  },
  {
    slug: "direct-friend-calls",
    updatedOn: "2026-08-27",
    status: "testing",
    eyebrow: "Calls",
    title: "Private friend-to-friend voice calls have reached testing",
    summary:
      "The phone action in a direct message now opens a private ringing flow with the controls expected from a one-to-one call.",
    highlights: [
      "Answer, decline, cancel and end states with private short-lived voice access",
      "Fast local mute and a useful missed-call notification after timeout",
      "Web and backend are live; Android is internal; iOS is processing",
    ],
  },
  {
    slug: "community-room-presence",
    updatedOn: "2026-08-27",
    status: "testing",
    eyebrow: "Community Rooms",
    title: "Community Rooms now feel like open voice channels",
    summary:
      "The web and tester builds replace the stage-and-listener split with one live presence model and let each room creator choose its lifecycle.",
    highlights: [
      "One In room count and one People here grid, without a listener lane",
      "Choose Stay open or End with host while creating the room",
      "Mute acts locally first, and room chat is more compact and readable",
    ],
  },
  {
    slug: "voice-moment-review",
    updatedOn: "2026-08-27",
    status: "live",
    eyebrow: "Voice Moments",
    title: "Review your Voice Moment and choose how long it stays",
    summary:
      "The production web flow now lets you listen before upload and choose a flexible availability window instead of relying on fixed presets.",
    highlights: [
      "Play, pause and seek locally before anything is published",
      "Choose 24 hours to 30 days, or Until deleted",
      "Expiry, engagement and cleanup follow the selected deadline",
    ],
  },
  {
    slug: "everyday-app-polish",
    updatedOn: "2026-08-27",
    status: "live",
    eyebrow: "Everyday polish",
    title: "Chats and common actions respond immediately on web",
    summary:
      "A production web polish pass removes waits, dead taps and distorted imagery across several of the app's most-used flows.",
    highlights: [
      "Outgoing messages appear immediately with Pending, Retry and Remove states",
      "Avatar crop, Profile Message and Recent Chats preserve the intended identity",
      "More fits phone screens, ignores double taps and startup crossfades cleanly",
    ],
  },
  {
    slug: "branded-email-action-handoff",
    updatedOn: "2026-08-27",
    status: "verification",
    eyebrow: "Account access",
    title: "The branded password-reset handoff is still being verified",
    summary:
      "YO Voice action pages are live, but production email links still enter through the provider's generic page before the branded flow.",
    highlights: [
      "Branded reset, verification and account-recovery pages are deployed",
      "Expired, reused and unsafe links fail on a styled protected page",
      "Moving the email callback directly to YO Voice remains the release boundary",
    ],
  },
  {
    slug: "velvet-prism-sound",
    updatedOn: "2026-08-27",
    status: "testing",
    eyebrow: "Sound",
    title: "Velvet Prism replaces the retro-style app sounds",
    summary:
      "Eight short, non-musical material cues replace the previous synth-like pack and prevent duplicate foreground notification playback.",
    highlights: [
      "One restrained cue family across the app's everyday events",
      "Incoming calls remain distinct from ordinary notifications",
      "Web and Android internal delivery are complete; listening checks continue",
    ],
  },
  {
    slug: "shared-room-experience",
    updatedOn: "2026-08-17",
    status: "live",
    eyebrow: "Rooms",
    title: "A clearer stage is live for every kind of conversation",
    summary:
      "Community, Podcast, Club and Family rooms now share one compact structure while preserving each room’s visual identity.",
    highlights: [
      "Purple Community, coral Podcast, gold Club and emerald Family identities",
      "Responsive stage, listener strip and controls from phone to desktop",
      "Release-test coverage for room creation reliability and permissions",
    ],
  },
  {
    slug: "private-chat-media",
    updatedOn: "2026-08-17",
    status: "live",
    eyebrow: "Messages",
    title: "Private chat media is live",
    summary:
      "The old placeholder actions have been replaced with participant-only photo and voice-message flows.",
    highlights: [
      "Private Storage paths instead of public download links",
      "Safe retry after interrupted uploads or finalization",
      "Real playback controls with narrow-screen layout and media-state coverage",
    ],
  },
  {
    slug: "family-room-reliability",
    updatedOn: "2026-08-17",
    status: "live",
    eyebrow: "Family Rooms",
    title: "Safer Family Room creation is live",
    summary:
      "Family Room creation now commits the complete Family graph atomically, recovers one canonical room after concurrent attempts, and keeps private artwork disabled until its media boundary is safe.",
    highlights: [
      "Family chat, announcements, Lounge and organizer membership created together",
      "No duplicate room after concurrent creation or a lost response",
      "Private Family artwork is not exposed through public Storage URLs",
    ],
  },
  {
    slug: "truthful-public-showcase",
    updatedOn: "2026-08-17",
    status: "verification",
    eyebrow: "Website",
    title: "A consent-based public showcase is being verified",
    summary:
      "A public showcase that can rotate opted-in members, Creators and public Clubs without exposing account identifiers or pretending someone is online is now being verified.",
    highlights: [
      "Explicit profile, recent-activity and Club consent controls",
      "Honest “Active recently” label with a short independent expiry",
      "Neutral invitation shown whenever verified public data is unavailable",
    ],
  },
];
