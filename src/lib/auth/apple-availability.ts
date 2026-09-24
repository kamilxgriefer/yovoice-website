import { getFirebaseApp } from "@/lib/firebase/config";
import {
  createAppleAvailabilityCache,
  probeAppleProvider,
} from "@/lib/auth/apple-availability-cache";

/**
 * The tab's one Apple availability cache (rules and probe:
 * apple-availability-cache.ts). The server never probes: it only ever draws
 * "still checking".
 */
const cache = createAppleAvailabilityCache(() =>
  typeof window === "undefined"
    ? Promise.resolve("temporarilyUnavailable")
    : probeAppleProvider({
        // Throws when Firebase is not configured in this environment, which
        // the probe reads as "temporarily unavailable".
        apiKey: () => getFirebaseApp().options.apiKey,
        origin: window.location.origin,
        fetch: window.fetch.bind(window),
      }),
);

export const peekAppleSignInAvailability = cache.peek;
export const getAppleSignInAvailability = cache.get;
export const subscribeAppleSignInAvailability = cache.subscribe;
