/**
 * Present-tense release boundary for website copy.
 *
 * Source of truth is the YO Voice app repository as committed:
 * docs/DEPLOYMENT.md, docs/Roadmap.md and docs/Sessions. A build may be called
 * available only when those records carry its store read-back. Keep this
 * separate from the historical update ledger, whose entries record what was
 * true at the time.
 */
export const currentRelease = {
  version: "2.0.0 (26)",
  buildNumber: 26,
  sourceRevision: "d1c036b75fea16e8962e7af932166cf95aa8f0ab",
  stage: "Internal testing",
  mobileChannelsConfirmed: true,
  publicStoreRelease: false,
  serversInterfaceIncluded: true,
  serversBackendActive: false,
  podcastRecordingActive: false,
} as const;

export const currentReleaseAvailability =
  "Available to our existing internal testers through Google Play Internal Testing and TestFlight.";

/**
 * The next build is recorded only as an internal tester candidate: no final
 * source revision, signed artifacts or store read-backs exist yet, so the
 * website never describes it as available.
 */
export const nextReleaseCandidate = {
  version: "2.0.0 (27)",
  buildNumber: 27,
  stage: "Candidate",
  availabilityConfirmed: false,
  publicStoreRelease: false,
  gifOriginalsBundled: 16,
  gifBackendActive: false,
} as const;

export const nextReleaseCandidateStatus =
  "Build 27 is being prepared for the same internal testers and is not yet confirmed as available.";
