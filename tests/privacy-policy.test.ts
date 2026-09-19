import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  DELETION_LIMITS,
  DELETION_REMOVES,
  SELF_SERVICE_DELETION_LIVE,
  accountDeletionRetains,
  accountDeletionRoutes,
  accountDeletionSummary,
  accountDeletionTiming,
} from "../src/content/account-deletion.ts";

/**
 * The privacy policy is the document Google Play cross-checks the Data safety
 * declaration against, so every sentence in it has to match what the app code
 * actually does. This test pins the claims that were wrong before — retired
 * Rooms and Clubs as the product, live Stripe/PayPal billing, an avatar from
 * Apple, a consent record that is "deleted" on withdrawal, Android-only device
 * attestation — and the disclosures the page had been missing.
 *
 * Grounding for each claim is recorded with file-and-line citations in
 * yovoice-evidence/2026-09-18/privacy-policy/fact-sheet.md.
 */

function prose(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8")
    .replace(/\{"\s*"\}/g, " ")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

const privacy = prose("../src/app/(marketing)/privacy/page.tsx");
const terms = prose("../src/app/(marketing)/terms/page.tsx");
const faq = prose("../src/app/(marketing)/faq/page.tsx");

test("the policy describes Servers, and never Rooms or Clubs as a current product", () => {
  assert.match(privacy, /voice-first social product built around Servers/);
  assert.match(privacy, /Those are retired surfaces/);
  // The single permitted mention is the sentence that retires them.
  assert.equal((privacy.match(/\bClubs?\b/g) ?? []).length, 1);
  assert.equal((privacy.match(/\bRooms?\b/g) ?? []).length, 1);
  assert.doesNotMatch(terms, /\bvoice room\b|\bclub owners?\b|\bclub content\b/i);
});

test("no payment provider is presented as live, because no checkout is deployed", () => {
  assert.doesNotMatch(privacy, /Stripe|PayPal|BLIK/i);
  assert.match(privacy, /Premium is not available for purchase yet/);
  assert.match(privacy, /no payment data at all/);
});

test("the data the app really collects is disclosed", () => {
  assert.match(privacy, /Firebase Crashlytics/);
  assert.match(privacy, /no in-app switch to turn crash reporting off/);
  assert.match(privacy, /Music and other audio files/);
  assert.match(privacy, /Files and documents/);
  assert.match(privacy, /push notification token/);
  assert.match(privacy, /your account identifier travels as the participant identity/);
});

test("account creation is described as the code performs it", () => {
  // username is always collected, never optional.
  assert.match(privacy, /profile holds a display name and a username/);
  assert.doesNotMatch(privacy, /display name \(required\)/);
  // Apple returns no avatar, and no provider photo becomes the profile picture.
  assert.match(privacy, /Apple returns only your name and an email address/);
  assert.match(privacy, /and no photo/);
  assert.doesNotMatch(privacy, /returns your name, email address and avatar/);
});

test("device attestation covers Apple devices and the web app", () => {
  assert.match(privacy, /App Attest with a DeviceCheck fallback/);
  assert.match(privacy, /On the web app this check is not enabled/);
  assert.match(privacy, /Apple .{0,80}device-attestation check on iPhone, iPad and Mac/);
});

test("processors and internal moderation access are both named", () => {
  for (const processor of ["Google Firebase", "LiveKit Cloud", "Resend", "Vercel", "Apple"]) {
    assert.ok(privacy.includes(processor), processor);
  }
  assert.match(privacy, /moderator or administrator role can open a report/);
  assert.match(privacy, /internal audit log/);
});

test("the GIF claim admits the legacy third-party surface", () => {
  assert.doesNotMatch(privacy, /no third-party GIF provider receives anything/);
  assert.match(privacy, /first-party animations that ship inside the app itself/);
  assert.match(privacy, /which sees your IP address/);
  assert.match(privacy, /turning GIF auto-loading off in settings/);
});

test("GIPHY is disclosed as an independent GIF source", () => {
  assert.match(privacy, /YO Voice also shows GIFs from GIPHY/);
  assert.match(privacy, /GIPHY receives your IP address, your device and browser information \(the User-Agent/);
  assert.match(privacy, /and the search terms you typed/);
  assert.match(privacy, /GIPHY's own privacy policy applies/);
  assert.match(privacy, /"Load GIFs automatically"/);
  assert.match(privacy, /rating filter set to G/);
  // The old absolute claim that no search text ever leaves the app is gone.
  assert.doesNotMatch(privacy, /searching for one never sends your search text/);
});

test("website showcase withdrawal keeps a record instead of deleting one", () => {
  assert.doesNotMatch(privacy, /deletes the consent record/);
  assert.match(privacy, /records the withdrawal/);
  assert.match(privacy, /deleted when the account itself is deleted/);
});

test("retention states the one enforced expiry and does not generalise it", () => {
  assert.match(privacy, /kept for as long as your account exists/);
  assert.match(privacy, /90 days after that view/);
  assert.match(privacy, /equivalent record for Voice Moments has no expiry/);
});

test("the terms and FAQ stop promising Premium billing, and gate self-service deletion", () => {
  // Terms §7: no provider, no price, no plan is presented as purchasable.
  assert.doesNotMatch(terms, /Stripe|PayPal|BLIK|EUR 6|EUR 60|PLN 26|PLN 260/i);
  assert.match(terms, /Premium is not available for purchase yet/);
  assert.match(terms, /Before any purchase is offered/);
  // Terms §8 and the FAQ: while the release switch is off, deletion is by
  // email, exactly as the policy says. The self-service wording exists in both
  // files but only behind that switch, so the three pages can never disagree.
  for (const page of [terms, faq]) {
    assert.doesNotMatch(page, /from your account settings/);
    assert.ok(page.includes("SELF_SERVICE_DELETION_LIVE"));
    assert.match(page, /no self-service account deletion in the app yet/);
    assert.ok(page.includes("support@yovoice.app"));
    assert.match(page, /Delete my YO Voice account/);
    assert.match(page, /private account record is kept and marked as deleted/);
  }
  assert.equal(SELF_SERVICE_DELETION_LIVE, false);
});

test("deletion promises only what the deployed trigger does", () => {
  // Section 9 now renders src/content/account-deletion.ts, which is also what
  // /delete-account renders, so the claim is asserted where it is written.
  const live = SELF_SERVICE_DELETION_LIVE;
  const claims = [
    ...DELETION_REMOVES,
    accountDeletionSummary(live),
    accountDeletionTiming(live).headline,
    accountDeletionTiming(live).detail,
    ...accountDeletionRoutes(live).map((route) => route.detail),
    ...accountDeletionRetains(live).flatMap((entry) => [entry.item, entry.reason]),
  ].join(" ");

  assert.match(claims, /no self-service account deletion in the app yet/);
  assert.ok(claims.includes("support@yovoice.app"));
  assert.match(claims, /still contains your email address/);
  // A claim the pipeline does not keep is worse than no claim. Three
  // categories that an earlier draft promised are NOT in the removes list,
  // because `functions/account/stages.js` does not remove them (ADR-206):
  // comments and reactions left on other people's posts, uploads that live in
  // somebody else's Storage container, and directCalls records.
  assert.doesNotMatch(claims, /[Yy]our call records/);
  assert.doesNotMatch(claims, /Family memories/);
  assert.doesNotMatch(claims, /Company channel files/);
  // Server ownership is not succeeded, so nothing may say a Server is closed
  // or handed on. The truthful line replaces it.
  assert.doesNotMatch(claims, /Servers you own are closed/);
  assert.doesNotMatch(claims, /does not survive without an owner/);
  assert.match(claims, /keeps running under an anonymous owner/);

  // Each of the three gaps is published where a reader looks for it, rather
  // than left unmentioned.
  const limits = DELETION_LIMITS.join(" ");
  assert.match(limits, /comment or a reaction you left on somebody else's/);
  assert.match(limits, /Family memory, or a file in a Company channel/);
  assert.match(limits, /call record in a chat/);
  // The Storage disclosure is the COMPLETE one: storage.rules has four
  // prefixes the sweep cannot reach, not two. Room covers and podcast
  // episodes are the other two (functions/account/stages.js).
  assert.match(limits, /cover image you set on a voice room/);
  assert.match(limits, /podcast episode published on a Server/);

  // The store-facing page may not make a categorical claim about everything
  // we hold; it points at the retained list and at the limits instead.
  const publicPage = readFileSync(
    new URL("../src/app/(marketing)/delete-account/page.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(publicPage, /everything we hold/);
  assert.match(publicPage, /These are the categories we remove/);
  assert.doesNotMatch(privacy, /we (?:remove|erase|delete) (?:or anonymi[sz]e )?(?:all )?your personal data/i);
  assert.doesNotMatch(claims, /we (?:remove|erase|delete) (?:or anonymi[sz]e )?(?:all )?your personal data/i);
  // The policy keeps the sentence that made the old text honest, and points at
  // the public page Google Play links.
  assert.match(privacy, /not going to promise you an erasure that our systems do not/);
  assert.ok(privacy.includes("PUBLIC_DELETION_PATH"));
});

test("the in-product choices list matches the controls that exist", () => {
  assert.match(privacy, /profile visibility to public, friends only or private/);
  assert.match(privacy, /withdraws the public website showcase consent/);
  assert.match(privacy, /Invisible is published to everyone else as plain offline/);
  assert.match(privacy, /Turn GIF auto-loading off/);
  assert.match(privacy, /sign out everywhere/);
  assert.match(privacy, /two-factor authentication with an authenticator app/);
});

test("the document is dated for this revision", () => {
  const source = readFileSync(
    new URL("../src/app/(marketing)/privacy/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /updatedOn="September 18, 2026"/);
});
