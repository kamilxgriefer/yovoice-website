import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

import { nextTemplateIndex, serverLaunchPolicy, serverTemplates } from "../src/content/server-templates.ts";

test("server concepts preserve approved order, ownership allowance and release boundary", () => {
  assert.deepEqual(serverTemplates.map(({ id }) => id), ["friends", "community", "podcast", "family", "company"]);
  assert.deepEqual(serverLaunchPolicy, {
    stage: "Internal testing · open to every signed-in account",
    backendStage: "Open to every signed-in account",
    freeOwnedServers: 5,
    premiumOwnedServers: 30,
    unlimitedServerJoins: true,
    familyOwnerLimit: 1,
    preservesExistingEntitlements: true,
  });
  for (const template of serverTemplates) {
    assert.equal(template.channels.length, 3);
    assert.equal(template.tools.length, 3);
    assert.ok(template.scene && template.description && template.privacy);
  }
  for (const id of ["friends", "family", "company"]) {
    assert.match(serverTemplates.find((template) => template.id === id)!.privacy, /Invite-only/);
  }
  const podcast = serverTemplates.find((template) => template.id === "podcast");
  assert.ok(podcast);
  assert.match(podcast.tools.join(" "), /recording disabled/i);
  assert.match(podcast.scene, /Recording is disabled/i);
});

test("starter channels are real seeded channels from the app's server templates", () => {
  // English seed labels from the app's functions/servers/templates.js
  // (commit e8f0e0ce). The website may show a subset, never invented names.
  const seeded: Record<string, string[]> = {
    friends: ["general", "memes", "Lounge", "Gaming", "Events", "Rules"],
    community: ["Announcements", "Rules", "general", "Questions", "Lounge", "LIVE Stage", "Events"],
    podcast: ["LIVE Studio", "Episodes", "Program", "discussion", "Questions", "Announcements", "Rules"],
    family: ["family", "Lounge", "Calendar", "Memories", "Shopping list"],
    company: ["general", "Announcements", "team", "projects", "HR", "Management", "Meetings", "Whiteboard", "Files"],
  };
  for (const template of serverTemplates) {
    for (const channel of template.channels) {
      const label = channel.replace(/ · restricted$/, "");
      assert.ok(seeded[template.id].includes(label), `${template.id}: ${channel}`);
    }
    assert.ok(seeded[template.id].includes(template.channel), `${template.id}: ${template.channel}`);
  }
});

test("preview keyboard navigation wraps in both directions and supports Home and End", () => {
  for (let index = 0; index < serverTemplates.length; index += 1) {
    assert.equal(nextTemplateIndex(index, "ArrowRight"), (index + 1) % 5);
    assert.equal(nextTemplateIndex(index, "ArrowLeft"), (index + 4) % 5);
    assert.equal(nextTemplateIndex(index, "Home"), 0);
    assert.equal(nextTemplateIndex(index, "End"), 4);
    assert.equal(nextTemplateIndex(index, "Tab"), index);
    assert.equal(nextTemplateIndex(index, "Escape"), index);
  }
});

