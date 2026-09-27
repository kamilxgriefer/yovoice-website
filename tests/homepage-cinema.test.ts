import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

/**
 * The homepage scroll cinema (owner request, 2026-09-26) is progressive
 * enhancement over a static layout. Like the rest of the suite these tests
 * read source, and they pin what docs/design/design-system.md ("Scroll
 * cinema") promises: the gate, a static twin for every scene, a scroll that
 * is never taken over, nothing that moves on its own, decoration hidden from
 * assistive technology, links that land where they point, and pictures that
 * come only from the current, documented captures.
 */

function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

/** Every source file the homepage renders, and which file imports each one. */
async function homepageTree() {
  const sources = new Map<string, string>();
  const importers = new Map<string, Set<string>>();
  const queue = ["src/app/page.tsx"];
  while (queue.length > 0) {
    const file = queue.shift()!;
    if (sources.has(file)) continue;
    let source: string;
    try {
      source = await readFile(file, "utf8");
    } catch {
      continue;
    }
    sources.set(file, source);
    for (const match of source.matchAll(/from\s+"@\/([^"]+)"/g)) {
      const base = `src/${match[1]}`;
      for (const candidate of [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`]) {
        try {
          await access(candidate);
          if (!importers.has(candidate)) importers.set(candidate, new Set());
          importers.get(candidate)!.add(file);
          queue.push(candidate);
          break;
        } catch {
          // Try the next extension.
        }
      }
    }
  }
  return { sources, importers };
}

/** Files that exist for the cinema: the shared layer and every scene's moving parts. */
const CINEMA_FILES = [
  "src/components/animations/cinema.ts",
  "src/components/animations/cinema-scroll-anchor.tsx",
  "src/components/animations/reveal.tsx",
  "src/components/animations/word-reveal.tsx",
  "src/components/animations/scroll-wave.tsx",
  "src/components/animations/scroll-progress.tsx",
  "src/components/hero/hero-scroll-depth.tsx",
  "src/components/story/app-story.tsx",
  "src/components/story/app-story-cinema.tsx",
  "src/components/story/app-story-static.tsx",
  "src/components/story/story-chapters.ts",
  "src/components/sections/welcome-intro-cinema.tsx",
  "src/components/sections/welcome-features-cinema.tsx",
  "src/components/sections/welcome-features-parts.tsx",
  "src/components/servers/servers-welcome-cinema.tsx",
  "src/components/servers/servers-welcome-parts.tsx",
  "src/components/sections/premium-identity.tsx",
  "src/components/sections/download-cinema.tsx",
  "src/components/sections/be-you-finale.tsx",
  "src/components/animations/voice-line.tsx",
  "src/components/animations/scene-opener.tsx",
  "src/components/story/story-phone-canvas.tsx",
  "src/components/story/story-phone-gl.ts",
  "src/components/story/story-pose.ts",
  "src/components/ui/magnetic-cta.tsx",
];

test("the cinema gate: reduced motion and a rem-sized window, never on the server", async () => {
  const cinema = await readFile("src/components/animations/cinema.ts", "utf8");
  // rem, so the visitor's text setting scales the thresholds.
  assert.match(
    cinema,
    /export const CINEMA_QUERY =\s*"\(prefers-reduced-motion: no-preference\) and \(min-width: 20rem\) and \(min-height: 32rem\)";/,
  );
  assert.match(cinema, /const serverSnapshot = \(\) => false;/);
  // Deferred, so arming every scene after hydration is an interruptible render.
  assert.match(cinema, /useDeferredValue\(useSyncExternalStore\(subscribe, clientSnapshot, serverSnapshot\)\)/);
  assert.match(cinema, /removeEventListener\("change", onChange\)/);
});

test("every cinema file is reached from the homepage, so the truth scans read it", async () => {
  const { sources } = await homepageTree();
  for (const file of CINEMA_FILES) {
    assert.ok(sources.has(file), `${file} is not reached from src/app/page.tsx`);
  }
});

test("scroll-driven hooks only run in components mounted behind the cinema gate", async () => {
  const { sources, importers } = await homepageTree();
  const gate = /\bcinema\s*\?|if \(!cinema\)|cinema &&/;

  // A file is behind the gate when every file that imports it either picks
  // with the gate or is itself only mounted behind it (a cinema-only layout).
  const behindGate = (file: string, seen = new Set<string>()): boolean => {
    if (seen.has(file)) return true;
    seen.add(file);
    const from = [...(importers.get(file) ?? [])];
    return (
      from.length > 0 &&
      from.every((parent) => gate.test(withoutComments(sources.get(parent)!)) || behindGate(parent, seen))
    );
  };

  for (const [file, raw] of sources) {
    if (file === "src/components/animations/cinema.ts") continue;
    const source = withoutComments(raw);
    if (!/\buse(?:Scroll|SceneProgress)\(/.test(source)) continue;
    // Either the file itself decides with useCinema(), or it is only ever
    // mounted behind the gate.
    if (/\buseCinema\(\)/.test(source)) continue;
    assert.ok(behindGate(file), `${file} measures the scroll outside the cinema gate`);
  }
});

test("every scene picks its cinema or static twin, and both keep the section's ids", async () => {
  const read = (file: string) => readFile(file, "utf8");
  const { sources } = await homepageTree();
  // A heading may be drawn by a part the layout imports.
  const withParts = (file: string) => {
    const own = sources.get(file) ?? "";
    const parts = [...own.matchAll(/from\s+"@\/([^"]+)"/g)].flatMap((match) =>
      [`src/${match[1]}.tsx`, `src/${match[1]}.ts`].map((part) => sources.get(part) ?? ""),
    );
    return withoutComments([own, ...parts].join("\n"));
  };
  const scenes = [
    {
      dispatcher: "src/components/story/app-story.tsx",
      pick: /cinema \? <AppStoryCinema \/> : <AppStoryStatic \/>/,
      twins: ["src/components/story/app-story-cinema.tsx", "src/components/story/app-story-static.tsx"],
      ids: ['id="inside"', 'aria-labelledby="inside-heading"'],
      heading: 'id="inside-heading"',
    },
    {
      dispatcher: "src/components/sections/welcome-intro.tsx",
      pick: /cinema \? \(/,
      twins: ["src/components/sections/welcome-intro-cinema.tsx", "src/components/sections/welcome-intro.tsx"],
      ids: ['id="welcome"', 'aria-labelledby="welcome-heading"'],
      heading: 'id="welcome-heading"',
    },
    {
      dispatcher: "src/components/sections/welcome-features.tsx",
      pick: /cinema \? <WelcomeFeaturesCinema\b[^>]*\/> : <WelcomeFeaturesStatic \/>/,
      twins: ["src/components/sections/welcome-features-cinema.tsx", "src/components/sections/welcome-features.tsx"],
      ids: ['id="features"', 'aria-labelledby="welcome-features-heading"'],
      heading: 'id="welcome-features-heading"',
    },
    {
      dispatcher: "src/components/servers/servers-welcome.tsx",
      pick: /cinema \? <ServersWelcomeCinema \/> : <ServersWelcomeStatic \/>/,
      twins: ["src/components/servers/servers-welcome-cinema.tsx", "src/components/servers/servers-welcome.tsx"],
      ids: ['id="servers"', 'aria-labelledby="servers-welcome-heading"'],
      heading: 'id="servers-welcome-heading"',
    },
  ];

  for (const { dispatcher, pick, twins, ids, heading } of scenes) {
    const source = await read(dispatcher);
    assert.match(source, /const cinema = useCinema\(\);/, dispatcher);
    assert.match(source, pick, `${dispatcher} picks its layout with useCinema()`);
    for (const twin of twins) {
      const body = withoutComments(await read(twin));
      for (const id of ids) assert.ok(body.includes(id), `${twin} lacks ${id}`);
      // Or hands the id to the shared opener: <SceneOpener headingId="…" />.
      const drawn = withParts(twin);
      assert.ok(
        drawn.includes(heading) || drawn.includes(`heading${heading.replace(/^id=/, "Id=")}`),
        `${twin} (or a part it imports) lacks ${heading}`,
      );
    }
  }

  // The story's chapters are reachable by their own ids in both layouts.
  for (const twin of ["src/components/story/app-story-cinema.tsx", "src/components/story/app-story-static.tsx"]) {
    assert.match(await read(twin), /inside-\$\{chapter\.screen\.id\}/, twin);
  }
});

test("the scroll is never taken over and nothing moves on its own", async () => {
  const { sources } = await homepageTree();
  const pkg = await readFile("package.json", "utf8");
  assert.doesNotMatch(
    pkg,
    /"(?:lenis|@studio-freight\/lenis|locomotive-scroll|gsap|react-scroll|smooth-scrollbar|fullpage\.js|@fullpage\/react-fullpage)"/,
  );

  for (const [file, raw] of sources) {
    const source = withoutComments(raw);
    assert.doesNotMatch(source, /scroll-snap|\bsnap-(?:x|y|both|mandatory|proximity)\b/, `${file} snaps`);
    assert.doesNotMatch(
      source,
      /addEventListener\(\s*["'](?:wheel|mousewheel|touchstart|touchmove)["']|\bon(?:Wheel|TouchMove|TouchStart)=/,
      `${file} intercepts the wheel or touch`,
    );
  }

  for (const file of CINEMA_FILES) {
    const source = withoutComments(await readFile(file, "utf8"));
    assert.doesNotMatch(source, /\bset(?:Timeout|Interval)\(/, `${file} runs a timer`);
    assert.doesNotMatch(source, /\brepeat\s*:\s*Infinity|repeatType\s*:/, `${file} loops an animation`);
  }
});

test("the giant words and the finale are decoration, hidden from assistive technology", async () => {
  const story = withoutComments(await readFile("src/components/story/app-story-cinema.tsx", "utf8"));
  // "Stop scrolling. / Start talking." is the hero's <h1>; here it is only a picture of it.
  const giant = story.indexOf("Stop scrolling.");
  assert.ok(giant > -1, "the story's giant words were found");
  const opener = story.lastIndexOf("<div", giant);
  assert.match(story.slice(opener, giant), /aria-hidden="true"/);

  const finale = withoutComments(await readFile("src/components/sections/be-you-finale.tsx", "utf8"));
  assert.match(finale, /<div ref=\{root\} aria-hidden="true"/);
  for (const file of ["src/components/animations/scroll-wave.tsx", "src/components/animations/scroll-progress.tsx"]) {
    assert.match(await readFile(file, "utf8"), /aria-hidden="true"/, file);
  }
});

test("a sentence that lights up word by word is still one sentence", async () => {
  const words = withoutComments(await readFile("src/components/animations/word-reveal.tsx", "utf8"));
  // No second, screen-reader-only copy that would also end up in a selection.
  assert.doesNotMatch(words, /sr-only/);
  assert.doesNotMatch(words, /aria-hidden/);
});

test("keyboard focus never waits for an entrance", async () => {
  const reveal = await readFile("src/components/animations/reveal.tsx", "utf8");
  assert.match(reveal, /onFocusCapture=\{\(\) => settle\.current\?\.\(\)\}/);
  assert.match(reveal, /settle\.current = toRest;/);
});

test("links and restored positions land where they point once the cinema grows the page", async () => {
  const [home, layout, anchor] = await Promise.all([
    readFile("src/app/page.tsx", "utf8"),
    readFile("src/app/layout.tsx", "utf8"),
    readFile("src/components/animations/cinema-scroll-anchor.tsx", "utf8"),
  ]);
  assert.match(home, /<CinemaScrollAnchor \/>/);
  // Next 16 only switches the page's smooth scrolling off for navigations when asked.
  assert.match(layout, /<html lang="en" data-scroll-behavior="smooth">/);
  assert.match(anchor, /window\.history\.scrollRestoration = "manual";/);
  // The position is taken as the visitor leaves: the page hidden, a link
  // followed, or Back / Forward to another page (from the last position
  // scrolled to on this page, before the next page clamps it).
  assert.match(anchor, /addEventListener\("pagehide", hide\)/);
  assert.match(anchor, /addEventListener\("popstate", travel\)/);
  assert.match(anchor, /if \(window\.location\.pathname !== home\) save\(lastY\);/);
  // A reload or back/forward arrival returns to where the visitor was, even
  // with a fragment still in the address; a fresh arrival follows the fragment.
  const land = anchor.slice(anchor.indexOf("function landing("));
  assert.ok(land.indexOf("arrivedByHistory(documentLoad)") < land.indexOf("window.location.hash"));
  // Re-landing is instant, never a smooth sweep through every scene.
  assert.match(anchor, /scrollIntoView\(\{ block: "start", behavior: "instant" \}\)/);
  assert.match(anchor, /scrollTo\(\{ top: y, behavior: "instant" \}\)/);
  assert.doesNotMatch(withoutComments(anchor), /behavior: "smooth"/);

  // The page itself only scrolls smoothly for a jump the visitor asks for on
  // it, so a fragment on load or a restored position never sweeps the scenes.
  const css = await readFile("src/app/globals.css", "utf8");
  assert.doesNotMatch(css, /html \{[^}]*scroll-behavior: smooth/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\) \{\s*html:focus-within \{ scroll-behavior: smooth; \}/);
});

test("a finale sized from what is below it never feeds back on itself", async () => {
  const finale = await readFile("src/components/sections/be-you-finale.tsx", "utf8");
  // Rounding a new word size moves the page by a pixel; only a real change is written.
  assert.match(finale, /if \(Math\.abs\(tail - written\) < 2\) return;/);
});

test("springs that follow the scroll land at once on a relocation, and only then", async () => {
  const cinema = await readFile("src/components/animations/cinema.ts", "utf8");
  assert.match(cinema, /export function useRelocationJump\(/);
  assert.match(cinema, /step > window\.innerHeight \* 1\.5/);
  for (const file of [
    "src/components/animations/cinema.ts",
    "src/components/animations/scroll-progress.tsx",
    "src/components/hero/hero-scroll-depth.tsx",
    "src/components/sections/be-you-finale.tsx",
    "src/components/servers/servers-welcome-cinema.tsx",
  ]) {
    assert.match(await readFile(file, "utf8"), /useRelocationJump\(/, file);
  }
});

test("in forced colours the scenes leave their decorative shades out", async () => {
  for (const file of [
    "src/components/story/app-story.module.css",
    "src/components/sections/welcome-features-cinema.module.css",
    "src/components/servers/servers-welcome-cinema.module.css",
  ]) {
    assert.match(await readFile(file, "utf8"), /@media \(forced-colors: active\)/, file);
  }
});

test("the story and What you get show only current captures, honestly framed", async () => {
  const read = (file: string) => readFile(file, "utf8");

  // The story's pictures and labels come from the hero's list: one set of captures.
  const chapters = await read("src/components/story/story-chapters.ts");
  assert.match(chapters, /import \{ appScreens \} from "@\/components\/hero\/app-screen-rotator";/);
  assert.doesNotMatch(chapters, /\/screenshots\//);
  for (const file of ["src/components/story/app-story-cinema.tsx", "src/components/story/app-story-static.tsx"]) {
    assert.doesNotMatch(await read(file), /\/screenshots\//, file);
  }

  const parts = await read("src/components/sections/welcome-features-parts.tsx");
  const wide = [...parts.matchAll(/"(\/screenshots\/[^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(wide, [
    "/screenshots/current/home-wide-slim.webp",
    "/screenshots/current/chats-wide-slim.webp",
    "/screenshots/current/friends-wide-slim.webp",
  ]);
  for (const asset of wide) await access(`public${asset}`);

  // The frames are sample-content renders: the drawn window claims no live
  // address or lock, and the note above them says so.
  assert.match(parts, /export const SCREEN_NOTE =\s*"[^"]*\bsample content\b[^"]*";/);
  assert.doesNotMatch(withoutComments(parts), /app\.yovoice\.app|<Lock\b/);

  // The provenance file says where each of them is used on the homepage.
  const provenance = await read("docs/design/current-screenshots.md");
  for (const name of ["home-wide-slim.webp", "chats-wide-slim.webp", "friends-wide-slim.webp"]) {
    assert.match(provenance, new RegExp(`\\| \`${name.replace(".", "\\.")}\` \\|[^|\\n]*What you get`), name);
  }
  for (const id of ["home", "servers", "chats", "moments"]) {
    assert.match(provenance, new RegExp(`\\| \`${id}-phone-slim\\.webp\` \\|[^|\\n]*Inside YO Voice`), id);
  }
});

