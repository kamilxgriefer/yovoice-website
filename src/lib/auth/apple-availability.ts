import { getFirebaseApp } from "@/lib/firebase/config";
import {
  APPLE_PROBE_TIMEOUT_MS,
  appleProviderProbeRequest,
  parseAppleProviderProbeResponse,
  type AppleSignInAvailability,
} from "@/lib/auth/social-sign-in";

/**
 * Whether "Continue with Apple" can start, asked once per tab like the app's
 * `AuthService.getAppleSignInAvailability`.
 *
 * A configuration answer (available / not configured) is kept for the tab, so
 * Log in and Create account draw the same button the moment they mount and
 * the switch between them never changes its height. A temporary failure is
 * remembered for drawing too, but the next request probes again: pressing the
 * "Try again" button is that request.
 */
let probe: Promise<AppleSignInAvailability> | null = null;
let settled: AppleSignInAvailability | null = null;

/** The last answer, without asking. `null` before the first probe settles
 * (and always on the server, which never probes). */
export function peekAppleSignInAvailability(): AppleSignInAvailability | null {
  return settled;
}

export function getAppleSignInAvailability(): Promise<AppleSignInAvailability> {
  const current = (probe ??= probeAppleProvider());
  return current.then((availability) => {
    settled = availability;
    // A timeout or offline answer is not configuration state (as in the app).
    if (availability === "temporarilyUnavailable" && probe === current) probe = null;
    return availability;
  });
}

async function probeAppleProvider(): Promise<AppleSignInAvailability> {
  if (typeof window === "undefined") return "temporarilyUnavailable";
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), APPLE_PROBE_TIMEOUT_MS);
  try {
    // Throws when Firebase is not configured in this environment.
    const request = appleProviderProbeRequest(
      getFirebaseApp().options.apiKey,
      window.location.origin,
    );
    if (!request) return "temporarilyUnavailable";
    const response = await fetch(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: request.body,
      cache: "no-store",
      credentials: "omit",
      signal: controller.signal,
    });
    return parseAppleProviderProbeResponse(response.status, await response.text());
  } catch {
    // Fail closed: a network or configuration failure never turns Apple on.
    return "temporarilyUnavailable";
  } finally {
    window.clearTimeout(timer);
  }
}
