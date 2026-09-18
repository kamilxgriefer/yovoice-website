import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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

test("deletion promises only what the deployed trigger does", () => {
  assert.match(privacy, /no self-service account deletion in the app yet/);
  assert.ok(privacy.includes("support@yovoice.app"));
  assert.match(privacy, /still contains your email address/);
  assert.match(privacy, /your call records/);
  assert.doesNotMatch(privacy, /we (?:remove|erase|delete) (?:or anonymi[sz]e )?(?:all )?your personal data/i);
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
