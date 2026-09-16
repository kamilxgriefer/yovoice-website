import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  currentRelease,
  currentReleaseAvailability,
  nextReleaseCandidate,
  nextReleaseCandidateStatus,
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
    assert.match(mobile.summary, /14-person tester list/i);
    assert.match(mobile.summary, /TestFlight/i);
    assert.match(mobile.summary, /one-person internal group/i);
    assert.match(mobile.summary, /six-person YO Voice Beta Testers external group/i);
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
    assert.match(candidate.summary, /15 Android testers/i);
    assert.match(candidate.summary, /TestFlight for 7 external plus 1 internal tester/i);
    assert.match(candidate.summary, /internal TestFlight installation is confirmed/i);
    assert.match(candidate.summary, /not a public App Store or Google Play release/i);

    const scope = candidate.highlights.join(" ");
    for (const capability of [
      /Chats and identity/i,
      /photo, video and voice-note/i,
      /avatar refresh/i,
      /private audio and video/i,
      /Voice Moments/i,
      /Reels MVP/i,
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

  test("records Build 27 only as an unconfirmed internal tester candidate", () => {
    const candidate = productUpdates.find(
      (update) => update.slug === "mobile-build-27-internal-tester-candidate",
    );

    assert.ok(candidate);
    assert.equal(
      productUpdates.some((update) => update.slug === "mobile-build-27-internal-testing"),
      false,
    );
    assert.equal(candidate.status, "verification");
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

  test("records Build 26 as the current confirmed internal tester release", () => {
    const release = productUpdates.find(
      (update) => update.slug === "mobile-build-26-internal-testing",
    );

    assert.ok(release);

    assert.equal(productUpdates[0], release);
    assert.equal(release.slug, "mobile-build-26-internal-testing");
    assert.equal(release.updatedOn, "2026-09-13");
    assert.equal(release.status, "testing");
    assert.deepEqual(release.release, {
      version: "2.0.0 (26)",
      stage: "Internal testing",
      buildNumber: 26,
    });
    assert.match(release.summary, /source revision d1c036b7/i);
    assert.match(release.summary, /15-person Google Play Internal Testing list/i);
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
    assert.match(release.summary, /15-person tester list/i);
    assert.match(release.summary, /matching web release is live/i);
    assert.match(release.summary, /TestFlight for the six-person external group plus the internal tester/i);
    assert.match(release.summary, /Five external TestFlight installations are confirmed/i);
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
    assert.match(moments.summary, /focused Reels MVP/i);
    assert.match(moments.highlights.join(" "), /owned or licensed/i);
    assert.match(moments.highlights.join(" "), /Spotify and Apple Music tracks are not extracted/i);
    assert.match(identity.summary, /without internal bars or tilt/i);
    assert.match(identity.highlights.join(" "), /Sound effects are optional/i);
    assert.match(identity.highlights.join(" "), /Do Not Disturb remain authoritative/i);
  });

  test("centralizes the present-tense release boundary on the confirmed build", () => {
    assert.deepEqual(currentRelease, {
      version: "2.0.0 (26)",
      buildNumber: 26,
      sourceRevision: "d1c036b75fea16e8962e7af932166cf95aa8f0ab",
      stage: "Internal testing",
      mobileChannelsConfirmed: true,
      publicStoreRelease: false,
      serversInterfaceIncluded: true,
      serversBackendActive: false,
      podcastRecordingActive: false,
    });
    assert.match(currentReleaseAvailability, /existing internal testers/i);
    assert.match(currentReleaseAvailability, /Google Play Internal Testing/i);
    assert.match(currentReleaseAvailability, /TestFlight/i);

    assert.deepEqual(nextReleaseCandidate, {
      version: "2.0.0 (27)",
      buildNumber: 27,
      stage: "Candidate",
      availabilityConfirmed: false,
      publicStoreRelease: false,
      gifOriginalsBundled: 16,
      gifBackendActive: false,
    });
    assert.match(nextReleaseCandidateStatus, /not yet confirmed as available/i);
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
        /Build 27 (?:is|are) available|2\.0\.0 \(27\) is available|GIPHY|Android session continuity|22cc2313/i,
        relativePath,
      );
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

  test("marks the rebuilt website live only after production verification", () => {
    const website = productUpdates.find(
      (update) => update.slug === "website-product-sync",
    );

    assert.ok(website);
    assert.equal(website.status, "live");
    assert.match(website.summary, /verified in production/i);
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
    assert.match(chat.summary, /source commit a67036b/);
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
    assert.match(mobile.summary, /source commit 5f61c71/);
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
