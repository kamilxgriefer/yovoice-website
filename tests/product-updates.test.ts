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

  test("keeps the September security wave behind explicit rollout gates", () => {
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
    assert.equal(media.status, "verification");
    assert.match(media.summary, /90-second ceiling/i);
    assert.match(media.summary, /not presented as deployed/i);
    assert.match(media.highlights.join(" "), /IAM/i);

    assert.ok(privilegedAuth);
    assert.equal(privilegedAuth.status, "verification");
    assert.match(privilegedAuth.summary, /after staff enrollment/i);
    assert.match(privilegedAuth.summary, /App Check enforcement/i);

    assert.ok(video);
    assert.equal(video.status, "verification");
    assert.match(video.summary, /implemented in source but remains unreleased/i);
    assert.match(video.highlights.join(" "), /does not claim FaceTime-style application E2EE/i);
  });

  test("keeps the coordinated social and room wave honest before rollout", () => {
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
    assert.equal(rooms.status, "verification");
    assert.equal(social.status, "verification");
    assert.equal(account.status, "verification");
    assert.match(rooms.summary, /only after Join conversation/i);
    assert.match(rooms.summary, /rollout checks are still in progress/i);
    assert.match(social.summary, /Production latency still depends on the network/i);
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

  test("keeps every visible current-release reference on the same build truth", () => {
    const releaseSurfaces = [
      "../src/components/sections/download-section.tsx",
      "../src/components/download/platform-selector.tsx",
      "../src/app/(marketing)/download/page.tsx",
      "../src/app/(marketing)/faq/page.tsx",
      "../src/app/(marketing)/roadmap/page.tsx",
      "../src/app/(marketing)/about/page.tsx",
    ];

    for (const relativePath of releaseSurfaces) {
      const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
      assert.match(source, /build 18/i, relativePath);
      assert.doesNotMatch(source, /build 17/i, relativePath);
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