test("the hero arrow names the section it leads to", async () => {
  const hero = await readFile("src/components/hero/hero-section.tsx", "utf8");
  assert.match(hero, /href="#inside"[\s\S]*?aria-label="Scroll to Inside YO Voice"/);
});

test("the design system documents the cinema as an owner-approved exception", async () => {
  const doc = await readFile("docs/design/design-system.md", "utf8");
  assert.match(doc, /^## Scroll cinema \(homepage\)$/m);
  assert.match(doc, /Motion \(framer-motion\) is reserved for[^.]*homepage scroll cinema/);
});

test("every section opens the same way, and the static layout keeps the plain title", async () => {
  const opener = await readFile("src/components/animations/scene-opener.tsx", "utf8");
  // Words are split only while their entrance waits or runs; before and
  // after it the title is one run of text (and the space before the accent
  // stays inside it, where Chrome's accessibility tree keeps it).
  assert.match(opener, /\{cue \? splitWords\(accent \? `\$\{title\} ` : title, "t"\) : accent \? `\$\{title\} ` : title\}/);
  assert.match(opener, /\{cinema \? <OpenerSettle target=\{root\} into=\{settleY\} \/> : null\}/);
  assert.match(opener, /cinema && size !== "section" \? \(size === "scene" \? "title-scene" : "title-column"\) : "section-title"/);
  // A jump or restored position draws it in place, judged by when the
  // intersection was seen, and a landing draws it before the next paint;
  // focus draws it at rest.
  assert.match(opener, /if \(justRelocated\(entry\.time\)\) finish\(\);\s*else play\(\);/);
  assert.match(opener, /onRelocation\(/);
  assert.match(opener, /onFocusCapture=\{\(\) => settle\.current\?\.\(\)\}/);

  for (const file of [
    "src/components/story/app-story-static.tsx",
    "src/components/story/app-story-cinema.tsx",
    "src/components/sections/welcome-intro.tsx",
    "src/components/sections/welcome-features.tsx",
    "src/components/servers/servers-welcome.tsx",
    "src/components/sections/welcome-intro-cinema.tsx",
    "src/components/sections/welcome-features-cinema.tsx",
    "src/components/servers/servers-welcome-sheet.tsx",
    "src/components/sections/premium-section.tsx",
    "src/components/sections/download-section.tsx",
  ]) {
    assert.match(await readFile(file, "utf8"), /<SceneOpener\b/, `${file} opens with the shared SceneOpener`);
  }

  // The frame and the opener anatomy live in one place.
  const css = await readFile("src/app/globals.css", "utf8");
  assert.match(css, /--frame: 1240px;/);
  assert.match(css, /--edge: max\(var\(--gutter\), calc\(\(100% - var\(--frame\)\) \/ 2\)\);/);
  assert.match(css, /\.opener-rule \{ forced-color-adjust: none; background: CanvasText; \}/);
});

test("the 3D phone is an enhancement over the CSS phone, never a requirement", async () => {
  const canvas = await readFile("src/components/story/story-phone-canvas.tsx", "utf8");
  // Loaded only when needed, refused on software rendering, and aria-hidden.
  assert.match(canvas, /import\(/);
  assert.match(canvas, /failIfMajorPerformanceCaveat/);
  assert.match(canvas, /aria-hidden="true"/);
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.ok(pkg.dependencies.ogl, "ogl is the one 3D dependency");
  assert.ok(!pkg.dependencies.three && !pkg.dependencies["@react-three/fiber"], "no three.js");
});

test("primary actions lean toward the pointer without adding a Tab stop", async () => {
  const cta = await readFile("src/components/ui/magnetic-cta.tsx", "utf8");
  assert.match(cta, /tabIndex=\{-1\}/);
  assert.match(cta, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(cta, /useReducedMotion\(\)/);
});

test("a layout change keeps the visitor's place, and every page jump is a relocation", async () => {
  const [anchor, cinema] = await Promise.all([
    readFile("src/components/animations/cinema-scroll-anchor.tsx", "utf8"),
    readFile("src/components/animations/cinema.ts", "utf8"),
  ]);
  // The landings go through `relocate`, so scenes draw in place whatever the distance.
  assert.match(cinema, /export function relocate\(jump: \(\) => void\)/);
  assert.match(cinema, /export function onRelocation\(listener: \(\) => void\)/);
  assert.match(anchor, /relocate\(land\)/);
  // The cinema switching mid-visit (or its first arming after a scroll) puts
  // the visitor back in the same section, the same distance in; so does a
  // new width, before the cinema can switch.
  assert.match(anchor, /if \(rendered\.current !== null && rendered\.current !== cinema\) pending\.current = place\.current;/);
  assert.match(anchor, /addEventListener\("resize", reflow\)/);
  assert.match(anchor, /#main-content > section, body footer/);
});

test("the giant words' lean ignores jumps and comes to rest", async () => {
  const cinema = await readFile("src/components/animations/cinema.ts", "utf8");
  const lean = cinema.slice(cinema.indexOf("export function useScrollLean("));
  assert.match(lean, /justRelocated\(\) \? 0 : speed/);
  assert.match(lean, /onRelocation\(\(\) => eased\.jump\(0\)\)/);
  assert.match(lean, /restDelta: 5, restSpeed: 50/);
});

test("a primary action's lift and lean add up, and its ring grows evenly", async () => {
  const cta = await readFile("src/components/ui/magnetic-cta.tsx", "utf8");
  assert.match(cta, /useTransform\(\(\) => springY\.get\(\) \+ lift\.get\(\)\)/);
  assert.doesNotMatch(cta, /whileHover/);
  assert.match(cta, /outlineOffset: \["0px", "10px"\]/);
});

test("the documented motion tokens are the ones the code uses", async () => {
  const [motion, doc] = await Promise.all([
    readFile("src/components/animations/motion.ts", "utf8"),
    readFile("docs/design/design-system.md", "utf8"),
  ]);
  // Server-safe, so server components read plain numbers.
  assert.doesNotMatch(motion, /^"use client";/m);
  for (const [name, unit] of [["DUR", " s"], ["STAGGER", " s"], ["RISE", " px"]] as const) {
    const body = new RegExp(`export const ${name} = \\{([^}]*)\\}`).exec(motion)?.[1];
    assert.ok(body, `${name} is exported from motion.ts`);
    const pairs = [...body.matchAll(/(\w+): ([\d.]+)/g)].map(([, key, value]) => `${key} ${value.replace(/^0\./, ".")}`);
    const documented = new RegExp(`\`${name}\` \\(([^)]*)\\)`).exec(doc.replace(/\s+/g, " "))?.[1];
    assert.ok(documented, `${name} is documented`);
    assert.equal(documented, `${pairs.join(", ")}${unit}`, `${name} in the doc matches motion.ts`);
  }
});
