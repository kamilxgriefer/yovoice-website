import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the gradient hero line reserves paint space for letter descenders", async () => {
  const [hero, css] = await Promise.all([
    readFile("src/components/hero/hero-section.tsx", "utf8"),
    readFile("src/app/globals.css", "utf8"),
  ]);

  assert.match(hero, /text-gradient-descender-safe/);
  assert.match(
    css,
    /\.text-gradient-descender-safe\s*\{[^}]*overflow:\s*visible;[^}]*margin-bottom:\s*-\.12em;[^}]*padding-bottom:\s*\.12em;/s,
  );
});

test("hero rotator uses compact 44px controls instead of tiny pagination dots", async () => {
  const rotator = await readFile(
    "src/components/hero/hero-prompt-rotator.tsx",
    "utf8",
  );

  assert.match(rotator, /Show previous welcome message/);
  assert.match(rotator, /Show next welcome message/);
  assert.match(rotator, /min-h-11/);
  assert.match(rotator, /size-11/);
  assert.doesNotMatch(rotator, /heroPrompts\.map\(\(prompt, index\)/);
});
