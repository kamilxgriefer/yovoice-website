import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import nextConfig from "../next.config.ts";

test("www.yovoice.app redirects permanently to the apex, keeping the path", async () => {
  assert.equal(typeof nextConfig.redirects, "function");
  const redirects = await nextConfig.redirects!();
  const www = redirects.find((entry) =>
    entry.has?.some((item) => item.type === "host" && item.value === "www.yovoice.app"),
  );
  assert.ok(www, "missing the www host redirect");
  assert.equal(www.source, "/:path*");
  assert.equal(www.destination, "https://yovoice.app/:path*");
  assert.equal("permanent" in www && www.permanent, true);
});

test("the homepage declares its canonical and the root layout does not", async () => {
  const [page, layout] = await Promise.all([
    readFile("src/app/page.tsx", "utf8"),
    readFile("src/app/layout.tsx", "utf8"),
  ]);
  assert.match(page, /alternates:\s*\{\s*canonical:\s*"\/"\s*\}/);
  // A canonical in the root layout would be inherited by /login, /app,
  // /account/* and not-found, marking them as copies of the homepage.
  assert.doesNotMatch(layout, /canonical/);
});

test("/premium server HTML carries the heading, prices and #included, not only a spinner", async () => {
  const source = await readFile("src/components/premium/premium-plans-view.tsx", "utf8");
  assert.match(source, /<Suspense fallback=\{<PremiumPlansStaticPreview \/>\}>/);
  assert.doesNotMatch(source, /Loading Premium plans/);

  const preview = source.slice(
    source.indexOf("function PremiumPlansStaticPreview()"),
    source.indexOf("function PremiumPlansIntro()"),
  );
  assert.ok(preview.length > 0, "static preview found");
  assert.match(preview, /premiumFallbackBillingPlans/);
  assert.match(preview, /<PremiumPlansIntro \/>/);
  assert.match(preview, /<PremiumIncludedSection \/>/);
  // Display-only: no hooks, no plan buttons, no checkout.
  assert.doesNotMatch(preview, /\buse[A-Z]\w*\(|<button|onClick|choosePlan|checkoutAvailable|createPremiumCheckoutSession/);
  assert.match(source, /id="included"/);
});

test("/status marks only the checked row as live and dates the check", async () => {
  const source = await readFile("src/components/marketing/live-status.tsx", "utf8");
  assert.doesNotMatch(source, /: "ok";/, "no row is hard-coded as operational");
  assert.match(source, /Not monitored here/);
  assert.match(source, /dateStyle: "medium"/);
  assert.match(source, /timeStyle: "long"/);
  for (const link of [
    "https://status.firebase.google.com/",
    "https://status.livekit.io/",
    "https://www.vercel-status.com/",
  ]) {
    assert.ok(source.includes(`href="${link}"`), link);
  }
});

test("the hero stats line shows accounts only and no retired Rooms count", async () => {
  const source = await readFile("src/components/hero/live-stats.tsx", "utf8");
  const code = source.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(code, /existingRooms|voice spaces?|voice \{/);
  assert.match(code, /lg:justify-start/);
});
