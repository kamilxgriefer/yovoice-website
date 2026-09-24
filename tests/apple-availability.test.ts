import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createAppleAvailabilityCache,
  probeAppleProvider,
} from "../src/lib/auth/apple-availability-cache.ts";
import type { AppleSignInAvailability } from "../src/lib/auth/social-sign-in.ts";

/** A probe the test answers by hand, counting how often it was asked. */
function manualProbe() {
  const pending: ((answer: AppleSignInAvailability) => void)[] = [];
  const probe = () =>
    new Promise<AppleSignInAvailability>((resolve) => {
      pending.push(resolve);
    });
  return {
    probe,
    get calls() {
      return pending.length;
    },
    answer(index: number, availability: AppleSignInAvailability) {
      pending[index](availability);
    },
  };
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

describe("the Apple availability cache (one answer per tab, as in the app)", () => {
  test("nothing is known until the first probe settles, and concurrent requests share it", async () => {
    const manual = manualProbe();
    const cache = createAppleAvailabilityCache(manual.probe);
    let notified = 0;
    cache.subscribe(() => {
      notified += 1;
    });

    assert.equal(cache.peek(), null);
    const first = cache.get();
    const second = cache.get();
    await tick();
    assert.equal(manual.calls, 1, "one probe for both requests");
    assert.equal(cache.peek(), null, "still checking");

    manual.answer(0, "available");
    assert.deepEqual(await Promise.all([first, second]), ["available", "available"]);
    assert.equal(cache.peek(), "available");
    assert.equal(notified, 1, "subscribers hear the change once");
  });

  test("a configuration answer is kept for the tab: no second probe", async () => {
    for (const kept of ["available", "notConfigured"] as const) {
      const manual = manualProbe();
      const cache = createAppleAvailabilityCache(manual.probe);
      const first = cache.get();
      await tick();
      manual.answer(0, kept);
      await first;
      assert.equal(await cache.get(), kept);
      assert.equal(await cache.get(), kept);
      assert.equal(manual.calls, 1, kept);
      assert.equal(cache.peek(), kept);
    }
  });

  test("a temporary failure is drawn, but the next request (the button press) asks again", async () => {
    const manual = manualProbe();
    const cache = createAppleAvailabilityCache(manual.probe);
    const changes: (AppleSignInAvailability | null)[] = [];
    cache.subscribe(() => changes.push(cache.peek()));

    const first = cache.get();
    await tick();
    manual.answer(0, "temporarilyUnavailable");
    assert.equal(await first, "temporarilyUnavailable");
    assert.equal(cache.peek(), "temporarilyUnavailable");

    // Pressing "Couldn't check — try again" probes again...
    const retry = cache.get();
    await tick();
    assert.equal(manual.calls, 2);
    // ...and the old answer stays drawn until the new one arrives.
    assert.equal(cache.peek(), "temporarilyUnavailable");
    manual.answer(1, "available");
    assert.equal(await retry, "available");
    assert.equal(await cache.get(), "available");
    assert.equal(manual.calls, 2, "now kept");
    assert.deepEqual(changes, ["temporarilyUnavailable", "available"]);
  });

  test("the same temporary answer twice notifies once", async () => {
    const manual = manualProbe();
    const cache = createAppleAvailabilityCache(manual.probe);
    let notified = 0;
    cache.subscribe(() => {
      notified += 1;
    });
    for (let i = 0; i < 2; i += 1) {
      const request = cache.get();
      await tick();
      manual.answer(i, "temporarilyUnavailable");
      await request;
    }
    assert.equal(manual.calls, 2);
    assert.equal(notified, 1);
  });

  test("a probe that throws or rejects fails closed, and is asked again next time", async () => {
    let calls = 0;
    const cache = createAppleAvailabilityCache(() => {
      calls += 1;
      if (calls === 1) throw new Error("not configured");
      return Promise.reject(new Error("offline"));
    });
    assert.equal(await cache.get(), "temporarilyUnavailable");
    assert.equal(await cache.get(), "temporarilyUnavailable");
    assert.equal(calls, 2);
    assert.equal(cache.peek(), "temporarilyUnavailable");
  });

  test("an unsubscribed listener hears nothing more", async () => {
    const manual = manualProbe();
    const cache = createAppleAvailabilityCache(manual.probe);
    let notified = 0;
    const unsubscribe = cache.subscribe(() => {
      notified += 1;
    });
    unsubscribe();
    const request = cache.get();
    await tick();
    manual.answer(0, "notConfigured");
    await request;
    assert.equal(notified, 0);
  });
});

describe("the Apple probe request (accounts:createAuthUri)", () => {
  const appleBody = JSON.stringify({
    authUri:
      "https://appleid.apple.com/auth/authorize?client_id=app.yovoice.web&redirect_uri=https://yovoice-ec54a.firebaseapp.com/__/auth/handler",
    providerId: "apple.com",
  });

  function recordingFetch(respond: () => Promise<Response>) {
    const requests: { url: string; init: RequestInit | undefined }[] = [];
    const fetchImpl = ((url: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(url), init });
      return respond();
    }) as typeof fetch;
    return { fetchImpl, requests };
  }

  test("asks for apple.com with this origin, without cookies or cache, and reads the answer", async () => {
    const { fetchImpl, requests } = recordingFetch(async () => new Response(appleBody, { status: 200 }));
    const availability = await probeAppleProvider({
      apiKey: () => "key-1",
      origin: "https://yovoice.app",
      fetch: fetchImpl,
    });
    assert.equal(availability, "available");
    assert.equal(requests.length, 1);
    const [{ url, init }] = requests;
    assert.equal(url, "https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=key-1");
    assert.equal(init?.method, "POST");
    assert.equal(init?.credentials, "omit");
    assert.equal(init?.cache, "no-store");
    assert.deepEqual(JSON.parse(String(init?.body)), { providerId: "apple.com", continueUri: "https://yovoice.app" });
    assert.ok(init?.signal instanceof AbortSignal);
  });

  test("a provider switched off in Firebase reads as not configured", async () => {
    const { fetchImpl } = recordingFetch(
      async () =>
        new Response(JSON.stringify({ error: { code: 400, message: "OPERATION_NOT_ALLOWED : off" } }), { status: 400 }),
    );
    assert.equal(
      await probeAppleProvider({ apiKey: () => "k", origin: "https://yovoice.app", fetch: fetchImpl }),
      "notConfigured",
    );
  });

  test("no key, an unconfigured Firebase, a network error or an unreadable body never turn Apple on", async () => {
    const neverCalled = recordingFetch(async () => new Response(appleBody, { status: 200 }));
    for (const apiKey of [() => undefined, () => "  ", () => null]) {
      assert.equal(
        await probeAppleProvider({ apiKey, origin: "https://yovoice.app", fetch: neverCalled.fetchImpl }),
        "temporarilyUnavailable",
      );
    }
    assert.equal(
      await probeAppleProvider({
        apiKey: () => {
          throw new Error("YO Voice account services are unavailable in this environment.");
        },
        origin: "https://yovoice.app",
        fetch: neverCalled.fetchImpl,
      }),
      "temporarilyUnavailable",
    );
    assert.equal(neverCalled.requests.length, 0);

    const offline = recordingFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    assert.equal(
      await probeAppleProvider({ apiKey: () => "k", origin: "https://yovoice.app", fetch: offline.fetchImpl }),
      "temporarilyUnavailable",
    );

    const unreadable = recordingFetch(async () => {
      const response = new Response(appleBody, { status: 200 });
      Object.defineProperty(response, "text", { value: () => Promise.reject(new Error("aborted")) });
      return response;
    });
    assert.equal(
      await probeAppleProvider({ apiKey: () => "k", origin: "https://yovoice.app", fetch: unreadable.fetchImpl }),
      "temporarilyUnavailable",
    );
  });

  test("a probe that does not answer in time is aborted and fails closed", async () => {
    let aborted = false;
    const fetchImpl = ((_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      })) as typeof fetch;
    const started = Date.now();
    const availability = await probeAppleProvider({
      apiKey: () => "k",
      origin: "https://yovoice.app",
      fetch: fetchImpl,
      timeoutMs: 20,
    });
    assert.equal(availability, "temporarilyUnavailable");
    assert.equal(aborted, true);
    assert.ok(Date.now() - started < 2000);
  });
});
