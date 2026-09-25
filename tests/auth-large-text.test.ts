import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// WCAG 1.4.4 on phones (docs/design/design-system.md: "reflow at 320 CSS
// pixels and at 200% text zoom without horizontal page scrolling"). At 125 %
// text on a 320 px phone the auth column used to grow past the screen and
// `body { overflow-x: hidden }` clipped every field and button. These guard
// the rules that keep it inside the screen; the runtime proof (headless
// Chrome at 320 / 390 px, 100-300 % text and page zoom) is in
// yovoice-evidence/2026-09-25/website-large-text.

const read = (path: string) => readFile(path, "utf8");
const rule = (css: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`));
  assert.ok(match, `missing rule ${selector}`);
  return match[1];
};

test("the text input is compressible, so its default size never widens a field", async () => {
  const css = await read("src/app/globals.css");
  const input = rule(css, ".glass-field__input");
  assert.match(input, /width: 100%;/);
  assert.match(input, /min-width: 0;/);
  assert.match(input, /padding: \.9rem min\(1\.1rem, 17\.6px\);/);
});

test("field slots stop growing at their 16 px size and never exceed a quarter of the field", async () => {
  const [css, input] = await Promise.all([
    read("src/app/globals.css"),
    read("src/components/ui/input.tsx"),
  ]);
  assert.match(rule(css, ".glass-field__icon,\n.glass-field__action"), /width: min\(2\.75rem, 44px, 25%\);/);
  assert.match(css, /\.glass-field__action \{ width: min\(3rem, 48px, 25%\); \}/);
  // The status icons live in the pinned action slot, so they are pinned too
  // (a rem-sized icon would outgrow the 48 px slot from 240 % text).
  assert.doesNotMatch(input, /size-5/);
  assert.equal(input.match(/size-\[min\(1\.25rem,20px\)\]/g)?.length, 2);
});

test("the phone auth and account grids use a shrinkable single track below lg", async () => {
  const [auth, account] = await Promise.all([
    read("src/app/(auth)/layout.tsx"),
    read("src/app/(account)/account/layout.tsx"),
  ]);
  assert.match(auth, /className="grid w-full max-w-\[400px\] grid-cols-1 lg:/);
  assert.match(auth, /lg:grid-cols-\[minmax\(0,560px\)_minmax\(0,480px\)\]/);
  assert.match(auth, /<BrandLockup className="mx-auto w-fit flex-wrap justify-center lg:hidden" \/>/);
  assert.match(account, /className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-\[240px_1fr\]"/);
});

test("the delete-account form wraps its long words and pins its button padding", async () => {
  const page = await read("src/app/(account)/account/delete/page.tsx");
  assert.match(page, /aria-labelledby="deletion-confirm-heading"\s+className="panel p-5 \[overflow-wrap:anywhere\] sm:p-8"/);
  assert.match(page, /bg-\[var\(--danger-surface\)\] px-\[min\(1\.5rem,24px\)\] text-\[15px\]/);
});

test("the Log in / Create account halves stay equal under the 50 % pill", async () => {
  const css = await read("src/app/globals.css");
  assert.match(rule(css, ".auth-switch"), /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(rule(css, ".auth-switch__pill"), /width: calc\(50% - 4px\);/);
  const option = rule(css, ".auth-switch__option");
  assert.match(option, /min-width: 0;/);
  assert.match(option, /padding-inline: min\(\.75rem, 12px\);/);
  assert.match(option, /overflow-wrap: anywhere;/);
});

test("long words, e-mail addresses and button labels wrap inside the auth column", async () => {
  const css = await read("src/app/globals.css");
  assert.match(css, /\.auth-pane \{ overflow-wrap: anywhere; \}/);
  const buttons = ".auth-pane :is(.premium-button, .premium-button-secondary, .premium-button-ghost)";
  assert.match(rule(css, buttons), /padding-inline: min\(1\.25rem, 20px\);/);
  assert.ok(css.includes(`${buttons} > * { min-width: 0; }`));
});

test("the phone waveform and the skip link fit a page-zoomed phone", async () => {
  const css = await read("src/app/globals.css");
  // 44 bars with fixed 1.5 px gaps needed 132 px; 390 px at 300 % zoom is 130.
  assert.match(rule(css, ".auth-wave__bar"), /margin-inline: min\(1\.5px, \.53%\);/);
  const skip = rule(css, ".skip-link:focus");
  assert.match(skip, /max-width: calc\(100% - 2rem\);/);
  assert.match(skip, /overflow-wrap: anywhere;/);
});
