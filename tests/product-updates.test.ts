import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

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

  test("keeps the coordinated social and room wave honest in invited testing", () => {
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
    assert.equal(rooms.status, "testing");
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

  test("records build 18 on both confirmed tester channels", () => {
    const mobile = productUpdates.find(
      (update) => update.slug === "mobile-build-18",
    );

    assert.ok(mobile);
    assert.equal(mobile.updatedOn, "2026-09-02");
    assert.equal(mobile.status, "testing");
    assert.match(mobile.summary, /1\.0\.0 build 18/i);
    assert.match(mobile.summary, /Google Play Internal Testing/i);
    assert.match(mobile.summary, /14-person tester list/i);
    assert.match(mobile.summary, /TestFlight/i);
    assert.match(mobile.summary, /one-person internal group/i);
    assert.match(mobile.summary, /six-person YO Voice Beta Testers external group/i);
    assert.match(mobile.summary, /automatic TestFlight notifications enabled/i);
    assert.doesNotMatch(mobile.summary, /public store release/i);
  });

  test("records build 19 on both invited tester channels", () => {
    const candidate = productUpdates.find(
      (update) => update.slug === "mobile-build-19-release-candidate",
    );

    assert.ok(candidate);
    assert.equal(candidate.updatedOn, "2026-09-03");
    assert.equal(candidate.status, "testing");
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

  test("records build 20 on both confirmed invited tester channels", () => {
    const release = productUpdates[0];

    assert.equal(release.slug, "mobile-build-20-invited-testing");
    assert.equal(release.updatedOn, "2026-09-05");
    assert.equal(release.status, "testing");
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

  test("keeps every visible current-release reference on the same build truth", () => {
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
      assert.match(source, /build 20/i, relativePath);
      assert.doesNotMatch(source, /build (?:18|19)/i, relativePath);
      assert.doesNotMatch(source, /awaiting (?:invited-tester )?distribution/i);
    }
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

  test("records build 11 on both permanent tester channels", () => {
    const chat = productUpdates.find(
      (update) => update.slug === "direct-chat-reliability-build-11",
    );

    assert.ok(chat);
    assert.equal(chat.status, "testing");
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

  test("keeps mobile build 8 rollout truthful for each store", () => {
    const mobile = productUpdates.find(
      (update) => update.slug === "mobile-build-8-testing",
    );
    const android = productUpdates.find(
      (update) => update.slug === "android-adaptive-icon",
    );

    assert.ok(mobile);
    assert.equal(mobile.status, "testing");
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
    assert.equal(moderatorPreview.status, "testing");
    assert.match(moderatorPreview.summary, /without creating a subscription/i);
    assert.match(moderatorPreview.highlights.join(" "), /No plan, renewal, payment provider or paid entitlement/i);

    assert.doesNotMatch(JSON.stringify(productUpdates), /\b[^\s@]+@[^\s@]+\b/);
  });
});
