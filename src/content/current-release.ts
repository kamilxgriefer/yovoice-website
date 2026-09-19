/**
 * Present-tense release boundary for website copy.
 *
 * Source of truth is the YO Voice app repository as committed
 * (docs/DEPLOYMENT.md, docs/Roadmap.md and docs/Sessions) together with the
 * release evidence read back from the stores and from Hosting. A build may be
 * called available only when those records carry its store read-back. Keep
 * this separate from the historical update ledger, whose entries record what
 * was true at the time.
 *
 * Build 33 read-backs (2026-09-19): Google Play internal testing published at
 * 12:21 CEST, TestFlight build 33 VALID and in beta testing in both groups,
 * and app.yovoice.app serving version.json build_number 33 — all from app
 * commit 46d6b330.
 */
export const currentRelease = {
  version: "2.0.0 (33)",
  buildNumber: 33,
  sourceRevision: "46d6b330dabdee6c672faeabb8e9f27dd06df039",
  stage: "Internal testing",
  mobileChannelsConfirmed: true,
  publicStoreRelease: false,
  serversInterfaceIncluded: true,
  serversBackendActive: true,
  podcastRecordingActive: false,
} as const;

export const currentReleaseAvailability =
  "Available to our existing testers through Google Play Internal Testing and both TestFlight groups, and running as the web app at app.yovoice.app.";

/**
 * The next step is recorded only as work in progress: it has no version
 * number, no date, no source revision, no signed artifacts and no store
 * read-back, so the website never describes it as available and never
 * announces a version for it.
 */
export const nextReleaseCandidate = {
  stage: "In progress",
  availabilityConfirmed: false,
  publicStoreRelease: false,
  scope: ["a redesigned YO Voice"],
} as const;

export const nextReleaseCandidateStatus =
  "A redesigned YO Voice is in progress, with no date yet. It is not available to testers.";
