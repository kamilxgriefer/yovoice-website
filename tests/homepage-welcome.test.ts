import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

/**
 * The homepage is a welcome, and the rotating hero at the top of it has to be
 * operable by someone who cannot or does not want to watch things move.
 *
 * These tests read source rather than a rendered page because the suite runs
 * without a DOM. They are written to fail on the two regressions that the
 * owner actually reported on 2026-09-16: a homepage that describes a patch
 * instead of welcoming, and a hero that lost its self-advancing tabs.
 */

const ROTATOR = "src/components/hero/hero-prompt-rotator.tsx";
// The hero's one clock (owner decision W27, 2026-09-25): the welcome sentence
// and the phone frames read the same step and share one Pause control.
const TOUR = "src/components/hero/hero-tour.tsx";

function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

/**
 * Every component file the homepage renders, found by following local `@/`
 * imports out of `src/app/page.tsx`. Data modules under `src/content` and
 * `src/config` are walked through but not scanned: they legitimately hold the
 * exact build numbers that /updates and /download render. What matters for
 * the homepage is that no component *reaches into* them for one, which the
 * identifier assertion below checks directly.
 */
async function homepageComponentSources(): Promise<Map<string, string>> {
  const seen = new Map<string, string>();
  const queue = ["src/app/page.tsx"];

  while (queue.length > 0) {
    const file = queue.shift()!;
    if (seen.has(file)) continue;

    let source: string;
    try {
      source = await readFile(file, "utf8");
    } catch {
      continue;
    }
    seen.set(file, source);

    for (const match of source.matchAll(/from\s+"@\/([^"]+)"/g)) {
      const base = `src/${match[1]}`;
      for (const candidate of [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`]) {
        try {
          await readFile(candidate, "utf8");
          queue.push(candidate);
          break;
        } catch {
          // Try the next extension.
        }
      }
    }
  }

  const components = new Map<string, string>();
  for (const [file, source] of seen) {
    if (file === "src/app/page.tsx" || file.startsWith("src/components/")) {
      components.set(file, source);
    }
  }
  return components;
}

test("the homepage tree is discovered through real imports, not a hand-written list", async () => {
  const components = await homepageComponentSources();
  // A resolver that silently found nothing would make every scan below pass.
  assert.ok(components.size > 8, `only ${components.size} homepage components found`);
  for (const expected of [
    "src/app/page.tsx",
    "src/components/hero/hero-section.tsx",
    "src/components/hero/hero-prompt-rotator.tsx",
    "src/components/sections/welcome-intro.tsx",
    "src/components/sections/welcome-features.tsx",
    "src/components/servers/servers-welcome.tsx",
    "src/components/sections/download-section.tsx",
  ]) {
    assert.ok(components.has(expected), expected);
  }
});

test("the homepage names no build number", async () => {
  const components = await homepageComponentSources();

  for (const [file, raw] of components) {
    const source = withoutComments(raw);
    assert.doesNotMatch(source, /\bBuilds?\s+\d+/i, `${file} renders a build number`);
    assert.doesNotMatch(source, /\b\d+\.\d+\.\d+\s*\(\d+\)/, `${file} renders a build version`);

    // The same number can arrive through a constant, so the identifiers that
    // carry one are barred from the welcome as well. `currentReleaseAvailability`
    // is deliberately still allowed: it states who can install today and names
    // no build.
    for (const identifier of [
      "currentRelease.version",
      "currentRelease.buildNumber",
      "currentRelease.stage",
      "nextReleaseCandidate",
      "nextReleaseCandidateStatus",
      "serverLaunchPolicy.stage",
    ]) {
      assert.ok(
        !source.includes(identifier),
        `${file} pulls a build number in through ${identifier}`,
      );
    }
  }
});

test("the homepage welcomes instead of describing what changed", async () => {
  const components = await homepageComponentSources();

  // Release-note framing. "What changed" is the owner's own phrase for what a
  // homepage must not do; the rest are the ways the same idea usually returns.
  const releaseNotes =
    /what(?:'s| ha[sv]| is)? (?:changed|new)|release notes|changelog|what we (?:shipped|fixed)|this (?:build|release) (?:adds|brings|includes|fixes)|newly (?:added|released)/i;

  for (const [file, raw] of components) {
    const source = withoutComments(raw);
    assert.doesNotMatch(source, releaseNotes, `${file} reads as release notes`);
  }
});

test("the homepage does not present the retired Rooms and Clubs as current product", async () => {
  const components = await homepageComponentSources();

  // Capitalised, so ordinary English ("more room for your voice") is untouched
  // and only the retired product names are caught.
  const retired = /\b(?:Clubs?|Rooms?|Community Room|Family Room|Podcast Room)\b/;

  for (const [file, raw] of components) {
    const source = withoutComments(raw);
    assert.doesNotMatch(source, retired, `${file} still sells Rooms or Clubs`);
  }
});

test("the homepage does not invite the public into the closed tester programme", async () => {
  const components = await homepageComponentSources();

  // /download has no enrolment path: every action it offers is "See the
  // <version> release", "Launch web app" or "Source on GitHub", and it states
  // availability as "our existing internal testers". A homepage CTA
  // that invites a visitor to join testing therefore points at a door that
  // does not exist.
  const enrolment =
    /join (?:the |our )?(?:testers|testing|beta|programme|program)|become a tester|sign up (?:for|to) (?:the )?(?:beta|testing)|apply to (?:test|join)|request (?:beta |tester )?access/i;

  for (const [file, raw] of components) {
    const source = withoutComments(raw);
    assert.doesNotMatch(source, enrolment, `${file} invites the public into closed testing`);
  }
});

test("the hero's in-page links point at sections the homepage actually renders", async () => {
  const [home, hero] = await Promise.all([
    readFile("src/app/page.tsx", "utf8"),
    readFile("src/components/hero/hero-section.tsx", "utf8"),
  ]);
  const components = await homepageComponentSources();

  const ids = new Set<string>();
  for (const source of components.values()) {
    for (const match of source.matchAll(/\bid="([^"]+)"/g)) ids.add(match[1]);
  }

  const anchors = [...hero.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  assert.ok(anchors.length > 0, "the hero still has in-page links");
  for (const anchor of anchors) {
    assert.ok(ids.has(anchor), `the hero links to #${anchor}, which nothing renders`);
  }

  // The welcome order the owner asked for: hero, what YO Voice is, features,
  // Servers as a welcome, then the way in.
  const order = [
    "<HeroSection />",
    "<WelcomeIntro />",
    "<WelcomeFeatures />",
    "<ServersWelcome />",
    "<DownloadSection />",
  ];
  let cursor = -1;
  for (const element of order) {
    const at = home.indexOf(element);
    assert.ok(at > cursor, `${element} is missing or out of order on the homepage`);
    cursor = at;
  }
});

test("the hero keeps self-advancing tabs, which is what the owner asked to have back", async () => {
  const tour = await readFile(TOUR, "utf8");

  // A real interval, not a static list: the tabs change by themselves.
  assert.match(tour, /window\.setInterval\(/);
  assert.match(tour, /ROTATION_INTERVAL_MS/);
  assert.match(tour, /const ROTATION_INTERVAL_MS = \d+;/);
  assert.match(tour, /setActiveIndex\(\(current\) => \(current \+ 1\) % heroPrompts\.length\)/);
  // And it is cleaned up, so a remount cannot leave two timers running.
  assert.match(tour, /return \(\) => window\.clearInterval\(timer\);/);
});

test("W27: one clock and one Pause control drive both hero carousels", async () => {
  const [tour, prompts, screens, hero] = await Promise.all([
    readFile(TOUR, "utf8"),
    readFile(ROTATOR, "utf8"),
    readFile("src/components/hero/app-screen-rotator.tsx", "utf8"),
    readFile("src/components/hero/hero-section.tsx", "utf8"),
  ]);

  // Exactly one timer in the hero, and it lives in the tour.
  assert.equal((tour.match(/window\.setInterval\(/g) ?? []).length, 1);
  for (const carousel of [prompts, screens]) {
    assert.doesNotMatch(carousel, /setInterval|ROTATION_INTERVAL_MS|useState\(/);
    assert.match(carousel, /useHeroTour\(\)/);
  }
  // Both carousels sit inside the one provider.
  const open = hero.indexOf("<HeroTourProvider>");
  const close = hero.indexOf("</HeroTourProvider>");
  assert.ok(open > -1 && close > open, "the hero wraps its carousels in HeroTourProvider");
  for (const element of ["<HeroPromptRotator />", "<AppScreenRotator />"]) {
    const at = hero.indexOf(element);
    assert.ok(at > open && at < close, `${element} is inside the tour`);
  }

  // One Pause control on the page, and it names what it stops.
  assert.match(prompts, /aria-label=\{paused \? "Play the welcome tour" : "Pause the welcome tour"\}/);
  assert.doesNotMatch(withoutComments(screens), /\bPause\b|\bPlay\b|setPaused|togglePaused/);
  assert.doesNotMatch(prompts, /Pause welcome messages|Pause the app screen tour/);

  // The phone shows the screen the sentence names: the tour derives the
  // screen from the prompt, and the rotator renders that screen.
  assert.match(tour, /screenId: heroPrompts\[activeIndex\]\.screen/);
  assert.match(screens, /appScreens\.find\(\(screen\) => screen\.id === screenId\)/);
});

test("WCAG 2.2.2: the rotation stops for reduced motion, hover, focus and a visible control", async () => {
  const [tour, rotator] = await Promise.all([readFile(TOUR, "utf8"), readFile(ROTATOR, "utf8")]);

  // prefers-reduced-motion: no auto-rotation at all.
  assert.match(tour, /useReducedMotion/);
  // Hydration-safe: the preference only takes effect after mount (server and client first render agree).
  assert.match(tour, /const prefersReducedMotion = useReducedMotion\(\);/);
  assert.match(tour, /const hydrated = useSyncExternalStore\(subscribeToNothing, \(\) => true, \(\) => false\);/);
  assert.match(tour, /const reduceMotion = hydrated && prefersReducedMotion === true;/);
  assert.match(
    tour,
    /const autoRotationPaused =\s*paused \|\| interactionPaused \|\| reduceMotion === true;/,
  );
  // The effect is the only thing that advances the prompt, and it refuses to
  // start while paused — and it re-runs when that changes.
  assert.match(tour, /if \(autoRotationPaused\) return;/);
  assert.match(tour, /\}, \[autoRotationPaused\]\);/);

  // Pause on hover, and on keyboard focus entering the control group. Each
  // zone holds its own reason, so the pointer leaving the sentence cannot
  // release a pause that keyboard focus on the controls still holds.
  assert.match(rotator, /onMouseEnter=\{\(\) => setInteractionPaused\("hoverPrompt", true\)\}/);
  assert.match(rotator, /onMouseLeave=\{\(\) => setInteractionPaused\("hoverPrompt", false\)\}/);
  assert.match(rotator, /onMouseEnter=\{\(\) => setInteractionPaused\("hoverPromptControls", true\)\}/);
  assert.match(rotator, /onMouseLeave=\{\(\) => setInteractionPaused\("hoverPromptControls", false\)\}/);
  assert.match(rotator, /onFocusCapture=\{\(\) => setInteractionPaused\("focusPromptControls", true\)\}/);
  assert.match(rotator, /onBlurCapture=/);
  // Focus must only be released when it leaves the group entirely, otherwise
  // tabbing between the controls would restart the rotation under the user.
  assert.match(
    rotator,
    /if \(!event\.currentTarget\.contains\(event\.relatedTarget\)\) \{\s*setInteractionPaused\("focusPromptControls", false\);/,
  );
  // The tour pauses while any reason is held, never on one shared flag.
  assert.match(tour, /const \[pauseReasons, setPauseReasons\] = useState<ReadonlySet<PauseReason>>/);
  assert.match(tour, /const interactionPaused = pauseReasons\.size > 0;/);
  assert.doesNotMatch(tour, /const \[interactionPaused, setInteractionPaused\] = useState/);
  assert.doesNotMatch(rotator, /setInteractionPaused\((?:true|false)\)/);

  // A visible, labelled pause/resume control that stops the rotation for
  // good, and whose Play resumes it at once: it releases every hover and
  // focus hold, including focus on the button itself.
  assert.match(tour, /togglePaused: \(\) => \{\s*const next = !paused;\s*setPaused\(next\);/);
  assert.match(tour, /if \(!next\) setPauseReasons\(new Set\(\)\);/);
  assert.match(rotator, /onClick=\{togglePaused\}/);
  assert.match(rotator, /aria-label=\{paused \? "Play the welcome tour" : "Pause the welcome tour"\}/);
  assert.match(rotator, /\{paused \? "Play" : "Pause"\}/);

  // Manual selection is keyboard-operable at a 44px target with a visible ring.
  assert.match(rotator, /aria-label="Show previous welcome message"/);
  assert.match(rotator, /aria-label="Show next welcome message"/);
  assert.match(rotator, /focus-ring/);
  assert.match(rotator, /size-11/);
  assert.match(rotator, /min-h-11/);
});

test("the rotating sentence is announced once, not re-read on every rotation", async () => {
  const rotator = await readFile(ROTATOR, "utf8");

  // The moving text is decorative; a stable summary carries the meaning.
  assert.match(rotator, /<span className="sr-only">/);
  assert.match(rotator, /aria-hidden="true"\n?\s*initial=/);
  assert.doesNotMatch(rotator, /aria-live/);
});

test("the hero's rotating copy is true today", async () => {
  const tour = await readFile(TOUR, "utf8");
  const prompts = withoutComments(tour).slice(
    withoutComments(tour).indexOf("export const heroPrompts"),
  );
  const block = prompts.slice(0, prompts.indexOf("] as const;"));

  assert.ok(block.length > 100, "the prompt list was found");
  // Current product names only.
  assert.doesNotMatch(block, /\b(?:Clubs?|Rooms?)\b/);
  assert.doesNotMatch(block, /\bBuilds?\s+\d+/i);
  for (const name of ["Server", "Chats", "Voice Moments", "Yeels"]) {
    assert.ok(block.includes(name), `the welcome never mentions ${name}`);
  }
  // The counter in the control group is rendered from the list length, so the
  // list has to stay long enough to be worth rotating.
  const lines = block.split("\n").filter((line) => line.trim().startsWith('text: "'));
  assert.ok(lines.length >= 5);
  // Every line names the captured screen that shows what it describes, and
  // every captured screen has at least one line, so choosing it by hand has
  // a sentence to show.
  const screens = [...block.matchAll(/screen: "([a-z]+)"/g)].map((m) => m[1]);
  assert.equal(screens.length, lines.length);
  for (const id of ["home", "servers", "chats", "moments"]) {
    assert.ok(screens.includes(id), `no welcome line stands beside the ${id} screen`);
  }
  assert.deepEqual([...new Set(screens)].sort(), ["chats", "home", "moments", "servers"]);
});

// ---------------------------------------------------------------------------
// The hero's device frames.
//
// The owner's 2026-09-17 report was about a picture, not prose: the phone in
// the hero showed an interface the app no longer has — an "Open conversation"
// card and a dock with a big centre logo and no Servers destination. The fix
// was to stop drawing the app and start showing it, so these tests pin the
// two properties that made the old picture wrong: it was hand-drawn, and it
// had drifted. A capture cannot drift, and a capture that is missing from
// disk fails here rather than in production.
// ---------------------------------------------------------------------------

const ROTATOR_SCREENS = "src/components/hero/app-screen-rotator.tsx";

test("the hero shows real captures, and the hand-drawn app mockup is gone", async () => {
  const components = await homepageComponentSources();
  assert.ok(components.has(ROTATOR_SCREENS), "the hero renders the screen rotator");

  // The illustration that drifted is not merely unused — it is deleted, so it
  // cannot be imported back by accident.
  await assert.rejects(() =>
    readFile("src/components/hero/app-experience-preview.tsx", "utf8"),
  );

  const rotator = components.get(ROTATOR_SCREENS)!;
  // No centre-logo dock, and no card offering a conversation to "join".
  assert.doesNotMatch(rotator, /yo-voice-symbol/);
  assert.doesNotMatch(rotator, /Open conversation|People here/);
});

test("the hero references only current captures, and every one of them exists", async () => {
  const components = await homepageComponentSources();

  const referenced = new Set<string>();
  for (const [file, source] of components) {
    for (const match of source.matchAll(/["'](\/screenshots\/[^"']+)["']/g)) {
      const asset = match[1];
      // Build-numbered capture folders are the release ledger's, not the
      // welcome's: they are labelled with the build they came from.
      assert.ok(
        asset.startsWith("/screenshots/current/"),
        `${file} shows ${asset}, which is not a current capture`,
      );
      referenced.add(asset);
    }
  }

  assert.ok(referenced.size >= 5, `only ${referenced.size} captures referenced`);
  for (const asset of referenced) {
    await access(`public${asset}`);
  }
});

test("the rotating tabs are the app's own destinations, with Servers among them", async () => {
  const rotator = await readFile(ROTATOR_SCREENS, "utf8");

  const labels = [...rotator.matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(labels, ["Home", "Servers", "Chats", "Moments"]);

  // Each tab names the phone capture it shows, so the top of the page cannot
  // claim a screen it has no picture of.
  const ids = [...rotator.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ["home", "servers", "chats", "moments"]);
  // The 3.0.0 recapture (2026-09-25) is published under "-slim" names:
  // Next's image optimizer keys its cache on the href, so a new picture at
  // an old path would keep serving the old transform.
  for (const id of ids) {
    assert.ok(rotator.includes(`/screenshots/current/${id}-phone-slim.webp`), `${id} phone`);
  }

  // Only Home exists as a large-screen capture, so the large-screen frame is
  // fixed rather than switching with the tabs. A per-tab desktop image would
  // have to invent three screens nobody photographed, and this assertion is
  // what stops that from being reintroduced quietly.
  const desktopRefs = [...rotator.matchAll(/\/screenshots\/current\/([a-z]+)-desktop(?:-slim)?\.webp/g)]
    .map((m) => m[1]);
  assert.deepEqual(desktopRefs, ["home"]);
  assert.doesNotMatch(rotator, /active\.desktop/);
});

test("the device frames advance with the hero's one clock", async () => {
  const [rotator, tour] = await Promise.all([
    readFile(ROTATOR_SCREENS, "utf8"),
    readFile(TOUR, "utf8"),
  ]);

  // The frames have no timer of their own any more: they follow the tour,
  // whose single interval is pinned (and cleaned up) above.
  assert.doesNotMatch(rotator, /setInterval/);
  assert.match(rotator, /const \{ screenId, reduceMotion, selectScreen, setInteractionPaused \} = useHeroTour\(\);/);
  assert.match(tour, /return \(\) => window\.clearInterval\(timer\);/);
});

test("WCAG 2.2.2: the device frames stop for reduced motion, hover, focus and by hand", async () => {
  const [rotator, tour] = await Promise.all([
    readFile(ROTATOR_SCREENS, "utf8"),
    readFile(TOUR, "utf8"),
  ]);

  // Reduced motion, hydration safety and the paused gate are the tour's, and
  // pinned in the prompt test above; the frames only read reduceMotion.
  assert.match(rotator, /initial=\{reduceMotion \? false :/);

  // Hover and keyboard focus pause the whole tour, and focus is only
  // released when it leaves the frames entirely.
  assert.match(rotator, /onMouseEnter=\{\(\) => setInteractionPaused\("hoverScreens", true\)\}/);
  assert.match(rotator, /onMouseLeave=\{\(\) => setInteractionPaused\("hoverScreens", false\)\}/);
  assert.match(rotator, /onFocusCapture=\{\(\) => setInteractionPaused\("focusScreens", true\)\}/);
  assert.match(
    rotator,
    /if \(!event\.currentTarget\.contains\(event\.relatedTarget\)\) \{\s*setInteractionPaused\("focusScreens", false\);/,
  );
  assert.doesNotMatch(rotator, /setInteractionPaused\((?:true|false)\)/);

  // Choosing a tab by hand is a deliberate stop, not a pause that resumes.
  assert.match(rotator, /onClick=\{\(\) => selectScreen\(screen\.id\)\}/);
  assert.match(tour, /selectScreen: \(id\) => \{[\s\S]*?setPaused\(true\);/);

  // Every control is a 44px keyboard target with a visible ring.
  assert.match(rotator, /focus-ring/);
  assert.match(rotator, /min-h-11/);
});

test("the moving frames are not announced on every rotation", async () => {
  const rotator = await readFile(ROTATOR_SCREENS, "utf8");

  // One stable description of the visible screen, and no live region that
  // would interrupt a screen reader every few seconds.
  assert.doesNotMatch(rotator, /aria-live="(?:polite|assertive)"/);
  assert.match(rotator, /aria-live="off"/);
  // The description belongs on the image, so a screen reader can actually
  // reach it: an <Image alt=""> inside a named group is pruned from the
  // accessibility tree, which left the four hero captures exposing no image
  // node at all. The group keeps only the screen's name.
  assert.match(rotator, /alt=\{active\.alt\}/);
  assert.match(rotator, /aria-label=\{active\.label\}/);
  assert.doesNotMatch(rotator, /aria-label=\{`\$\{active\.label\}: \$\{active\.alt\}`\}/);
});

test("the hero controls keep their own type size through the button reset", async () => {
  const rotator = await readFile(ROTATOR_SCREENS, "utf8");

  // globals.css resets buttons with an unlayered `button { font: inherit }`,
  // which outranks Tailwind v4's @layer utilities. Type utilities written
  // straight on a <button> lose, and the tab row computed 16px/400 instead of
  // 11px/700 — enough to push it onto two rows on a phone and to strip the
  // weight that marks the selected tab. The labels therefore sit on a child
  // element, which the reset does not match.
  // Sizes are in rem so the labels follow a visitor's larger default font
  // size, as the headline beside them does (0.6875rem is 11px at 16px).
  assert.match(rotator, /const CONTROL_LABEL = "text-\[0\.6875rem\] font-bold[^"]*";/);
  assert.match(rotator, /<span className=\{CONTROL_LABEL\}>\{screen\.label\}<\/span>/);
  // The tour's one Pause lives in the welcome row; its label is on a span too.
  const prompts = await readFile(ROTATOR, "utf8");
  assert.match(prompts, /<span className="text-\[0\.6875rem\] font-bold leading-none">\{paused \? "Play" : "Pause"\}<\/span>/);
  // No hero-tour text is fixed in px, where it would ignore that setting.
  for (const source of [rotator, prompts]) {
    assert.doesNotMatch(withoutComments(source), /\btext-\[\d+px\]/);
  }

  // And no type utility is left on the buttons themselves, where it would be
  // silently discarded and read as if it were doing something.
  const buttonClasses = [
    ...(rotator.match(/className=[{"`]{1,2}[^"`{}]*focus-ring[^"`{}]*/g) ?? []),
    ...(prompts.match(/className=[{"`]{1,2}[^"`{}]*focus-ring[^"`{}]*/g) ?? []),
  ];
  assert.ok(buttonClasses.length >= 4, "the hero's controls were found");
  for (const cls of buttonClasses) {
    assert.doesNotMatch(cls, /text-\[\d+px\]/);
    assert.doesNotMatch(cls, /font-(?:bold|semibold|black|medium)/);
  }
});

test("the hero CTAs are one Tab stop each, not an unnamed wrapper and a link", async () => {
  const cta = await readFile("src/components/hero/hero-cta.tsx", "utf8");
  // framer-motion gives a non-focusable element with whileTap tabindex="0"
  // unless it already has one, so every whileTap wrapper opts out of the
  // Tab order and the Link inside stays the only stop.
  const wrappers = cta.match(/<motion\.div[\s\S]*?>/g) ?? [];
  assert.equal(wrappers.length, 2);
  for (const wrapper of wrappers) {
    assert.match(wrapper, /whileTap=/);
    assert.match(wrapper, /tabIndex=\{-1\}/);
  }
});
