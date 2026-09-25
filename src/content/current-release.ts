/**
 * Present-tense release boundary for website copy.
 *
 * Source of truth is the YO Voice app repository as committed (docs/Roadmap.md
 * and docs/Sessions) together with the release evidence read back from the
 * stores and from Hosting. A build may be called available only when those
 * records carry its store read-back. Keep this separate from the historical
 * update ledger, whose entries record what was true at the time.
 *
 * YO Voice 3.0.0 (34), the Slim redesign, released to testers on 2026-09-19.
 * Every store and web build was made from f71a2ae2, the docs-only commit
 * directly on top of release commit 176ec120 (version 3.0.0+34). Read-backs,
 * all in yovoice-evidence/2026-09-19/release-3.0.0/:
 * - play.md: Google Play internal testing published release "34 (3.0.0)" on
 *   19 September 2026 at 20:52 CEST; bundle 33 was not included.
 * - ios.md: TestFlight build 34 VALID and IN_BETA_TESTING in the internal
 *   group. The external group was WAITING_FOR_BETA_REVIEW at the last
 *   read-back (18:58Z) and no later approval is recorded, so the site says
 *   "TestFlight" and never "both TestFlight groups" for this build.
 * - web.md and web-readback.txt: app.yovoice.app has served version.json
 *   3.0.0 / build_number 34 since 18:14Z; a live check on 2026-09-25
 *   (yovoice-evidence/2026-09-25/website-fix/part1-versionjson-readback.txt)
 *   still returned 3.0.0 / 34.
 *
 * Nothing later is announced here: no next build, no version and no date
 * until the app records carry its store read-backs.
 */
export const currentRelease = {
  version: "3.0.0 (34)",
  buildNumber: 34,
  sourceRevision: "f71a2ae21ca353cc70b099edd5d4c1323bc87343",
  stage: "Internal testing",
  mobileChannelsConfirmed: true,
  publicStoreRelease: false,
  serversInterfaceIncluded: true,
  serversBackendActive: true,
  podcastRecordingActive: false,
} as const;

export const currentReleaseAvailability =
  "Available to our existing testers through Google Play Internal Testing and TestFlight, and running as the web app at app.yovoice.app.";
