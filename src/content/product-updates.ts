export type ProductUpdateStatus = "live" | "ready" | "verification";

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
// `ready` means the source and its release gates are complete but rollout is
// still pending. `verification` means the implementation is intentionally not
// represented as shipped yet.
export const productUpdates: readonly ProductUpdate[] = [
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
