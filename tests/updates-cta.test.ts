import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Updates roadmap CTA keeps visible dark text on its light surface", async () => {
  const [page, css] = await Promise.all([
    readFile("src/app/(marketing)/updates/page.tsx", "utf8"),
    readFile("src/app/globals.css", "utf8"),
  ]);

  assert.match(page, /className="roadmap-cta /);
  assert.match(css, /\.roadmap-cta\s*\{[^}]*background:\s*#fff;/s);
  assert.match(css, /\.roadmap-cta\s*\{[^}]*color:\s*#080711;/s);
  assert.match(page, />\s*View roadmap\s*</s);
});
