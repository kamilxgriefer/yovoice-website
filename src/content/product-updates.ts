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
  release?: {
    version: string;
    stage: string;
    buildNumber: number;
  };
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
    slug: "mobile-build-20-invited-testing",
    updatedOn: "2026-09-05",
    status: "testing",
    eyebrow: "Build 20 · Invited testing",
    title: "Build 20 brings YO Moments together",
    summary:
      "YO Voice 1.0.0 (20) is available through Google Play Internal Testing for the existing 15-person tester list and TestFlight for the six-person external group plus the internal tester. Five external TestFlight installations are confirmed, and the matching web release is live. This remains invited testing, not a public App Store or Google Play release.",
    highlights: [
      "YO Moments brings voice updates and the photo/video Reels MVP into one feed, with audience choices, reporting and owned or licensed audio uploads",
      "Frame Echo Clean replaces the Moments navigation mark with a simple frame and play symbol, alongside original Velvet Prism sound cues and updated translations",
      "Chat, avatar, friendship and media recovery improvements are included; real-device media and mixed-version audio/video call acceptance continues",
    ],
    release: {
      version: "1.0.0 (20)",
      stage: "Invited testing",
      buildNumber: 20,
    },
  },
  {
    slug: "yo-moments-unified-feed",
    updatedOn: "2026-09-05",
    status: "testing",
    eyebrow: "YO Moments",
    title: "One place for voice, photos and short videos",
    summary:
      "The Build 20 experience brings Voice Moments and Reels into a unified YO Moments feed. Share a voice update or create with your own photo, video, text, links and audio, then choose the audience. This is a focused Reels MVP, not a licensed streaming-music catalog or a promise of Instagram feature parity.",
    highlights: [
      "Clear loading, empty, error and playback-recovery states keep creation and browsing understandable",
      "Music must be owned or licensed by the uploader; Spotify and Apple Music tracks are not extracted into uploads",
      "Server-validated publishing, reporting and short-lived media access retain the privacy boundary",
    ],
  },
  {
    slug: "frame-echo-and-velvet-prism",
    updatedOn: "2026-09-05",
    status: "testing",
    eyebrow: "Navigation & sound",
    title: "A cleaner Moments mark, a quieter sound identity",
    summary:
      "Build 20 pairs Frame Echo Clean with YO Voice's original Velvet Prism cues. The navigation mark uses a rounded frame and play symbol, without internal bars or tilt. Short material-like sounds clarify meaningful room, microphone and notification events without turning every tap into an effect.",
    highlights: [
      "The Frame Echo Clean shape stays consistent in Dark and Pearl navigation",
      "Sound effects are optional, with bounded playback and protection against overlapping foreground cues",
      "Device volume, notification settings and Do Not Disturb remain authoritative; speech and user recordings are not sound effects",
    ],
  },
  {
    slug: "mobile-build-19-release-candidate",
    updatedOn: "2026-09-03",
    status: "testing",
    eyebrow: "Build 19 · Invited testing",
    title: "Build 19 is available to invited testers",
    summary:
      "YO Voice 1.0.0 (19) is available on both private mobile testing channels: Google Play Internal Testing for 15 Android testers, and TestFlight for 7 external plus 1 internal tester. The internal TestFlight installation is confirmed. This is a tester release, not a public App Store or Google Play release.",
    highlights: [
      "Chats and identity: organised photo, video and voice-note views, camera or library capture, reliable avatar refresh and bounded media recovery",
      "Live connection: mixed-version-safe private audio and video call negotiation plus repair work for publishing and playing Voice Moments",
      "Creation and trust: a Reels MVP for user-supplied photo, video, text, links and licensed or owned audio, with short-lived media access and fail-safe compatibility",
    ],
    release: {
      version: "1.0.0 (19)",
      stage: "Invited testing",
      buildNumber: 19,
    },
  },
  {
    slug: "mobile-build-18",
    updatedOn: "2026-09-02",
    status: "testing",
    eyebrow: "Mobile",
    title: "Build 18 is available to invited testers",
    summary:
      "YO Voice 1.0.0 build 18 is now available through both private mobile testing channels. Android is active in Google Play Internal Testing for the permanent 14-person tester list. On Apple, the build is Testing in the one-person internal group and the six-person YO Voice Beta Testers external group, with automatic TestFlight notifications enabled.",
    highlights: [
      "A complete Dark and Pearl pass across primary journeys and shared controls",
      "The sculpted navigation dock, compact live-room capsule and safer room-session transitions",
      "Android and Apple tester assignments are confirmed while public store release remains a separate milestone",
    ],
  },
  {
    slug: "room-consent-and-docked-chat",
    updatedOn: "2026-09-01",
    status: "testing",
    eyebrow: "Rooms",
    title: "Room entry now waits for an explicit choice",
    summary:
      "The Build 19 tester release opens Community and Podcast Rooms as passive previews. Audio, roster presence and credentials begin only after Join conversation, while invited tester acceptance continues across real devices.",
    highlights: [
      "The prejoin view explains the room and enters with the microphone off by default",
      "Compact room chat is visible after joining and can be folded away without losing the conversation",
      "Local mute and join paths are being checked across compact, enlarged-text and desktop layouts",
    ],
  },
  {
    slug: "friends-identity-and-chat-recovery",
    updatedOn: "2026-09-01",
    status: "testing",
    eyebrow: "Friends & Chats",
    title: "Friendship, avatars and message recovery move as one system",
    summary:
      "The Build 19 tester release makes friend requests optimistic and idempotent, invalidates stale avatar access after profile revisions, and gives private messages immediate local feedback with bounded retry or removal. End-to-end latency still depends on each device and network.",
    highlights: [
      "Search, suggestions, Home and Chats use current profile imagery instead of falling back to stale initials",
      "The full-screen profile-photo viewer preserves clear loading, retry and close states",
      "Terminal message failures explain the next action without exposing backend error details",
    ],
  },
  {
    slug: "account-readiness-and-language-choice",
    updatedOn: "2026-09-01",
    status: "testing",
    eyebrow: "Account readiness",
    title: "Verification, permissions and language choice are easier to find",
    summary:
      "The Build 19 tester release keeps an unverified-email reminder above authenticated content, offers one guided permission review and expands the core locale catalog. Specialist screens may still use English fallback while translated coverage grows.",
    highlights: [
      "The email reminder stays visible until verification and opens the correct verification flow",
      "Microphone, camera and notification status are reviewed together while each native prompt remains an operating-system decision",
      "Polish is a production language alongside a broader catalog including major European locales",
    ],
  },
  {
    slug: "private-media-access-hardening",
    updatedOn: "2026-09-01",
    status: "live",
    eyebrow: "Security",
    title: "Private media access is short-lived and account-bound",
    summary:
      "The production private-media boundary authorises each request before issuing a V4 access capability with a 90-second ceiling. Upload reservations are account-bound, legacy chat objects are migrated and token-free, and strict Storage rules are live.",
    highlights: [
      "Access is checked before a short-lived media capability is minted",
      "Upload reservations bind the owner, object path, media contract, quota and finalisation lease",
      "Legacy token revocation, migration scans and bucket IAM are verified in production",
    ],
  },
  {
    slug: "privileged-authentication-gates",
    updatedOn: "2026-09-01",
    status: "verification",
    eyebrow: "Security",
    title: "Sensitive staff actions have a stronger authentication gate",
    summary:
      "A shared backend guard now checks verified identity and recent authentication for privileged operations, with MFA enforcement ready to activate after staff enrollment. App Check enforcement also remains deliberately gated until real attestation telemetry is healthy.",
    highlights: [
      "Privileged operations fail closed when identity or authentication freshness is insufficient",
      "MFA can be required centrally without trusting a role badge or client-side state",
      "Staff enrollment, App Check telemetry and production configuration remain explicit release gates",
    ],
  },
  {
    slug: "direct-video-release-verification",
    updatedOn: "2026-09-01",
    status: "testing",
    eyebrow: "Calls",
    title: "Private video calls are available to invited testers",
    summary:
      "The Build 19 tester release carries server-validated audio or video intent, bounded token minting and mixed-version protection. Device-to-device acceptance continues, and public App Store and Google Play release remains a separate milestone.",
    highlights: [
      "Camera and microphone lifecycle cleanup blocks late permission or connection work after hang-up",
      "Recipient capability checks prevent a new video request from silently degrading on an older client",
      "Media is encrypted in transit through LiveKit; YO Voice does not claim FaceTime-style application E2EE",
    ],
  },
  {
    slug: "website-product-sync",
    updatedOn: "2026-08-31",
    status: "live",
    eyebrow: "Website",
    title: "The website now speaks the same visual language as the app",
    summary:
      "The marketing experience has been rebuilt around the current YO Voice product instead of older room models, invented activity and outdated release copy, and is now verified in production.",
    highlights: [
      "Exact Dark and Pearl semantic colours, Inter typography and the sculpted YO dock appear in the product preview",
      "Community Room, mobile tester access and the release ledger now match the real product state",
      "Stronger contrast, skip navigation, compact Updates history and responsive menu behaviour improve accessibility",
    ],
  },
  {
    slug: "podcast-studio-rebuild",
    updatedOn: "2026-08-31",
    status: "testing",
    eyebrow: "Podcast Rooms",
    title: "Podcast Studio gives hosts a calmer place to run a show",
    summary:
      "Podcast Rooms now emphasise the episode identity, current speakers, request queue and host decisions without turning the live conversation into a dashboard.",
    highlights: [
      "A clearer host-and-guest lineup keeps the active conversation readable",
      "Raised-hand requests and moderator actions stay structured without fake audience metrics",
      "Compact chat, cover artwork and responsive controls preserve the show identity across screen sizes",
    ],
  },
  {
    slug: "dark-pearl-visual-system",
    updatedOn: "2026-08-31",
    status: "testing",
    eyebrow: "Design system",
    title: "Dark and Pearl now share one premium visual language",
    summary:
      "Primary journeys adapt cleanly between YO Voice's cosmic Dark theme and warm Pearl theme, with clearer hierarchy, stronger contrast and consistent interaction states.",
    highlights: [
      "Home, Chats, Profile, Moments, Settings, Notifications and Premium follow the active theme",
      "Controls, focus rings, badges and status messages remain readable in both appearances",
      "Narrow screens and enlarged text reflow instead of clipping or overlapping",
    ],
  },
  {
    slug: "sculpted-navigation-live-room",
    updatedOn: "2026-08-31",
    status: "testing",
    eyebrow: "Navigation",
    title: "The YO dock now flows naturally into your live room",
    summary:
      "The mobile dock uses one continuous sculpted rise around the transparent YO mark, while a minimized room becomes a compact live capsule instead of an oversized control panel.",
    highlights: [
      "Clear icon-first navigation with responsive active states, keyboard focus and reduced motion",
      "Mic, Chat, More and Return remain available without covering the current screen",
      "Late actions from a previous room cannot unmute, navigate or disconnect a newer session",
    ],
  },
  {
    slug: "guided-quick-app-tour",
    updatedOn: "2026-08-31",
    status: "testing",
    eyebrow: "Getting started",
    title: "A skippable Quick app tour welcomes new members",
    summary:
      "New members can learn YO Voice directly inside the real application shell, without adding another required account-creation step.",
    highlights: [
      "Five focused steps introduce YO creation, Moments, Chats and More",
      "Skip, Back, Next and Done keep the walkthrough fully optional",
      "Completion is stored per account and the tour can be replayed from Settings",
    ],
  },
  {
    slug: "responsive-authentication-stage",
    updatedOn: "2026-08-31",
    status: "testing",
    eyebrow: "Account access",
    title: "Login and Registration now share one responsive stage",
    summary:
      "Authentication has been rebuilt around a consistent Voice Relay transition on compact screens and a matching two-panel curtain on wider layouts.",
    highlights: [
      "Form state, validation, keyboard and focus survive responsive layout changes",
      "Signing out clears private session state and returns directly to account access",
      "New password accounts wait for the chosen pseudonym instead of guessing identity from an email address",
    ],
  },
  {
    slug: "profile-chat-identity-refresh",
    updatedOn: "2026-08-31",
    status: "testing",
    eyebrow: "Profile",
    title: "Profile identity stays compact and current everywhere",
    summary:
      "Names, avatars, roles and product identity now use a clearer profile hierarchy and converge across Profile, Home and Chats.",
    highlights: [
      "Role, VIP, Creator, Premium and achievement labels fit into a compact two-level passport",
      "Avatar changes propagate across chat headers, conversation lists and Home with an offline fallback",
      "Vibe opens safe links from YouTube, Spotify, Apple Music and other recognised music services",
    ],
  },
  {
    slug: "room-cover-studio",
    updatedOn: "2026-08-31",
    status: "testing",
    eyebrow: "Rooms",
    title: "Room covers can finally be framed your way",
    summary:
      "Community and Podcast hosts can choose, crop, zoom and reposition artwork before it becomes the room's final landscape cover.",
    highlights: [
      "The editor preview matches the banner shape used inside the room",
      "Replace, reset and remove controls keep the image workflow reversible",
      "Browser-safe processing restores cover selection and export on web while preserving native support",
    ],
  },
  {
    slug: "moments-circle-focus",
    updatedOn: "2026-08-31",
    status: "testing",
    eyebrow: "Home",
    title: "Moments from your circle stays focused on voices",
    summary:
      "The Home rail now keeps the compact avatar-led format intended for your own Moment and followed accounts with an active Voice Moment.",
    highlights: [
      "No oversized empty-state panel is mixed into the Moments avatar rail",
      "Followed voices appear only when they have an available Voice Moment",
      "Discover categories keep distinctive, readable accents in both Dark and Pearl",
    ],
  },
  {
    slug: "totp-voice-constellation",
    updatedOn: "2026-08-31",
    status: "verification",
    eyebrow: "Security",
    title: "A clearer two-factor challenge is in verification",
    summary:
      "The six-digit TOTP challenge uses a branded Voice Constellation interaction while Firebase remains the sole verification authority. Rollout still depends on provider activation.",
    highlights: [
      "An incorrect code shows a red X, clears all six digits and refocuses the input",
      "Network and rate-limit errors preserve the code for one deliberate retry",
      "Autofill, keyboard, screen-reader and reduced-motion states are included",
    ],
  },
  {
    slug: "direct-chat-reliability-build-11",
    updatedOn: "2026-08-28",
    status: "testing",
    eyebrow: "Chats",
    title: "Build 11 makes private conversations fast and dependable",
    summary:
      "YO Voice 1.0.0 build 11, built from source commit a67036b, is available to both permanent TestFlight groups and Google Play Internal Testing with a hardened message, media, notification and direct-call path.",
    highlights: [
      "Text appears immediately and resumes safely after a lost response or brief network outage",
      "Private photo and voice-message uploads survive restart and retry without duplicate messages",
      "Foreground alerts and one-to-one calls are deduplicated across active chat, background and cold start",
    ],
  },
  {
    slug: "mobile-build-8-testing",
    updatedOn: "2026-08-28",
    status: "testing",
    eyebrow: "Mobile",
    title: "Build 8 is available to Android and iOS testers",
    summary:
      "YO Voice 1.0.0 build 8, built from source commit 5f61c71, is available on Google Play Internal Testing and TestFlight. It replaces the iOS builds that stopped at export-compliance verification.",
    highlights: [
      "Android build 8 is published to the persistent internal-testing list",
      "iOS build 8 passed export compliance and is attached to persistent tester groups",
      "Source commit: 5f61c71; existing testers update through Google Play or TestFlight",
    ],
  },
  {
    slug: "moderator-premium-preview",
    updatedOn: "2026-08-28",
    status: "testing",
    eyebrow: "Premium",
    title: "Moderators can test the complete Premium experience",
    summary:
      "Active moderators and super moderators now receive a revocable Premium product preview for Creator and Clubs without creating a subscription or changing billing records.",
    highlights: [
      "Premium identity, Creator and the three-Club limit are available to both moderator tiers",
      "Claim and server-role checks fail closed during promotion or demotion",
      "No plan, renewal, payment provider or paid entitlement is fabricated",
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
      "Live on web and included in Android and iOS build 8 testing",
    ],
  },
  {
    slug: "android-adaptive-icon",
    updatedOn: "2026-08-28",
    status: "testing",
    eyebrow: "Android",
    title: "The Android launcher icon has more breathing room",
    summary:
      "Build 8 is active on Google Play Internal Testing and keeps the complete YO mark inside Android's adaptive safe area.",
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
      "Web and backend are live; Android and iOS build 8 are in tester distribution",
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
      "Web plus Android and iOS build 8 delivery are complete; listening checks continue",
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
