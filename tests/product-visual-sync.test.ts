import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

// The /updates walkthrough shows YO Voice 3.0.0 (34) desktop captures
// (2026-09-25, work items W09/W10). They replaced four Polish Build 26 frames;
// the Yeels frame was removed rather than recaptured, because the preview
// harness can only draw a placeholder still for Yeel media.
const walkthroughScreenshotPaths = [
  "public/screenshots/current/home-wide-slim.webp",
  "public/screenshots/current/chats-wide-slim.webp",
  "public/screenshots/current/friends-wide-slim.webp",
] as const;

test("the /updates walkthrough shows only labelled 3.0.0 captures", async () => {
  const experience = await readFile(
    "src/components/sections/tester-build-experience.tsx",
    "utf8",
  );

  for (const path of walkthroughScreenshotPaths) {
    await access(path);
    assert.ok(experience.includes(path.replace("public", "")), path);
  }
  // Every image the walkthrough references is one of those three.
  const referenced = [...experience.matchAll(/"(\/screenshots\/[^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    referenced.sort(),
    walkthroughScreenshotPaths.map((path) => path.replace("public", "")).sort(),
  );

  const labels = [...experience.matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(labels, ["Home", "Chats", "Friends"]);

  // Labelled with the version they were captured in, and nothing older.
  assert.match(experience, /Interface walkthrough · YO Voice 3\.0\.0/);
  assert.match(experience, /Captured in YO Voice 3\.0\.0 \(34\)/);
  assert.match(experience, /app source f71a2ae2, rendered in English by the app&apos;s preview harness on sample data/);
  assert.doesNotMatch(experience, /Build 26|d1c036b7|fixture-fed|Hub preserved|real desktop Hub|real Hub/i);
  assert.doesNotMatch(experience, /label: "Yeels"|id: "yeels"|yeels-desktop|Clapperboard|dragNote/);
  // Never a later build than the one captured.
  assert.doesNotMatch(experience, /3\.0\.0 \(35\)|3\.0\.1|3\.1\.0|GIPHY/);
  assert.doesNotMatch(experience, /Build \{currentRelease\.buildNumber\} experience/);
  assert.doesNotMatch(experience, /active users|people online/i);

  // The Build 26 frames are gone from disk, not merely unreferenced.
  for (const retired of ["home", "chats", "friends", "servers", "yeels"]) {
    await assert.rejects(() => access(`public/screenshots/build-26/${retired}-desktop.jpg`), retired);
  }
});

test("tester-build experience keeps the three surfaces keyboard accessible", async () => {
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
  // The counter follows the list, so it cannot claim a fourth surface.
  assert.match(experience, /0\{index \+ 1\} \/ 0\{surfaces\.length\}/);
});

test("Chats and Friends copy matches what the 3.0.0 frames show", async () => {
  const experience = await readFile(
    "src/components/sections/tester-build-experience.tsx",
    "utf8",
  );

  assert.match(experience, /Add friend and New message/i);
  assert.match(experience, /All, Online, Requests and Blocked/i);
  // Friends has no rail row in 3.0.0; the app keeps More lit, and the alt
  // says so instead of claiming a Friends item that does not exist.
  assert.match(experience, /the navigation rail with More selected/);
  // The pre-3.0.0 Chats claim that no frame shows any more.
  assert.doesNotMatch(experience, /call setup and recovery changes are being exercised by internal testers/i);
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
  // Servers opened to every signed-in account with Build 30 (app ADR-197).
  assert.match(features, /open to every signed-in account since Build 30/i);
  assert.match(features, /on a private Server invites stay with its admins and moderators/i);
  assert.doesNotMatch(features, /sending invites and using its voice/i);
  assert.doesNotMatch(features, /backend release gate/i);
  assert.match(features, /responsive full-screen viewer/i);
  assert.match(features, /movable text and link overlays/i);
  assert.match(features, /setup, teardown and retry corrections into internal testing/i);
  assert.match(
    features,
    /quality still depends on the devices and network involved/i,
  );
  assert.match(features, /Public audience visibility is derived by the server/i);
  // GIFs shipped in Build 30 as a first-party catalogue of sixteen originals.
  assert.match(features, /Sixteen original YO Voice GIF animations ship in the app and can be sent in private Chats since Build 30/i);
  assert.doesNotMatch(features, /not available in any build|Build 27 candidate/i);
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

test("the release spotlight on /updates features the confirmed current build without claiming public rollout", async () => {
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
  assert.match(spotlight, /Build \{currentRelease\.buildNumber\} is available through Google Play Internal\s+Testing, both TestFlight groups and the web app at app\.yovoice\.app/i);
  assert.match(spotlight, /See Build \{currentRelease\.buildNumber\} tester release/);
  assert.doesNotMatch(spotlight, /Build 2\d\b/);
  assert.match(spotlight, /nextReleaseCandidateStatus/);
  assert.match(
    spotlight,
    /internal tester release, not\s+a public App Store or Google Play release/i,
  );
  assert.match(spotlight, /Servers are open to every signed-in account/i);
  assert.match(spotlight, /Podcast\s+recording remains disabled/i);
  // Build 32's Delete account screen ships while server-side processing is
  // switched off, so the spotlight names the e-mail route instead of claiming
  // an in-app deletion.
  assert.match(
    spotlight,
    /Delete account screen that offers the e-mail route until the\s+server-side processing switches on/i,
  );
  assert.doesNotMatch(spotlight, /you can (?:now )?delete your account|processed within/i);
  assert.match(spotlight, /members of public Servers can invite friends/i);
  assert.doesNotMatch(
    spotlight,
    /matching web release is live|available to everyone|publicly available|GIPHY|Build 27 is available/i,
  );
});

test("the Servers hero shows the English 3.0.0 server picker, labelled with its source", async () => {
  const landing = await readFile(
    "src/components/servers/servers-landing.tsx",
    "utf8",
  );

  // The site is English, so its Servers frame is the English capture; the
  // Polish Build 26 frame was removed from disk on 2026-09-25.
  await access("public/screenshots/build-35/create-server-desktop.webp");
  assert.match(landing, /screenshots\/build-35\/create-server-desktop\.webp/);
  assert.doesNotMatch(landing, /screenshots\/build-26\/servers-desktop\.jpg/);
  assert.match(landing, /width=\{1440\}\s+height=\{800\}/);
  assert.match(
    landing,
    /five choices: For friends, For a community, For a podcast, For family and For a company/,
  );
  assert.match(landing, /familiar\s+YO Voice Hub stays in place/i);
  assert.match(landing, /YO Voice 3\.0\.0 capture from app commit 87a2f996/i);
  assert.match(landing, /English by the app&apos;s preview harness on sample data/i);
  assert.match(landing, /Captured in YO Voice 3\.0\.0/);
  assert.doesNotMatch(landing, /unchanged in Build 27|reused for Build 27/i);
  assert.match(landing, /no live account or server\s+connection/i);
  assert.doesNotMatch(landing, /CSS mockup|concept render/i);
});
