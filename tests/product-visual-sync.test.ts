import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const build26ScreenshotPaths = [
  "public/screenshots/build-26/home-desktop.jpg",
  "public/screenshots/build-26/chats-desktop.jpg",
  "public/screenshots/build-26/friends-desktop.jpg",
  "public/screenshots/build-26/servers-desktop.jpg",
  "public/screenshots/build-26/yeels-desktop.jpg",
] as const;

test("tester-build experience shows only labelled Build 26 captures", async () => {
  const experience = await readFile(
    "src/components/sections/tester-build-experience.tsx",
    "utf8",
  );

  for (const path of build26ScreenshotPaths) {
    await access(path);
    const assetPath = path.replace("public", "");
    assert.ok(
      experience.includes(assetPath) || assetPath.endsWith("servers-desktop.jpg"),
      path,
    );
  }

  for (const label of ["Home", "Chats", "Friends", "Yeels"]) {
    assert.match(experience, new RegExp(`label: "${label}"`), label);
  }

  assert.match(experience, /Build 26 fixture-fed capture from source d1c036b7/i);
  assert.match(experience, /real desktop Hub|real Hub/i);
  // Nothing records that Build 27 left these surfaces unchanged.
  assert.doesNotMatch(experience, /unchanged in Build 27|reused for Build 27/i);
  assert.doesNotMatch(experience, /active users|people online/i);
});

test("tester-build experience keeps the four surfaces keyboard accessible", async () => {
  const experience = await readFile(
    "src/components/sections/tester-build-experience.tsx",
    "utf8",
  );

  for (const expected of [
    'role="tablist"',
    'role="tab"',
    'role="tabpanel"',
    "aria-controls=",
    "aria-labelledby=",
    "aria-selected=",
    "tabIndex={index === selectedIndex ? 0 : -1}",
    "buttons.current[next]?.focus()",
    "hidden={index !== selectedIndex}",
  ]) {
    assert.ok(experience.includes(expected), expected);
  }

  assert.match(experience, /ArrowLeft/);
  assert.match(experience, /ArrowRight/);
  assert.match(experience, /Home/);
  assert.match(experience, /End/);
});

test("Chats, Friends and Yeels copy matches the tester-build interface boundary", async () => {
  const experience = await readFile(
    "src/components/sections/tester-build-experience.tsx",
    "utf8",
  );

  assert.match(experience, /Add Friend beside New Message/i);
  assert.match(experience, /responsive full-screen viewer/i);
  assert.match(
    experience,
    /call setup and recovery changes are being exercised by internal testers/i,
  );
  assert.match(experience, /All, Online, Requests and Blocked/i);
  assert.match(experience, /same YO Moments language as Voice/i);
  assert.match(
    experience,
    /text and link overlays that can be moved before publishing/i,
  );
  assert.match(experience, /Controls avoid covering the centre of the media/i);
  assert.match(
    experience,
    /Premium Creator profile after age verification and explicit opt-in/i,
  );
  assert.match(
    experience,
    /do not use a client-side toggle as proof of eligibility/i,
  );
  assert.doesNotMatch(experience, /flawless|zero latency|publicly available/i);
});

test("feature copy keeps current capabilities and release gates honest", async () => {
  const features = await readFile(
    "src/app/(marketing)/features/page.tsx",
    "utf8",
  );

  assert.match(features, /Friends, Community, Podcast, Family or Company/i);
  assert.match(
    features,
    /server creation and channel activity remain behind the backend release gate/i,
  );
  assert.match(features, /responsive full-screen viewer/i);
  assert.match(features, /movable text and link overlays/i);
  assert.match(features, /setup, teardown and retry corrections into internal testing/i);
  assert.match(
    features,
    /quality still depends on the devices and network involved/i,
  );
  assert.match(features, /Public audience visibility is derived by the server/i);
  assert.match(features, /Build 27 candidate bundles 16 original GIF animations/i);
  assert.match(features, /GIFs are not available in any build today/i);
  assert.doesNotMatch(features, /GIPHY|Android session continuity|Velvet Prism/i);
  assert.doesNotMatch(features, /Build 27 (?:is|are) available/i);
  assert.match(
    features,
    /English fallback where specialist screens are still being translated/i,
  );
  assert.doesNotMatch(
    features,
    /one (?:click|prompt).*(?:camera|microphone|notification)/i,
  );
});

test("homepage spotlight features the confirmed Build 26 without claiming public rollout", async () => {
  const spotlight = await readFile(
    "src/components/sections/latest-release-spotlight.tsx",
    "utf8",
  );

  for (const label of [
    "Five Server types",
    "Hub preserved",
    "Chats & media",
    "Friends",
    "Yeels media-first",
    "Calls under test",
  ]) {
    assert.ok(spotlight.includes(label), label);
  }

  assert.match(spotlight, /mobile-build-\$\{currentRelease\.buildNumber\}-internal-testing/);
  assert.match(spotlight, /Build 26 is available through the existing Google Play Internal\s+Testing list and TestFlight internal group/i);
  assert.match(spotlight, /nextReleaseCandidateStatus/);
  assert.match(
    spotlight,
    /internal tester release, not\s+a public App Store or Google Play release/i,
  );
  assert.match(spotlight, /server backend activation remains gated/i);
  assert.match(spotlight, /Podcast\s+recording remains disabled/i);
  assert.doesNotMatch(
    spotlight,
    /matching web release is live|available to everyone|publicly available|GIPHY|Build 27 is available/i,
  );
});

test("the real Servers screenshot and product frame both preserve the Hub", async () => {
  const landing = await readFile(
    "src/components/servers/servers-landing.tsx",
    "utf8",
  );

  await access("public/screenshots/build-26/servers-desktop.jpg");
  assert.match(landing, /screenshots\/build-26\/servers-desktop\.jpg/);
  assert.match(landing, /real Hub and five choices/i);
  assert.match(landing, /familiar\s+YO Voice Hub stays in place/i);
  assert.match(landing, /Build 26 fixture-fed capture from source d1c036b7/i);
  assert.doesNotMatch(landing, /unchanged in Build 27|reused for Build 27/i);
  assert.match(landing, /no live account or server\s+connection/i);
  assert.doesNotMatch(landing, /CSS mockup|concept render/i);
});
