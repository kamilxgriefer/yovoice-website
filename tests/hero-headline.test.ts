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
    /\.text-gradient-descender-safe\s*\{[^}]*margin-bottom:\s*-\.12em;[^}]*padding-bottom:\s*\.12em;/s,
  );
});
