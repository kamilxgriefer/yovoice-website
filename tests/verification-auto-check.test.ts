import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  VERIFICATION_AUTO_CHECK_POLICY,
  startVerificationAutoCheck,
  verificationAutoCheckDelayMs,
  type VerificationAutoCheckEnvironment,
} from "../src/lib/auth/verification-auto-check.ts";

const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

/** A fake clock, timer queue and page visibility. */
function fakePage({ visible = true } = {}) {
  let now = 0;
  let nextId = 1;
  let isVisible = visible;
  const timers = new Map<number, { due: number; callback: () => void }>();
  const listeners = new Set<() => void>();

  const environment: VerificationAutoCheckEnvironment<number> = {
    isVisible: () => isVisible,
    onVisibilityChange: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setTimer: (callback, delayMs) => {
      const id = nextId++;
      timers.set(id, { due: now + delayMs, callback });
      return id;
    },
    clearTimer: (id) => {
      timers.delete(id);
    },
    now: () => now,
  };

  return {
    environment,
    time: () => now,
    pendingTimers: () => timers.size,
    listeners: () => listeners.size,
    async advance(ms: number) {
      const end = now + ms;
      for (;;) {
        await settle();
        const next = [...timers.entries()].sort((a, b) => a[1].due - b[1].due)[0];
        if (!next || next[1].due > end) break;
        now = next[1].due;
        timers.delete(next[0]);
        next[1].callback();
      }
      now = end;
      await settle();
    },
    async setVisible(value: boolean) {
      isVisible = value;
      for (const listener of [...listeners]) listener();
      await settle();
    },
    async fireVisibilityEvent() {
      for (const listener of [...listeners]) listener();
      await settle();
    },
  };
}

function recordingCheck(page: ReturnType<typeof fakePage>, results: Array<boolean | Error> = []) {
  const calls: number[] = [];
  return {
    calls,
    check: async () => {
      calls.push(page.time());
      const result = results.shift() ?? false;
      if (result instanceof Error) throw result;
      return result;
    },
  };
}