test("real tabs link to panels and preserve focus without creating server actions", async () => {
  const source = await readFile("src/components/servers/server-explorer.tsx", "utf8");
  for (const expected of ['role="tablist"', 'role="tab"', 'role="tabpanel"', "aria-controls=", "aria-labelledby=", "aria-selected=", "tabIndex={selectedIndex === index ? 0 : -1}", "buttons.current[next]?.focus()", "hidden={index !== selectedIndex}"]) {
    assert.ok(source.includes(expected), expected);
  }
  // Servers have been open to every signed-in account since 2026-09-16 (app
  // ADR-197); only Podcast recording is still off.
  assert.match(source, /every signed-in account can create, join and use a Server/i);
  assert.match(source, /Podcast\s+recording remains disabled/i);
  assert.match(source, /The tools listed are product direction/i);
  assert.doesNotMatch(source, /Build 26 tester app|stay gated|does not mean server creation/i);
  assert.doesNotMatch(source, /firebase|httpsCallable|getUserMedia|setInterval|autoPlay|fetch\(/);
});

// The homepage welcomes, /servers explains the interface, /updates keeps the
// release ledger. Until 2026-09-16 the homepage did all three at once, which
// is why this test used to require the tester-build walkthrough there; the
// owner's correction moved that content, so the assertion moved with it. The
// truthfulness assertions below are unchanged — they follow the components.
test("the welcome homepage, the server route and the updates ledger each keep their own job", async () => {
  const [home, route, updates, landing] = await Promise.all([
    readFile("src/app/page.tsx", "utf8"),
    readFile("src/app/(marketing)/servers/page.tsx", "utf8"),
    readFile("src/app/(marketing)/updates/page.tsx", "utf8"),
    readFile("src/components/servers/servers-landing.tsx", "utf8"),
  ]);
  // A welcome: the rotating hero first, then what YO Voice and a Server are.
  assert.match(home, /<HeroSection\s*\/>/);
  assert.match(home, /<ServersWelcome\s*\/>/);
  // Release-ledger content belongs on /updates, not on the welcome.
  assert.doesNotMatch(home, /<TesterBuildExperience\s*\/>/);
  assert.doesNotMatch(home, /<LatestReleaseSpotlight\s*\/>/);
  assert.match(updates, /<TesterBuildExperience\s*\/>/);
  assert.match(updates, /<LatestReleaseSpotlight\s*\/>/);
  // The full landing, with its build capture and release boundary, is the
  // /servers route's job; the homepage gets the welcome-sized version.
  assert.match(route, /<ServersLanding\s*\/>/);
  assert.doesNotMatch(home, /<ServersLanding\s*\/>/);
  assert.doesNotMatch(home, /<StatsSection\s*\/>/);
  assert.doesNotMatch(landing, /<PublicShowcaseGrid\s*\/>/);
  assert.match(landing, /screenshots\/build-35\/create-server-desktop\.webp/);
  assert.match(landing, /YO Voice 3\.0\.0 capture from app commit 87a2f996/i);
  assert.doesNotMatch(landing, /unchanged in Build 27/i);
  assert.match(landing, /\bpreload\b/);
  assert.doesNotMatch(landing, /\bpriority\b/);
  // The capture is labelled with the app version it was taken from; the
  // status link and the boundary copy follow the release ledger instead.
  assert.match(landing, /Captured in YO Voice 3\.0\.0/);
  assert.match(landing, /mobile-build-\$\{currentRelease\.buildNumber\}-internal-testing/);
  assert.match(landing, /open to every signed-in account since 16 September 2026/i);
  assert.match(landing, /Podcast recording is the one piece still switched off/i);
  assert.match(landing, /These allowances are enforced by the server now that Servers are open/i);
  assert.doesNotMatch(landing, /Backend activation stays gated|server backend remains gated|Build 26 status|mobile-build-26/i);
  assert.doesNotMatch(landing, /Create server now|Start your server today|end-to-end encrypted|zero latency/i);
});

test("navigation and canonical route use Servers while the legacy marketing URL redirects", async () => {
  const [site, footer, redirect, sitemap] = await Promise.all([
    readFile("src/config/site.ts", "utf8"), readFile("src/components/layout/site-footer.tsx", "utf8"),
    readFile("src/app/(marketing)/clubs/page.tsx", "utf8"), readFile("src/app/sitemap.ts", "utf8"),
  ]);
  for (const source of [site, footer, sitemap]) {
    assert.match(source, /\/servers/);
    assert.doesNotMatch(source, /["']\/clubs["']/);
  }
  assert.match(redirect, /permanentRedirect\("\/servers"\)/);
});

test("Premium and Updates do not turn a planned allowance into a paid or shipped feature", async () => {
  const [premium, updates, faq] = await Promise.all([
    readFile("src/config/premium.ts", "utf8"), readFile("src/app/(marketing)/updates/page.tsx", "utf8"),
    readFile("src/app/(marketing)/faq/page.tsx", "utf8"),
  ]);
  assert.doesNotMatch(premium, /"Create Clubs"|"Create your own Clubs"/);
  // Servers are open (app ADR-197), so the allowance carries no launch
  // qualifier anywhere Premium is sold.
  assert.match(premium, /"Up to 30 Servers"/);
  for (const file of [
    "src/config/premium.ts",
    "src/components/premium/premium-plans-view.tsx",
    "src/components/sections/premium-section.tsx",
    "src/app/(marketing)/premium/page.tsx",
  ]) {
    assert.doesNotMatch(
      await readFile(file, "utf8"),
      /after (?:Servers )?launch|once Servers launch|inactive while server backend activation is gated/i,
      file,
    );
  }
  assert.match(premium, /Free includes 5 owned Servers/i);
  assert.match(premium, /Premium includes 30/i);
  assert.match(premium, /Joining stays unlimited for everyone/i);
  assert.match(updates, /open to every signed-in account/i);
  assert.match(updates, /Podcast recording remains disabled/i);
  assert.match(faq, /Podcast recording is disabled in the current tester build/i);
  assert.match(faq, /Servers have been open to every signed-in account since 16 September 2026/i);
  assert.match(faq, /the server enforces these allowances/i);
  assert.match(faq, /Yes\. The composer offers 16 original YO Voice GIF animations/i);
  assert.doesNotMatch(faq, /since Build \d+/i);
  // The current build comes from current-release.ts, so the answer cannot
  // name a build the ledger has moved past, and no next step is announced.
  assert.match(faq, /\$\{currentRelease\.version\} is the current tester build/);
  assert.doesNotMatch(faq, /nextReleaseCandidate/);
  // No Room or Club data was migrated, so the answer promises no carry-over.
  assert.match(faq, /Rooms and Clubs were replaced by Servers on 13 September 2026/);
  assert.doesNotMatch(faq, /carried over|data migration/i);
  assert.doesNotMatch(faq, /remains gated|backend gate is cleared|backend release gate|not presented as available|Build 27 is being prepared|gated backend|2\.0\.0 \(26\)/i);
  assert.doesNotMatch(`${faq}${updates}`, /GIPHY|Android session continuity|Build 27 (?:is|are) available/i);
});

test("notification preferences preserve backend IDs and gate follower settings on server eligibility", async () => {
  const source = await readFile(
    "src/app/(account)/account/notifications/page.tsx",
    "utf8",
  );

  for (const id of [
    "follow",
    "clubInvite",
    "clubInviteAccepted",
    "roomInvite",
    "broadcastInvite",
  ]) {
    assert.match(source, new RegExp(`id: "${id}"`), id);
  }

  // Labels mirror the app's notification_preferences_screen.dart.
  for (const [id, label] of [
    ["clubInvite", "Server invitations"],
    ["clubInviteAccepted", "Server invitation accepted"],
    ["roomInvite", "Voice channel invitations"],
    ["broadcastInvite", "Podcast invitations"],
  ]) {
    assert.match(source, new RegExp(`id: "${id}", label: "${label}"`), id);
  }
  assert.doesNotMatch(source, /Community invitation/);

  assert.match(source, /"publicProfiles", user\.uid/);
  assert.match(source, /snapshot\.data\(\)\?\.creatorAudienceVisible === true/);
  assert.match(
    source,
    /!group\.creatorOnly \|\| creatorAudienceVisible/,
  );
  assert.match(source, /Premium Creator/);
  assert.match(source, /age-verified/);
  assert.match(source, /explicitly opted in/);
  assert.match(
    source,
    /public, server-derived eligibility projection[\s\S]*not recomputed here/i,
  );
});

test("server CSS retains visible keyboard focus, selected state, responsive reflow and reduced motion", async () => {
  const css = await readFile("src/components/servers/servers-landing.module.css", "utf8");
  assert.match(css, /:focus-visible.*var\(--focus\)/);
  assert.match(css, /\[aria-selected="true"\]/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /forced-colors: active/);
  assert.match(css, /max-width: 600px/);
  assert.match(css, /max-width: 360px/);
  assert.doesNotMatch(css, /@keyframes|infinite/);
});

function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

test("Premium never sells Build 27-only benefits unless a phrase marks them as not active yet", async () => {
  // Incognito read receipts, typing visibility and the Yeels ranking boost
  // arrived in app commit 379d0934 (not in Build 26), and the Build 27 runbook
  // keeps the Premium privacy setter and listReelsV2 undeployed.
  const files = [
    "src/config/premium.ts",
    "src/app/(marketing)/premium/page.tsx",
    "src/components/sections/premium-section.tsx",
    "src/components/premium/premium-plans-view.tsx",
  ];
  const unreleased =
    /Incognito|read receipts?|typing visibility|(?:discovery|recommendation|Yeels) boost|privacy controls?|Presence & privacy/i;
  const qualified = /planned for a later release|not active yet/i;

  for (const file of files) {
    const text = withoutComments(await readFile(file, "utf8")).replace(/\s+/g, " ");
    // String literals and JSX text are split at their delimiters, so a
    // qualifier only counts when it sits in the same phrase as the benefit.
    for (const phrase of text.split(/["`<>{}]/)) {
      if (unreleased.test(phrase)) {
        assert.match(phrase, qualified, `${file}: "${phrase.trim()}"`);
      }
    }
  }
});

test("download surfaces never describe desktop apps that do not exist", async () => {
  // App docs/Roadmap.md §14: Windows/macOS installers — Status: Not started.
  const forbidden =
    /dedicated desktop application|builds prepared|Native desktop build|Apple Silicon and Intel builds/i;
  const sources = (await readdir("src", { recursive: true }))
    .filter((file) => /\.(?:ts|tsx)$/.test(file))
    .map((file) => `src/${file}`);
  assert.ok(sources.length > 50, "source files are scanned");
  for (const file of sources) {
    assert.doesNotMatch(await readFile(file, "utf8"), forbidden, file);
  }

  const [section, selector] = await Promise.all([
    readFile("src/components/sections/download-section.tsx", "utf8"),
    readFile("src/components/download/platform-selector.tsx", "utf8"),
  ]);
  assert.equal(section.match(/Desktop installers are not available yet/g)?.length, 2);
  assert.equal(selector.match(/Desktop installer not started/g)?.length, 2);
});

test("server type tabs keep subtitles whole, step numbers readable, the heading unsqueezed and focus unclipped", async () => {
  const css = await readFile("src/components/servers/servers-landing.module.css", "utf8");
  // Every declaration block that starts with the selector on its own line,
  // joined, so grouped rules such as `.a,\n.b { … }` are included.
  const block = (source: string, selector: string) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = [...source.matchAll(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`, "g"))];
    assert.ok(matches.length > 0, selector);
    return matches.map((match) => match[1]).join(" ");
  };
  const media = (width: number) => {
    const match = css.match(new RegExp(`@media \\(max-width: ${width}px\\) \\{([\\s\\S]*?)\\n\\}`));
    assert.ok(match, `${width}px media block`);
    return match[1];
  };

  // A2: subtitles wrap instead of being truncated.
  assert.doesNotMatch(css, /text-overflow:\s*ellipsis/);
  const subtitle = block(css, ".typeButton small");
  assert.match(subtitle, /white-space: normal/);
  assert.doesNotMatch(subtitle, /nowrap|overflow: hidden/);

  // A1: step numbers use the 5.92:1 tertiary text token, not translucent white.
  assert.match(block(css, ".stepTop span"), /color: var\(--text-tertiary\)/);
  assert.doesNotMatch(css, /#ffffff42/i);

  // V1: the explorer heading stacks at the tablet breakpoint and never gets
  // squeezed beside its description above it.
  assert.match(block(media(1050), ".explorerHeading"), /display: block/);
  assert.match(block(css, ".explorerHeading > div"), /min-width: min\(100%, 420px\)/);

  // Focus clip: the mobile tab scroller reserves the full ring (width + offset)
  // on every side.
  const explorer = await readFile("src/components/servers/server-explorer.tsx", "utf8");
  assertScrollingTablistKeepsFocusVisible({
    label: "Server types",
    css,
    scrollerRules: [block(media(600), ".typePicker")],
    component: explorer,
  });
});

// A horizontally scrolling tablist clips everything outside its padding box.
// Its padding on every side and its scroll-padding must hold the whole focus
// ring (outline width + offset, parsed from the module's :focus-visible rule),
// nothing may snap a focused edge tab back under the clip, and the component
// must scroll a focused tab fully into the strip.
function assertScrollingTablistKeepsFocusVisible(input: {
  label: string;
  css: string;
  scrollerRules: string[];
  component: string;
}) {
  const { label, css, scrollerRules, component } = input;
  const focus = css.match(/:focus-visible \{ outline: (\d+)px solid var\(--focus\); outline-offset: (\d+)px; \}/);
  assert.ok(focus, `${label}: focus ring rule`);
  const ring = Number(focus[1]) + Number(focus[2]);
  assert.ok(ring > 0, `${label}: ring size`);

  const scroller = scrollerRules.join(" ");
  assert.match(scroller, /overflow-x: auto/, `${label}: scroller`);
  const paddings = [...scroller.matchAll(/(?:^|[;\s])padding(?:-[a-z]+)*: ([^;]+);/g)];
  assert.ok(paddings.length > 0, `${label}: scroller padding`);
  for (const [declaration, value] of paddings) {
    const sides = value.trim().split(/\s+/);
    assert.ok(sides.length >= 1 && sides.length <= 4, `${label}: ${declaration.trim()}`);
    for (const side of sides) {
      const px = side.match(/^(\d+(?:\.\d+)?)px$/);
      assert.ok(px && Number(px[1]) >= ring, `${label}: scroller ${declaration.trim()} must hold a ${ring}px focus ring on every side`);
    }
  }
  const scrollPadding = scroller.match(/scroll-padding-inline: (\d+)px/);
  assert.ok(scrollPadding && Number(scrollPadding[1]) >= ring, `${label}: scroll-padding reveals the ring`);
  // A snap point would pull a focused edge tab back and clip its ring.
  assert.doesNotMatch(css, /scroll-snap-type/, `${label}: no scroll snapping`);

  assert.match(component, /scrollIntoView\(\{ block: "nearest", inline: "nearest" \}\)/, `${label}: reveal`);
  assert.match(component, /onFocus=\{\(event\) => revealTab\(event\.currentTarget\)\}/, `${label}: reveal on focus`);
}

test("Build app-area tabs keep the keyboard focus ring and the focused tab inside their scroller", async () => {
  const [css, component] = await Promise.all([
    readFile("src/components/sections/tester-build-experience.module.css", "utf8"),
    readFile("src/components/sections/tester-build-experience.tsx", "utf8"),
  ]);
  const rules = (source: string) =>
    [...source.matchAll(/(?:^|\n)\s*\.tabs\s*\{([^}]*)\}/g)].map((match) => match[1]);
  // These tabs scroll at every width, so the base rule (outside any media
  // query) must hold the ring, and no later .tabs rule may shrink it.
  const base = rules(css.slice(0, css.indexOf("@media")));
  assert.equal(base.length, 1, "one base .tabs rule");
  assertScrollingTablistKeepsFocusVisible({ label: "Base app-area tabs", css, scrollerRules: base, component });
  const overrides = rules(css.slice(css.indexOf("@media")));
  for (const override of overrides) {
    assert.doesNotMatch(override, /(?:^|[;\s])padding(?:-[a-z]+)*:|overflow/, "a media query must not change the scroller box");
  }
  assert.match(component, /role="tablist"/);
  assert.match(component, /buttons\.current\[next\]\?\.focus\(\)/);
});

test("screenshot provenance stays out of the publicly served folder", async () => {
  // Everything under public/ is served from the site root, so screenshot
  // provenance notes live in docs/design instead.
  const screenshotFiles = await readdir("public/screenshots", { recursive: true });
  assert.ok(screenshotFiles.some((file) => file.endsWith("servers-desktop.jpg")));
  assert.deepEqual(screenshotFiles.filter((file) => /\.(?:md|mdx)$/i.test(file)), []);
  const provenance = await readFile("docs/design/build-26-screenshots.md", "utf8");
  assert.match(provenance, /source revision `d1c036b7`/);
  assert.doesNotMatch(provenance, /Build 27/);
});
