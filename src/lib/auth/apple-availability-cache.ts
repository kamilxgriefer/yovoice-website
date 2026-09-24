/**
 * Whether "Continue with Apple" can start, asked once per tab like the app's
 * `AuthService.getAppleSignInAvailability`: the caching rules and the probe,
 * with the browser and Firebase passed in (`apple-availability.ts` wires them)
 * so `node --test` can exercise both.
 *
 * - A configuration answer (available / not configured) is kept for the tab,
 *   so Log in and Create account draw the same button the moment they mount
 *   and the switch between them never changes it.
 * - A temporary failure is remembered for drawing too, but the next request
 *   probes again: pressing "Couldn't check — try again" is that request.
 * - Concurrent requests share one probe, and subscribers hear each change of
 *   the drawn answer once (`useSyncExternalStore`).
 * - Nothing but a genuine Apple authorisation URL turns Apple on: a probe that
 *   throws, rejects or times out answers "temporarily unavailable".
 */
import {
  APPLE_PROBE_TIMEOUT_MS,
  appleProviderProbeRequest,
  parseAppleProviderProbeResponse,
  type AppleSignInAvailability,
} from "./social-sign-in.ts";

export type AppleAvailabilityCache = {
  /** The last answer, without asking; `null` until the first probe settles. */
  peek: () => AppleSignInAvailability | null;
  /** The kept answer, or a probe (shared with any already running). */
  get: () => Promise<AppleSignInAvailability>;
  subscribe: (listener: () => void) => () => void;
};

export function createAppleAvailabilityCache(
  probe: () => Promise<AppleSignInAvailability>,
): AppleAvailabilityCache {
  let answer: Promise<AppleSignInAvailability> | null = null;
  let settled: AppleSignInAvailability | null = null;
  const listeners = new Set<() => void>();

  function get(): Promise<AppleSignInAvailability> {
    if (answer) return answer;
    const current: Promise<AppleSignInAvailability> = Promise.resolve()
      .then(probe)
      .catch((): AppleSignInAvailability => "temporarilyUnavailable")
      .then((availability) => {
        // A timeout or offline answer is not configuration state (as in the
        // app): draw it, but ask again next time.
        if (availability === "temporarilyUnavailable" && answer === current) {
          answer = null;
        }
        if (settled !== availability) {
          settled = availability;
          for (const listener of listeners) listener();
        }
        return availability;
      });
    answer = current;
    return current;
  }

  return {
    peek: () => settled,
    get,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type AppleProbeEnvironment = {
  /** The Firebase Web API key. May throw when Firebase is not configured. */
  apiKey: () => string | null | undefined;
  /** This page's origin, sent as `continueUri`. */
  origin: string;
  fetch: typeof fetch;
  timeoutMs?: number;
};

/**
 * One `accounts:createAuthUri` request for `apple.com`, as the app sends it,
 * read by the ported `parseAppleProviderProbeResponse`. Never rejects.
 */
export async function probeAppleProvider({
  apiKey,
  origin,
  fetch: fetchImpl,
  timeoutMs = APPLE_PROBE_TIMEOUT_MS,
}: AppleProbeEnvironment): Promise<AppleSignInAvailability> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const request = appleProviderProbeRequest(apiKey(), origin);
    if (!request) return "temporarilyUnavailable";
    const response = await fetchImpl(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: request.body,
      cache: "no-store",
      credentials: "omit",
      signal: controller.signal,
    });
    return parseAppleProviderProbeResponse(response.status, await response.text());
  } catch {
    // Fail closed: a network, timeout or configuration failure never turns
    // Apple on.
    return "temporarilyUnavailable";
  } finally {
    clearTimeout(timer);
  }
}