describe("verification auto-check schedule", () => {
  test("waits double after each check, capped at one minute", () => {
    assert.deepEqual(
      [0, 1, 2, 3, 4, 5, 6, 50].map((checks) => verificationAutoCheckDelayMs(checks)),
      [5_000, 5_000, 10_000, 20_000, 40_000, 60_000, 60_000, 60_000],
    );
  });

  test("checks once on arrival, then backs off instead of looping", async () => {
    const page = fakePage();
    const { calls, check } = recordingCheck(page);
    startVerificationAutoCheck({ check, onVerified: () => {}, environment: page.environment });

    await page.advance(7_000);
    // Round 2 measured 62 lookups in about 7 s with the old effect.
    assert.deepEqual(calls, [0, 5_000]);

    await page.advance(120_000 - 7_000);
    assert.deepEqual(calls, [0, 5_000, 15_000, 35_000, 75_000]);
  });

  test("never checks more than the per-visit cap while the tab stays open", async () => {
    const page = fakePage();
    const { calls, check } = recordingCheck(page);
    startVerificationAutoCheck({ check, onVerified: () => {}, environment: page.environment });

    await page.advance(2 * 60 * 60 * 1_000);
    assert.equal(calls.length, VERIFICATION_AUTO_CHECK_POLICY.maxChecksPerVisibleStretch);
    assert.equal(calls.length, 20);
    assert.equal(calls.at(-1), 975_000);
    for (let index = 1; index < calls.length; index += 1) {
      assert.ok(calls[index] - calls[index - 1] >= 5_000, `gap before check ${index}`);
    }
    assert.equal(page.pendingTimers(), 0);
  });

  test("stops for good once the account is verified", async () => {
    const page = fakePage();
    const { calls, check } = recordingCheck(page, [false, false, true]);
    let verified = 0;
    startVerificationAutoCheck({ check, onVerified: () => (verified += 1), environment: page.environment });

    await page.advance(60 * 60 * 1_000);
    assert.deepEqual(calls, [0, 5_000, 15_000]);
    assert.equal(verified, 1);
    assert.equal(page.pendingTimers(), 0);
    assert.equal(page.listeners(), 0);

    await page.setVisible(false);
    await page.setVisible(true);
    await page.advance(60_000);
    assert.equal(calls.length, 3);
  });

  test("pauses while the tab is hidden and checks promptly when it returns", async () => {
    const page = fakePage();
    const { calls, check } = recordingCheck(page);
    startVerificationAutoCheck({ check, onVerified: () => {}, environment: page.environment });

    await page.advance(6_000);
    assert.deepEqual(calls, [0, 5_000]);

    await page.setVisible(false);
    assert.equal(page.pendingTimers(), 0);
    await page.advance(10 * 60 * 1_000);
    assert.deepEqual(calls, [0, 5_000]);

    await page.setVisible(true);
    await page.advance(0);
    assert.deepEqual(calls, [0, 5_000, 606_000]);
    await page.advance(14_000);
    // The backoff restarts for the new visit: 5 s, then 10 s.
    assert.deepEqual(calls, [0, 5_000, 606_000, 611_000]);
    await page.advance(1_000);
    assert.deepEqual(calls, [0, 5_000, 606_000, 611_000, 621_000]);
  });

  test("a tab opened in the background waits until it is shown", async () => {
    const page = fakePage({ visible: false });
    const { calls, check } = recordingCheck(page);
    startVerificationAutoCheck({ check, onVerified: () => {}, environment: page.environment });

    await page.advance(5 * 60 * 1_000);
    assert.deepEqual(calls, []);
    assert.equal(page.pendingTimers(), 0);

    await page.setVisible(true);
    await page.advance(0);
    assert.deepEqual(calls, [300_000]);
  });

  test("quick tab switches never check sooner than the first backoff step", async () => {
    const page = fakePage();
    const { calls, check } = recordingCheck(page);
    startVerificationAutoCheck({ check, onVerified: () => {}, environment: page.environment });

    await page.advance(1_000);
    await page.setVisible(false);
    await page.advance(1_000);
    await page.setVisible(true);
    await page.advance(1_000);
    assert.deepEqual(calls, [0]);
    await page.advance(2_000);
    assert.deepEqual(calls, [0, 5_000]);
  });

  test("a repeated visible event does not shorten the wait", async () => {
    const page = fakePage();
    const { calls, check } = recordingCheck(page);
    startVerificationAutoCheck({ check, onVerified: () => {}, environment: page.environment });

    await page.advance(40_000);
    assert.deepEqual(calls, [0, 5_000, 15_000, 35_000]);
    await page.fireVisibilityEvent();
    await page.advance(34_000);
    assert.equal(calls.length, 4);
    await page.advance(1_000);
    assert.deepEqual(calls, [0, 5_000, 15_000, 35_000, 75_000]);
  });

  test("a failed lookup keeps the same backoff", async () => {
    const page = fakePage();
    const offline = new Error("auth/network-request-failed");
    const { calls, check } = recordingCheck(page, [offline, offline, offline]);
    startVerificationAutoCheck({ check, onVerified: () => {}, environment: page.environment });

    await page.advance(40_000);
    assert.deepEqual(calls, [0, 5_000, 15_000, 35_000]);
  });

  test("only one check is in flight at a time", async () => {
    const page = fakePage();
    const calls: number[] = [];
    let release: (verified: boolean) => void = () => {};
    const check = () => {
      calls.push(page.time());
      return new Promise<boolean>((resolve) => {
        release = resolve;
      });
    };
    startVerificationAutoCheck({ check, onVerified: () => {}, environment: page.environment });

    await page.advance(1_000);
    await page.setVisible(false);
    await page.setVisible(true);
    await page.advance(60_000);
    assert.deepEqual(calls, [0]);

    release(false);
    await page.advance(0);
    await page.advance(5_000);
    assert.deepEqual(calls, [0, 66_000]);
  });

  test("stopping clears the timer and listener and ignores a late result", async () => {
    const page = fakePage();
    let release: (verified: boolean) => void = () => {};
    let checks = 0;
    let verified = 0;
    const stop = startVerificationAutoCheck({
      check: () => {
        checks += 1;
        return new Promise<boolean>((resolve) => {
          release = resolve;
        });
      },
      onVerified: () => (verified += 1),
      environment: page.environment,
    });
    await page.advance(0);
    stop();
    assert.equal(page.pendingTimers(), 0);
    assert.equal(page.listeners(), 0);

    release(true);
    await page.advance(10 * 60 * 1_000);
    assert.equal(checks, 1);
    assert.equal(verified, 0);
  });
});

test("/verify-email runs the bounded schedule keyed on the account, not on the user object", () => {
  const page = readFileSync(
    new URL("../src/app/(auth)/verify-email/page.tsx", import.meta.url),
    "utf8",
  );
  // The loop: reloadUser() replaces `user`, and an effect keyed on `user`
  // reloaded again, forever.
  assert.doesNotMatch(page, /\}, \[user\]\);/);
  assert.doesNotMatch(page, /\}, \[user, verified\]\);/);
  assert.doesNotMatch(page, /setInterval\(async/);
  assert.doesNotMatch(page, /AUTO_CHECK_INTERVAL_MS/);
  assert.match(page, /const uid = user\?\.uid \?\? null;/);
  assert.match(page, /return startVerificationAutoCheck\(\{[\s\S]*?\}\);\s*\}, \[uid, verified\]\);/);
  assert.match(page, /const checkVerified = useEffectEvent\(\(\) => reloadUser\(\)\);/);
  assert.match(page, /check: \(\) => checkVerified\(\),/);
  // Besides the schedule, only the "I have verified my email" button reloads.
  assert.equal(page.match(/await reloadUser\(\)/g)?.length, 1);
  assert.match(page, /document\.visibilityState === "visible"/);
  assert.match(page, /addEventListener\("visibilitychange", listener\)/);
  assert.match(page, /removeEventListener\("visibilitychange", listener\)/);
});
