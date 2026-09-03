import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Community Room artwork mirrors consent-first entry and docked chat", async () => {
  const preview = await readFile(
    "src/components/sections/community-room-preview.tsx",
    "utf8",
  );

  assert.match(preview, /Before you join/);
  assert.match(preview, /No audio before consent/);
  assert.match(preview, /Microphone off/);
  assert.match(preview, /Join conversation/);
  assert.match(preview, /Visible by default/);
  assert.match(preview, /Hide the panel/);
  assert.doesNotMatch(preview, /listeners?|audience total/i);
});

test("homepage artwork keeps account readiness visible without live-user claims", async () => {
  const preview = await readFile(
    "src/components/hero/app-experience-preview.tsx",
    "utf8",
  );

  assert.match(preview, /Your email isn&apos;t verified yet/);
  assert.match(preview, /Verify now/);
  assert.match(preview, /No live activity shown/);
});

test("feature copy is honest about language fallback and native permission prompts", async () => {
  const features = await readFile(
    "src/app/(marketing)/features/page.tsx",
    "utf8",
  );

  assert.match(features, /each operating-system prompt appears only when needed/i);
  assert.match(features, /English fallback on specialist screens/i);
  assert.doesNotMatch(features, /one (?:click|prompt).*(?:camera|microphone|notification)/i);
});

test("homepage Build 19 spotlight mirrors scope without claiming rollout", async () => {
  const spotlight = await readFile(
    "src/components/sections/latest-release-spotlight.tsx",
    "utf8",
  );

  for (const label of [
    "Chats & media",
    "Current identity",
    "Private calls",
    "Voice Moments",
    "Reels MVP",
    "Trust boundary",
  ]) {
    assert.ok(spotlight.includes(label), label);
  }

  assert.match(spotlight, /not marked as available/i);
  assert.match(spotlight, /physical-device checks/i);
  assert.doesNotMatch(spotlight, /1\s*ms|end-to-end encrypted|now available/i);
});
