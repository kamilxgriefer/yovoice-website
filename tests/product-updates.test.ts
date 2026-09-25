import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  currentRelease,
  currentReleaseAvailability,
} from "../src/content/current-release.ts";
import { productUpdates } from "../src/content/product-updates.ts";

describe("product update ledger", () => {
  test("uses unique stable slugs", () => {
    const slugs = productUpdates.map((update) => update.slug);

    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) {
      assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  test("keeps valid ISO dates in newest-first order", () => {
    const dates = productUpdates.map((update) => update.updatedOn);

    for (const date of dates) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10),
        date,
      );
    }

    assert.deepEqual(dates, [...dates].sort().reverse());
  });

  test("keeps every release card concise and complete", () => {
    for (const update of productUpdates) {
      assert.equal(update.highlights.length, 3, update.slug);
      assert.ok(update.title.trim(), update.slug);
      assert.ok(update.summary.trim(), update.slug);
      assert.ok(update.eyebrow.trim(), update.slug);
      assert.ok(update.highlights.every((highlight) => highlight.trim()), update.slug);
    }
  });

  test("tracks the September security wave at its verified release boundary", () => {
    const media = productUpdates.find(
      (update) => update.slug === "private-media-access-hardening",
    );
    const privilegedAuth = productUpdates.find(
      (update) => update.slug === "privileged-authentication-gates",
    );
    const video = productUpdates.find(
      (update) => update.slug === "direct-video-release-verification",
    );

    assert.ok(media);
    assert.equal(media.updatedOn, "2026-09-01");
    assert.equal(media.status, "live");
    assert.match(media.summary, /90-second ceiling/i);
    assert.match(media.summary, /strict Storage rules are live/i);
    assert.match(media.highlights.join(" "), /IAM are verified in production/i);

    assert.ok(privilegedAuth);
    assert.equal(privilegedAuth.status, "verification");
    assert.match(privilegedAuth.summary, /after staff enrollment/i);
    assert.match(privilegedAuth.summary, /App Check enforcement/i);

    assert.ok(video);
    assert.equal(video.status, "testing");
    assert.match(video.summary, /Build 19 tester release/i);
    assert.match(video.summary, /Device-to-device acceptance continues/i);
    assert.match(video.summary, /public App Store and Google Play release remains a separate milestone/i);
    assert.match(video.highlights.join(" "), /does not claim FaceTime-style application E2EE/i);
  });

  test("keeps the social wave in testing and the retired Rooms entry as history", () => {
    const rooms = productUpdates.find(
      (update) => update.slug === "room-consent-and-docked-chat",
    );
    const social = productUpdates.find(
      (update) => update.slug === "friends-identity-and-chat-recovery",
    );
    const account = productUpdates.find(
      (update) => update.slug === "account-readiness-and-language-choice",
    );

    assert.ok(rooms);
    assert.ok(social);
    assert.ok(account);
    assert.equal(rooms.status, "superseded");
    assert.equal(social.status, "testing");
    assert.equal(account.status, "testing");
    assert.match(rooms.summary, /only after Join conversation/i);
    assert.match(rooms.summary, /invited tester acceptance continues/i);
    assert.match(social.summary, /latency still depends on each device and network/i);
    assert.match(account.summary, /specialist screens may still use English fallback/i);
    assert.doesNotMatch(
      [rooms, social, account].map((update) => update.summary).join(" "),
      /1\s*ms|FaceTime|end-to-end encrypted/i,
    );
  });

  test("keeps build 18 as superseded tester-channel history", () => {
    const mobile = productUpdates.find(
      (update) => update.slug === "mobile-build-18",
    );

    assert.ok(mobile);
    assert.equal(mobile.updatedOn, "2026-09-02");
    assert.equal(mobile.status, "superseded");
    assert.match(mobile.summary, /1\.0\.0 build 18/i);
    assert.match(mobile.summary, /Google Play Internal Testing/i);
    assert.match(mobile.summary, /permanent tester list/i);
    assert.match(mobile.summary, /TestFlight/i);
    assert.match(mobile.summary, /internal group/i);
    assert.match(mobile.summary, /YO Voice Beta Testers external group/i);
    assert.match(mobile.summary, /automatic TestFlight notifications enabled/i);
    assert.doesNotMatch(mobile.summary, /public store release/i);
  });

  test("keeps build 19 as superseded invited-tester history", () => {
    const candidate = productUpdates.find(
      (update) => update.slug === "mobile-build-19-release-candidate",
    );

    assert.ok(candidate);
    assert.equal(candidate.updatedOn, "2026-09-03");
    assert.equal(candidate.status, "superseded");
    assert.deepEqual(candidate.release, {
      version: "1.0.0 (19)",
      stage: "Invited testing",
      buildNumber: 19,
    });
    assert.match(candidate.summary, /Google Play Internal Testing/i);
    assert.match(candidate.summary, /our Android testers/i);
    assert.match(candidate.summary, /TestFlight for the external and internal tester groups/i);
    assert.match(candidate.summary, /internal TestFlight installation is confirmed/i);
    assert.match(candidate.summary, /not a public App Store or Google Play release/i);

    const scope = candidate.highlights.join(" ");
    for (const capability of [
      /Chats and identity/i,
      /photo, video and voice-note/i,
      /avatar refresh/i,
      /private audio and video/i,
      /Voice Moments/i,
      /first version of Yeels/i,
      /short-lived media access/i,
      /fail-safe compatibility/i,
    ]) {
      assert.match(scope, capability);
    }

    assert.doesNotMatch(
      JSON.stringify(candidate),
      /1\s*ms|end-to-end encrypted|available to everyone|publicly available/i,
    );
  });

  test("keeps Build 27 as superseded candidate history that was never called available", () => {
    const candidate = productUpdates.find(
      (update) => update.slug === "mobile-build-27-internal-tester-candidate",
    );

    assert.ok(candidate);
    assert.equal(
      productUpdates.some((update) => update.slug === "mobile-build-27-internal-testing"),
      false,
    );
    assert.equal(candidate.status, "superseded");
    assert.deepEqual(candidate.release, {
      version: "2.0.0 (27)",
      stage: "Candidate",
      buildNumber: 27,
    });
    assert.match(candidate.summary, /internal tester candidate/i);
    assert.match(candidate.summary, /store read-backs are not recorded yet/i);
    assert.match(candidate.summary, /not described as available/i);
    assert.match(candidate.summary, /not a public App Store or Google Play release/i);
    assert.match(candidate.highlights.join(" "), /Sixteen original YO Voice GIF animations/i);
    assert.match(candidate.highlights.join(" "), /backend rollout that has not happened yet/i);

    const text = JSON.stringify(candidate);
    // The committed app records name no Build 27 source revision, upload or
    // store read-back, and GIPHY is a dormant option rather than a pending one.
    assert.doesNotMatch(text, /22cc2313|is available to|GIPHY|Android session continuity/i);
    assert.doesNotMatch(text, /available to everyone|publicly available|server backend is active/i);
  });

  test("records YO Voice 3.0.0 (34), the Slim redesign, as the current confirmed tester release", () => {
    const release = productUpdates.find(
      (update) => update.slug === "mobile-build-34-internal-testing",
    );

    assert.ok(release);
    assert.equal(release.updatedOn, "2026-09-19");
    assert.equal(release.status, "testing");
    assert.deepEqual(release.release, {
      version: "3.0.0 (34)",
      stage: "Internal testing",
      buildNumber: 34,
    });
    // Evidence: yovoice-evidence/2026-09-19/release-3.0.0/{play,ios,web}.md
    // and web-readback.txt; source f71a2ae2 is recorded in current-release.ts
    // and in the entry's code comment, not in the visible summary.
    assert.equal(currentRelease.sourceRevision.slice(0, 8), "f71a2ae2");
    assert.match(release.summary, /one calmer design/i);
    assert.match(release.summary, /Dark and Pearl/);
    assert.match(release.summary, /Google Play Internal Testing \(published 19 September 2026\)/i);
    assert.match(release.summary, /in TestFlight/);
    assert.match(release.summary, /web app at app\.yovoice\.app, which serves build 34/i);
    assert.match(release.summary, /internal tester release/i);
    assert.match(release.summary, /not a public App Store or Google Play release/i);
    assert.match(release.summary, /Servers stay open to every signed-in account/i);
    assert.match(release.summary, /Podcast recording remains disabled/i);
    // The softer web sounds are stated for the web only, with no phone build.
    assert.match(release.summary, /Since 24 September the web app also plays a new set of softer sounds/);

    const scope = release.highlights.join(" ");
    for (const area of [
      /Home: the YO Voice logo in the greeting/,
      /friends' Moments as a story rail/i,
      /Live now row/i,
      /server rail beside the channels/i,
      /Channels sheet/i,
      /who is active/i,
      /date separators/i,
      /Voice and Yeels stay separate formats/i,
      /new header with stats and clear actions/i,
      /sign-in, sign-up and password reset/i,
    ]) {
      assert.match(scope, area);
    }

    // Only what testers have: the external TestFlight group's approval of 34
    // is not recorded, nothing from a later or unreleased build is named, and
    // the English app calls the first tab Home, not Start.
    const text = JSON.stringify(release);
    assert.doesNotMatch(
      text,
      /both TestFlight groups|3\.0\.1|3\.1\.0|\b35\b|GIPHY|server_message_media|Velvet Mallet|\bRooms?\b|\bClubs?\b|\bStart\b|available to everyone|publicly available/,
    );
    assert.doesNotMatch(text, /f71a2ae2|176ec120|\d{1,2}:\d{2} CEST/);
  });

  test("keeps Build 33 as superseded history, replaced only where 3.0.0 (34) is recorded", () => {
    const release = productUpdates.find(
      (update) => update.slug === "mobile-build-33-internal-testing",
    );

    assert.ok(release);
    assert.notEqual(productUpdates[0], release);
    assert.equal(release.updatedOn, "2026-09-19");
    assert.equal(release.status, "superseded");
    assert.deepEqual(release.release, {
      version: "2.0.0 (33)",
      stage: "Internal testing",
      buildNumber: 33,
    });
    // Evidence: yovoice-evidence/2026-09-19/build33-2026-09-19.md (§Web,
    // §iOS, Google Play) and build33-play/play-readback.md. Build 33 did reach
    // both TestFlight groups; 3.0.0 (34) replaced it on Play and the web, and
    // the external group's approval of 34 is not recorded, so the entry does
    // not claim 33 is gone from every channel.
    assert.match(release.summary, /reached our existing testers on 19 September 2026/i);
    assert.match(release.summary, /Google Play Internal Testing/i);
    assert.match(release.summary, /both TestFlight groups/i);
    assert.match(release.summary, /web app at app\.yovoice\.app, which served build 33/i);
    assert.match(release.summary, /not a public App Store or Google Play release/i);
    assert.match(
      release.summary,
      /YO Voice 3\.0\.0 \(34\) has since replaced it on Google Play Internal Testing and the web app/,
    );
    assert.doesNotMatch(release.summary, /every tester channel/i);

    const scope = release.highlights.join(" ");
    for (const capability of [
      /Profile photos and banners load everywhere/i,
      /clock is a few seconds off/i,
      /Settings and Creator Studio show your real photo/i,
      /Every avatar opens a fullscreen preview/i,
      /banners open fullscreen too/i,
      /your own profile photo is tappable/i,
      /Chat previews are localized/i,
      /large text sizes/i,
      /like button and spinner no longer get stuck/i,
    ]) {
      assert.match(scope, capability);
    }

    assert.doesNotMatch(
      JSON.stringify(release),
      /RC-\d+|V1\b|V2\b|canonical|\bRooms?\b|\bClubs?\b|available to everyone|publicly available/,
    );
  });

  test("records the website's Google and Apple sign-in as a live website entry", () => {
    const website = productUpdates.find(
      (update) => update.slug === "website-google-apple-sign-in",
    );

    assert.ok(website);
    assert.equal(website.updatedOn, "2026-09-24");
    assert.equal(website.status, "live");
    assert.equal(website.release, undefined);
    assert.match(website.summary, /Continue with Google and Continue with Apple/);
    assert.match(website.summary, /two-factor authentication/i);
    // No handler domain, no open security item, and no mobile build claim.
    assert.doesNotMatch(
      JSON.stringify(website),
      /firebaseapp\.com|takeover|two-step|\bBuild \d+|3\.0\.0/i,
    );
  });

  test("keeps source hashes and minute-level publish times out of visible ledger text", () => {
    // Hashes and CEST times are release evidence, kept in code comments in
    // product-updates.ts and in yovoice-evidence; visitors get dates and
    // versions.
    for (const update of productUpdates) {
      const visible = [update.title, update.summary, ...update.highlights].join(" ");
      assert.doesNotMatch(
        visible,
        /source (?:revision|commit):? [0-9a-f]{7}|\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/i,
        update.slug,
      );
      assert.doesNotMatch(visible, /\b\d{1,2}:\d{2}\s*CEST\b/, update.slug);
    }
  });

  test("publishes no internal tester head-counts", () => {
    for (const update of productUpdates) {
      assert.doesNotMatch(
        [update.summary, ...update.highlights].join(" "),
        /\b\d+-person\b|\bfor \d+ (?:Android )?testers?\b|\b\d+ external plus\b|\b(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten) external TestFlight installations\b/i,
        update.slug,
      );
    }
  });

  test("keeps Build 32 as superseded history without claiming in-app deletion works", () => {
    const release = productUpdates.find(
      (update) => update.slug === "mobile-build-32-internal-testing",
    );

    assert.ok(release);
    assert.equal(release.updatedOn, "2026-09-19");
    assert.equal(release.status, "superseded");
    assert.deepEqual(release.release, {
      version: "2.0.0 (32)",
      stage: "Internal testing",
      buildNumber: 32,
    });
    // Evidence: yovoice-evidence/2026-09-19/build32-2026-09-19.md (§iOS,
    // Google Play, Hosting read-back) and build32-play/play-readback.md.
    assert.match(release.summary, /19 September 2026/i);
    assert.match(release.summary, /Google Play Internal Testing/i);
    assert.match(release.summary, /both TestFlight groups/i);
    assert.match(release.summary, /app\.yovoice\.app, which served build 32/i);
    assert.match(release.summary, /not a public App Store or Google Play release/i);
    assert.match(release.summary, /Build 33 has since superseded it/i);

    const scope = release.highlights.join(" ");
    for (const capability of [
      /Delete account screen/i,
      /server-side processing switches on later/i,
      /offers the e-mail route/i,
      /Members of public Servers can invite friends/i,
      /private Servers keep invites to admins and moderators/i,
      /no longer show empty threads other people opened/i,
      /profile photos load more reliably/i,
      /reactions work on photo and video messages/i,
      /keyboard can always be dismissed/i,
      /participant names in voice sessions never show an e-mail address/i,
    ]) {
      assert.match(scope, capability);
    }

    // The deletion pipeline is switched off server-side, so the entry must not
    // say an account can be deleted in the app, and it names no internal
    // function, release-control or block detail.
    const text = JSON.stringify(release);
    assert.doesNotMatch(
      text,
      /you can (?:now )?delete your account|processed within|deletes? your account in the app/i,
    );
    assert.doesNotMatch(text, /block/i);
    assert.doesNotMatch(
      text,
      /RC-\d+|V1\b|deleteAccountSelf|createServerInvite|getProfileMediaAccess|kill.?switch|available to everyone|publicly available/i,
    );
  });

  test("keeps Build 31 as superseded history with its original record", () => {
    const release = productUpdates.find(
      (update) => update.slug === "mobile-build-31-internal-testing",
    );

    assert.ok(release);
    assert.notEqual(productUpdates[0], release);
    assert.equal(release.updatedOn, "2026-09-18");
    assert.equal(release.status, "superseded");
    assert.deepEqual(release.release, {
      version: "2.0.0 (31)",
      stage: "Internal testing",
      buildNumber: 31,
    });
    // Evidence: yovoice-evidence/2026-09-18/build31-play/play-readback.md,
    // build31-asc-*.json and build31-2026-09-18.md §Web.
    assert.match(release.summary, /Google Play Internal Testing/i);
    assert.match(release.summary, /published 18 September 2026/i);
    assert.match(release.summary, /both TestFlight groups/i);
    assert.match(release.summary, /web app at app\.yovoice\.app/i);
    assert.match(release.summary, /internal tester release/i);
    assert.match(release.summary, /not a public App Store or Google Play release/i);
    assert.match(release.summary, /Podcast recording remains disabled/i);

    const scope = release.highlights.join(" ");
    for (const capability of [
      /typed while offline/i,
      /Edit is offered only on text messages/i,
      /read from the conversation/i,
      /publish button shows Preparing, Publishing and Finishing/i,
      /no longer locks the draft/i,
      /web-recorder videos/i,
      /Voice Moments feed/i,
      /display name/i,
      /direct-message notifications/i,
      /mutual-friends and suggestions limits/i,
    ]) {
      assert.match(scope, capability);
    }

    // User-facing only: no internal identifiers, and no retired surface or
    // public-rollout claim on the current build.
    assert.doesNotMatch(
      JSON.stringify(release),
      /RC-\d+|V2\b|canonical|\bRooms?\b|\bClubs?\b|available to everyone|publicly available/,
    );
  });

  test("keeps Build 30 as superseded history that records the Servers opening and the repair", () => {
    const release = productUpdates.find(
      (update) => update.slug === "mobile-build-30-internal-testing",
    );

    assert.ok(release);
    assert.equal(release.updatedOn, "2026-09-17");
    assert.equal(release.status, "superseded");
    assert.deepEqual(release.release, {
      version: "2.0.0 (30)",
      stage: "Internal testing",
      buildNumber: 30,
    });
    assert.match(release.summary, /17 September 2026/i);
    assert.match(release.summary, /open to every signed-in account/i);
    assert.match(release.summary, /repaired on 16 September 2026/i);
    assert.match(release.summary, /Build 31 has since replaced Build 30/i);
    assert.match(release.highlights.join(" "), /GIFs can be sent in private chats/i);
    assert.match(release.highlights.join(" "), /Web push notifications are restored/i);
    assert.match(release.highlights.join(" "), /Podcast recording stays disabled/i);
    assert.doesNotMatch(JSON.stringify(release), /available to everyone|publicly available/i);
  });

  test("keeps Build 26 as superseded internal tester history", () => {
    const release = productUpdates.find(
      (update) => update.slug === "mobile-build-26-internal-testing",
    );

    assert.ok(release);
    assert.notEqual(productUpdates[0], release);
    assert.equal(release.slug, "mobile-build-26-internal-testing");
    assert.equal(release.updatedOn, "2026-09-13");
    assert.equal(release.status, "superseded");
    assert.deepEqual(release.release, {
      version: "2.0.0 (26)",
      stage: "Internal testing",
      buildNumber: 26,
    });
    assert.match(release.summary, /existing Google Play Internal Testing list/i);
    assert.match(release.summary, /existing TestFlight internal group/i);
    assert.match(release.summary, /internal tester release/i);
    assert.match(release.summary, /not a public App Store or Google Play release/i);
    assert.match(release.summary, /server backend activation remains gated/i);
    assert.match(release.summary, /Podcast recording remains disabled/i);

    const scope = release.highlights.join(" ");
    for (const capability of [
      /Friends, Community, Podcast, Family and Company/i,
      /preserving the established animated Hub/i,
      /Home, Chats and Friends/i,
      /full-screen viewer/i,
      /Yeels/i,
      /position text and links before publishing/i,
      /real-device tester validation/i,
    ]) {
      assert.match(scope, capability);
    }

    assert.doesNotMatch(
      JSON.stringify(release),
      /available to everyone|publicly available|server backend is active|Podcast recording is active/i,
    );
  });

  test("keeps build 20 as superseded invited-tester history", () => {
    const release = productUpdates.find(
      (update) => update.slug === "mobile-build-20-invited-testing",
    );

    assert.ok(release);
    assert.equal(release.updatedOn, "2026-09-05");
    assert.equal(release.status, "superseded");
    assert.deepEqual(release.release, {
      version: "1.0.0 (20)",
      stage: "Invited testing",
      buildNumber: 20,
    });
    assert.match(release.summary, /Google Play Internal Testing/i);
    assert.match(release.summary, /existing tester list/i);
    assert.match(release.summary, /matching web release is live/i);
    assert.match(release.summary, /TestFlight for the external group plus the internal tester/i);
    assert.match(release.summary, /Installations in the external TestFlight group are confirmed/i);
    assert.doesNotMatch(release.summary, /pending|staged|awaiting/i);
    assert.match(release.summary, /not a public App Store or Google Play release/i);
    assert.match(release.highlights.join(" "), /real-device media and mixed-version audio\/video call acceptance continues/i);
    assert.doesNotMatch(JSON.stringify(release), /1\s*ms|end-to-end encrypted|available to everyone|publicly available/i);
  });

  test("keeps Build 20 creation and sound scope within verified product boundaries", () => {
    const moments = productUpdates.find((update) => update.slug === "yo-moments-unified-feed");
    const identity = productUpdates.find((update) => update.slug === "frame-echo-and-velvet-prism");

    assert.ok(moments);
    assert.ok(identity);
    // The app calls the format Yeels, and marketing names no third party.
    assert.match(moments.summary, /focused first version of Yeels/i);
    assert.doesNotMatch(JSON.stringify([moments, identity]), /\bReels\b|Instagram/);
    // Both entries describe pre-3.0.0 designs and a replaced sound pack.
    assert.equal(moments.status, "superseded");
    assert.equal(identity.status, "superseded");
    assert.match(moments.highlights.join(" "), /owned or licensed/i);
    assert.match(moments.highlights.join(" "), /Spotify and Apple Music tracks are not extracted/i);
    assert.match(identity.summary, /without internal bars or tilt/i);
    assert.match(identity.highlights.join(" "), /Sound effects are optional/i);
    assert.match(identity.highlights.join(" "), /Do Not Disturb remain authoritative/i);
  });

  test("centralizes the present-tense release boundary on the confirmed build", () => {
    assert.deepEqual(currentRelease, {
      version: "3.0.0 (34)",
      buildNumber: 34,
      sourceRevision: "f71a2ae21ca353cc70b099edd5d4c1323bc87343",
      stage: "Internal testing",
      mobileChannelsConfirmed: true,
      publicStoreRelease: false,
      serversInterfaceIncluded: true,
      serversBackendActive: true,
      podcastRecordingActive: false,
    });
    // Names who can install today and where; carries no build number so the
    // welcome homepage may render it (tests/homepage-welcome.test.ts).
    assert.match(currentReleaseAvailability, /existing testers/i);
    assert.match(currentReleaseAvailability, /Google Play Internal Testing/i);
    // TestFlight build 34 is recorded in beta testing for the internal group
    // only; the external group's approval is not recorded, so the sentence
    // names TestFlight without claiming both groups.
    assert.match(currentReleaseAvailability, /TestFlight/);
    assert.doesNotMatch(currentReleaseAvailability, /both TestFlight groups/i);
    assert.match(currentReleaseAvailability, /web app at app\.yovoice\.app/i);
    assert.doesNotMatch(currentReleaseAvailability, /\bBuilds?\s+\d+|\d+\.\d+\.\d+\s*\(\d+\)/i);

    assert.ok(
      productUpdates.some(
        (update) =>
          update.slug === `mobile-build-${currentRelease.buildNumber}-internal-testing` &&
          update.status === "testing",
      ),
    );

    const releaseSurfaces = [
      "../src/components/sections/download-section.tsx",
      "../src/components/download/platform-selector.tsx",
      "../src/app/(marketing)/download/page.tsx",
      "../src/app/(marketing)/faq/page.tsx",
      "../src/app/(marketing)/roadmap/page.tsx",
      "../src/app/(marketing)/about/page.tsx",
      "../src/app/(marketing)/updates/page.tsx",
      "../src/components/sections/latest-release-spotlight.tsx",
    ];

    for (const relativePath of releaseSurfaces) {
      const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
      assert.match(source, /currentRelease|build 26/i, relativePath);
      assert.doesNotMatch(source, /build (?:18|19|20)\b/i, relativePath);
      assert.doesNotMatch(source, /awaiting (?:invited-tester )?distribution/i);
      assert.doesNotMatch(source, /publicly available|available to everyone/i);
      assert.doesNotMatch(
        source,
        /Build (?:27|32) (?:is|are) available|2\.0\.0 \((?:27|32)\) is available|GIPHY|Android session continuity|22cc2313/i,
        relativePath,
      );
      // The version is rendered from current-release.ts, never typed into a
      // page, and no later build or unreleased feature is announced.
      assert.doesNotMatch(source, /3\.0\.0|3\.0\.1|3\.1\.0|nextReleaseCandidate|both TestFlight groups/, relativePath);
    }
  });

  test("badges only the current confirmed build as in testing and never presents retired Rooms or Clubs as current", () => {
    const currentSlug = `mobile-build-${currentRelease.buildNumber}-internal-testing`;
    const buildEntries = productUpdates.filter(
      (update) =>
        update.release !== undefined ||
        /\bbuild-\d+\b/.test(update.slug) ||
        /\bBuild \d+\b/i.test(update.title),
    );

    assert.ok(buildEntries.length >= 7, "build entries are recognised");
    assert.deepEqual(
      buildEntries
        .filter((update) => update.status === "testing")
        .map((update) => update.slug),
      [currentSlug],
    );
    for (const update of buildEntries) {
      if (update.slug === currentSlug) continue;
      assert.ok(
        update.status === "superseded" || update.status === "verification",
        `${update.slug} is ${update.status}`,
      );
    }

    // Servers replaced the standalone Rooms and Clubs surfaces, so no entry
    // headed or summarised as a Room or Club may carry a current status.
    const retiredSurfaces = productUpdates.filter((update) =>
      /\b(?:Rooms?|Clubs?)\b/.test(`${update.eyebrow} ${update.title} ${update.summary}`),
    );
    assert.ok(retiredSurfaces.length >= 7, "retired surface entries are recognised");
    for (const update of retiredSurfaces) {
      assert.ok(
        !["testing", "live", "ready"].includes(update.status),
        `${update.slug} presents a retired surface as ${update.status}`,
      );
    }
  });

  test("describes superseded history in the Updates legend", () => {
    const updates = readFileSync(
      new URL("../src/app/(marketing)/updates/page.tsx", import.meta.url),
      "utf8",
    );
    assert.match(updates, /superseded: \{\s*label: "Superseded",\s*description: "Replaced by a later tester build or surface; kept for history"/);
  });

  test("keeps the August website rebuild as superseded history", () => {
    // Its "product preview" and "sculpted YO dock" no longer exist on the
    // site, so the entry is history rather than a live claim.
    const website = productUpdates.find(
      (update) => update.slug === "website-product-sync",
    );

    assert.ok(website);
    assert.equal(website.status, "superseded");
    assert.match(website.summary, /verified in production/i);
  });

  test("badges the designs and sounds that 3.0.0 replaced as superseded", () => {
    for (const slug of [
      "dark-pearl-visual-system",
      "sculpted-navigation-live-room",
      "responsive-authentication-stage",
      "moments-circle-focus",
      "velvet-prism-sound",
      "frame-echo-and-velvet-prism",
      "yo-moments-unified-feed",
    ]) {
      const update = productUpdates.find((entry) => entry.slug === slug);
      assert.ok(update, slug);
      assert.equal(update.status, "superseded", slug);
    }
  });

  test("keeps Premium sandbox verification behind the live checkout boundary", () => {
    const premium = productUpdates.find(
      (update) => update.slug === "premium-plan-chooser",
    );

    assert.ok(premium);
    assert.equal(premium.status, "verification");
    assert.match(premium.summary, /sandbox/i);
    assert.match(premium.summary, /without completing a payment/i);
    assert.match(premium.summary, /live checkout remains disabled/i);
    assert.match(premium.highlights.join(" "), /€6 monthly/);
    assert.match(premium.highlights.join(" "), /€60 yearly/);
    assert.match(premium.highlights.join(" "), /PLN 26 for 30 days/);
    assert.match(premium.highlights.join(" "), /PLN 260 for 365 days/);
  });

  test("keeps build 11 as superseded tester-channel history", () => {
    const chat = productUpdates.find(
      (update) => update.slug === "direct-chat-reliability-build-11",
    );

    assert.ok(chat);
    assert.equal(chat.status, "superseded");
    assert.equal(chat.updatedOn, "2026-08-28");
    assert.match(chat.summary, /1\.0\.0 build 11/);
    assert.match(chat.summary, /both permanent TestFlight groups/i);
    assert.match(chat.summary, /Google Play Internal Testing/);
    assert.match(chat.highlights.join(" "), /Text appears immediately/i);
    assert.match(chat.highlights.join(" "), /photo and voice-message/i);
    assert.match(chat.highlights.join(" "), /Foreground alerts/i);
    assert.match(chat.highlights.join(" "), /one-to-one calls/i);
  });

  test("keeps mobile build 8 and the Clubs-era Premium preview as superseded history", () => {
    const mobile = productUpdates.find(
      (update) => update.slug === "mobile-build-8-testing",
    );
    const android = productUpdates.find(
      (update) => update.slug === "android-adaptive-icon",
    );

    assert.ok(mobile);
    assert.equal(mobile.status, "superseded");
    assert.equal(mobile.updatedOn, "2026-08-28");
    assert.match(mobile.summary, /1\.0\.0 build 8/);
    assert.match(mobile.summary, /Google Play Internal Testing/);
    assert.match(mobile.summary, /TestFlight/);
    assert.match(mobile.highlights.join(" "), /passed export compliance/i);
    assert.match(mobile.highlights.join(" "), /persistent tester groups/i);

    assert.ok(android);
    assert.equal(android.status, "testing");
    assert.match(android.summary, /Build 8 is active on Google Play Internal Testing/i);
    assert.match(android.highlights.join(" "), /existing opt-in/i);
    assert.match(android.highlights.join(" "), /correct Google Account/i);

    const moderatorPreview = productUpdates.find(
      (update) => update.slug === "moderator-premium-preview",
    );
    assert.ok(moderatorPreview);
    assert.equal(moderatorPreview.status, "superseded");
    assert.match(moderatorPreview.summary, /without creating a subscription/i);
    assert.match(moderatorPreview.highlights.join(" "), /No plan, renewal, payment provider or paid entitlement/i);

    assert.doesNotMatch(JSON.stringify(productUpdates), /\b[^\s@]+@[^\s@]+\b/);
  });
});
