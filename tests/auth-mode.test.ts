import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  AUTH_MODE_VOICE,
  authModeFromPath,
  authModeHref,
  waveformHeights,
} from "../src/lib/auth/auth-mode.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("auth mode", () => {
  test("only /login and /register are modes of the shared switch", () => {
    assert.equal(authModeFromPath("/login"), "login");
    assert.equal(authModeFromPath("/register"), "register");
    assert.equal(authModeFromPath("/login/"), "login");
    assert.equal(authModeFromPath("/forgot-password"), null);
    assert.equal(authModeFromPath("/verify-email"), null);
    assert.equal(authModeFromPath("/"), null);
    assert.equal(authModeFromPath(null), null);
  });

  test("switching modes keeps the redirect destination", () => {
    assert.equal(authModeHref("register", null), "/register");
    assert.equal(authModeHref("login", ""), "/login");
    assert.equal(
      authModeHref("register", "/download?utm_source=mail&plan=yearly"),
      "/register?redirect=%2Fdownload%3Futm_source%3Dmail%26plan%3Dyearly",
    );
    const url = new URL(authModeHref("login", "/premium"), "https://yovoice.test");
    assert.equal(url.pathname, "/login");
    assert.equal(url.searchParams.get("redirect"), "/premium");
  });
});

describe("auth waveform", () => {
  test("every title letter has a loudness value", () => {
    for (const { title, envelope } of Object.values(AUTH_MODE_VOICE)) {
      assert.equal(envelope.length, title.replace(/\s/g, "").length, title);
      for (const level of envelope) assert.ok(level >= 0 && level <= 1, title);
    }
  });

  test("heights are deterministic, bounded and one per bar", () => {
    const { envelope } = AUTH_MODE_VOICE.login;
    const first = waveformHeights(envelope, 64);
    assert.deepEqual(first, waveformHeights(envelope, 64));
    assert.equal(first.length, 64);
    for (const h of first) assert.ok(h >= 0.08 && h <= 1);
    assert.notDeepEqual(first, waveformHeights(AUTH_MODE_VOICE.register.envelope, 64));
  });

  test("the switch keeps the redirect it was opened with", () => {
    const view = read("src/components/auth/auth-mode-switch.tsx");
    assert.match(view, /useSearchParams\(\)\.get\("redirect"\)/);
    assert.match(view, /href=\{authModeHref\(option\.mode, redirect\)\}/);
    for (const form of ["login-form", "register-form"]) {
      assert.match(read(`src/components/auth/${form}.tsx`), /authModeHref\("(login|register)", searchParams\.get\("redirect"\)\)/, form);
    }
  });

  test("the second-factor step hides the switch and mode-only rows can shrink", () => {
    const css = read("src/app/globals.css");
    assert.match(read("src/components/auth/login-form.tsx"), /<div data-auth-challenge>/);
    assert.match(css, /\.auth-pane:has\(\[data-auth-challenge\]\) \.auth-switch \{ display: none; \}/);
    assert.match(css, /\.auth-fold \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  });

  test("the pages keep one real heading each, taken from the shared copy", () => {
    const login = read("src/app/(auth)/login/page.tsx");
    const register = read("src/app/(auth)/register/page.tsx");
    assert.match(login, /<h1[^>]*>\s*\{AUTH_MODE_VOICE\.login\.heading\}\s*<\/h1>/);
    assert.match(register, /<h1[^>]*>\s*\{AUTH_MODE_VOICE\.register\.heading\}\s*<\/h1>/);
  });
});
