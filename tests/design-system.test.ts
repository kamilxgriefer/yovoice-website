import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("website semantic colours stay aligned with the Flutter Dark palette", async () => {
  const css = await readFile("src/app/globals.css", "utf8");

  for (const token of [
    "--background: #080711",
    "--background-top: #130a22",
    "--surface: #17121f",
    "--surface-muted: #100d18",
    "--surface-raised: #21192b",
    "--surface-sunken: #0c0814",
    "--primary: #7b2ff7",
    "--secondary: #c026ff",
    "--brand-cyan: #5ce1e6",
    "--navigation-surface: #17111f",
    "--navigation-outline: #725c86",
    "--navigation-inactive: #9189a6",
    "--focus: #d986ff",
    "--success-surface: #10271c",
    "--success: #57d99a",
    "--warning-surface: #2e2410",
    "--warning: #ffc94d",
    "--info-surface: #102337",
    "--info: #6fc3ff",
    "--danger-surface: #32131d",
    "--error: #ffb3be",
  ]) {
    assert.match(css.toLowerCase(), new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("release states and global keyboard focus use semantic tokens", async () => {
  const [css, updates] = await Promise.all([
    readFile("src/app/globals.css", "utf8"),
    readFile("src/app/(marketing)/updates/page.tsx", "utf8"),
  ]);

  assert.match(css, /:focus-visible\s*\{[^}]*var\(--focus\)/s);
  for (const status of ["live", "testing", "ready", "verification", "superseded"]) {
    assert.match(css, new RegExp(`release-status\\[data-status="${status}"\\]`));
  }
  assert.match(updates, /data-status=\{status\}/);
  assert.match(updates, /data-status=\{update\.status\}/);
  assert.doesNotMatch(updates, /leading-4 opacity-70/);
});

test("premium release surfaces reuse shared tokens and preserve semantic headings", async () => {
  const [css, spotlight, updates] = await Promise.all([
    readFile("src/app/globals.css", "utf8"),
    readFile("src/components/sections/latest-release-spotlight.tsx", "utf8"),
    readFile("src/app/(marketing)/updates/page.tsx", "utf8"),
  ]);

  for (const pattern of [
    /\.release-spotlight\s*\{/,
    /\.release-build-orb\s*\{/,
    /\.release-scope-card\s*\{/,
    /\.release-card-featured\s*\{/,
  ]) {
    assert.match(css, pattern);
  }

  assert.match(spotlight, /aria-labelledby="latest-release-heading"/);
  assert.match(spotlight, /id="latest-release-heading"/);
  assert.match(spotlight, /min-h-12/);
  assert.match(updates, /aria-labelledby=\{update\.slug \+ "-title"\}/);
  for (const source of [spotlight, updates]) {
    assert.match(source, /<span className="sr-only">Build <\/span>/);
    assert.doesNotMatch(source, /aria-label=\{"Build " \+ update\.release\.buildNumber\}/);
  }
});

test("keyboard skip link retains explicit contrast above the anchor reset", async () => {
  const [css, layout] = await Promise.all([
    readFile("src/app/globals.css", "utf8"),
    readFile("src/app/layout.tsx", "utf8"),
  ]);

  assert.match(layout, /href="#main-content"/);
  assert.match(layout, /className="skip-link focus-ring /);
  assert.match(layout, /focus:translate-y-0/);
  assert.match(css, /\.skip-link\s*\{[^}]*background:\s*#fff;/s);
  assert.match(css, /\.skip-link\s*\{[^}]*color:\s*#211629;/s);
});
