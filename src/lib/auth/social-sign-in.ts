/**
 * Google and Apple sign-in on the website: the provider contract the YO Voice
 * app already uses (lib/features/auth/data/auth_service.dart), minus Firebase.
 *
 * - Google on the web is a popup with `prompt=select_account`, so a visitor
 *   with several Google accounts always chooses one.
 * - Apple is a popup for `apple.com` with the `email` and `name` scopes, gated
 *   by an availability probe (`accounts:createAuthUri`) so a provider that is
 *   not configured in Firebase is shown as "Coming soon" instead of a button
 *   that can only fail. The probe fails closed: nothing but a genuine Apple
 *   authorisation URL turns the button on.
 *
 * Kept free of Firebase and path-alias imports so `node --test` can load it.
 */

export type SocialProvider = "google" | "apple";

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = ["google", "apple"];

/** The provider's own name, as its branding rules require on the button. */
export const SOCIAL_PROVIDER_NAME: Record<SocialProvider, string> = {
  google: "Google",
  apple: "Apple",
};

export const SOCIAL_BUTTON_LABEL: Record<SocialProvider, string> = {
  google: "Continue with Google",
  apple: "Continue with Apple",
};

export const GOOGLE_CUSTOM_PARAMETERS = Object.freeze({ prompt: "select_account" });

export const APPLE_PROVIDER_ID = "apple.com";
export const APPLE_SCOPES: readonly string[] = ["email", "name"];

/** Same budget as the app's probe. */
export const APPLE_PROBE_TIMEOUT_MS = 6000;

export type AppleSignInAvailability =
  | "available"
  | "notConfigured"
  | "temporarilyUnavailable";

/**
 * The request the app sends to learn whether Firebase can start an Apple
 * OAuth flow for this origin. `null` when there is no API key to ask with,
 * which the caller treats as temporarily unavailable (as the app does).
 */
export function appleProviderProbeRequest(
  apiKey: string | null | undefined,
  continueUri: string,
): { url: string; body: string } | null {
  const key = apiKey?.trim();
  if (!key) return null;
  const url = new URL("https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri");
  url.searchParams.set("key", key);
  return {
    url: url.toString(),
    body: JSON.stringify({ providerId: APPLE_PROVIDER_ID, continueUri }),
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Port of the app's `parseAppleProviderProbeResponse`.
 *
 * - 200 with an https `appleid.apple.com` authorisation URL for `apple.com`:
 *   available.
 * - 400 whose error message starts with `OPERATION_NOT_ALLOWED`: the provider
 *   is switched off in Firebase, so the button reads "Coming soon".
 * - Anything else (network, quota, malformed JSON, an unexpected URL, an
 *   origin Firebase does not accept): temporarily unavailable. That never
 *   enables sign-in by itself; the button re-probes when it is pressed.
 */
export function parseAppleProviderProbeResponse(
  statusCode: number,
  responseBody: string,
): AppleSignInAvailability {
  let decoded: unknown;
  try {
    decoded = JSON.parse(responseBody);
  } catch {
    return "temporarilyUnavailable";
  }
  if (!isPlainObject(decoded)) return "temporarilyUnavailable";

  if (statusCode === 200) {
    const { authUri, providerId } = decoded;
    if (typeof authUri !== "string" || providerId !== APPLE_PROVIDER_ID) {
      return "temporarilyUnavailable";
    }
    let parsed: URL;
    try {
      parsed = new URL(authUri);
    } catch {
      return "temporarilyUnavailable";
    }
    return parsed.protocol === "https:" && parsed.hostname === "appleid.apple.com"
      ? "available"
      : "temporarilyUnavailable";
  }

  const error = decoded.error;
  const message = isPlainObject(error) && typeof error.message === "string" ? error.message : "";
  if (statusCode === 400 && message.startsWith("OPERATION_NOT_ALLOWED")) {
    return "notConfigured";
  }
  return "temporarilyUnavailable";
}

export const APPLE_STATUS = Object.freeze({
  checking: "Checking…",
  notConfigured: "Coming soon",
  // Says what failed (the check, not the visitor) and what pressing does.
  temporarilyUnavailable: "Couldn't check — try again",
} as const);

export type AppleButtonState = {
  /** The probe has not answered yet: a spinner in place of the mark. */
  pending: boolean;
  /** Pressing the button does nothing (probe pending or not configured). It
   * stays focusable (`aria-disabled`), so its status is still read out. */
  unavailable: boolean;
  /** Second, smaller line under the provider name; part of the button's
   * accessible name. */
  status: (typeof APPLE_STATUS)[keyof typeof APPLE_STATUS] | null;
  /** Pressing the button probes again before opening the popup. */
  reprobes: boolean;
};

/** The Apple button for each probe outcome, as the app's `_ProviderSection`
 * draws it (with the app's second line). `null` means the probe is still
 * running. */
export function appleButtonState(
  availability: AppleSignInAvailability | null,
): AppleButtonState {
  switch (availability) {
    case null:
      return { pending: true, unavailable: true, status: APPLE_STATUS.checking, reprobes: false };
    case "notConfigured":
      return { pending: false, unavailable: true, status: APPLE_STATUS.notConfigured, reprobes: false };
    case "temporarilyUnavailable":
      return { pending: false, unavailable: false, status: APPLE_STATUS.temporarilyUnavailable, reprobes: true };
    case "available":
      return { pending: false, unavailable: false, status: null, reprobes: false };
  }
}

/** The busy button's second line while an attempt runs (shown, and spoken
 * through the block's polite status region rather than the button's name). */
export function socialProgressLabel(
  provider: SocialProvider,
  step: "checking" | "waiting" | "signed-in",
): string {
  switch (step) {
    case "checking":
      return APPLE_STATUS.checking;
    case "waiting":
      return `Waiting for ${SOCIAL_PROVIDER_NAME[provider]}…`;
    case "signed-in":
      return "Continuing…";
  }
}

/** What the block's polite status region says as an attempt moves on. Errors
 * are not here: they go to the form's alert, like every other form error. */
export const SOCIAL_ANNOUNCEMENT = Object.freeze({
  checking: (provider: SocialProvider) =>
    `Checking whether ${SOCIAL_PROVIDER_NAME[provider]} sign-in is available…`,
  waiting: (provider: SocialProvider) => `Waiting for ${SOCIAL_PROVIDER_NAME[provider]}…`,
  cancelled: (provider: SocialProvider) => `${SOCIAL_PROVIDER_NAME[provider]} sign-in cancelled.`,
  ready: (provider: SocialProvider) =>
    `${SOCIAL_PROVIDER_NAME[provider]} sign-in is available. Press Continue with ${SOCIAL_PROVIDER_NAME[provider]} again.`,
  signedIn: (provider: SocialProvider) =>
    `Signed in with ${SOCIAL_PROVIDER_NAME[provider]}. Continuing…`,
});

const SOCIAL_PROVIDER_BY_FIREBASE_ID: Readonly<Record<string, SocialProvider>> = {
  "google.com": "google",
  [APPLE_PROVIDER_ID]: "apple",
};

/** The Google / Apple identities linked to an account (Firebase
 * `providerData`), in button order. */
export function socialProvidersOf(
  providerData: readonly { providerId: string }[] | null | undefined,
): SocialProvider[] {
  const linked = new Set(
    (providerData ?? []).map((entry) => SOCIAL_PROVIDER_BY_FIREBASE_ID[entry.providerId]),
  );
  return SOCIAL_PROVIDERS.filter((provider) => linked.has(provider));
}

/** Thrown when a re-probe still cannot confirm Apple; worded by
 * `getSocialAuthErrorMessage` as "not available right now". */
/** A re-check found the provider available. The attempt ends here instead of
 * opening the provider's window: after a network wait the click no longer
 * counts as a user gesture, so browsers would block the pop-up. */
export class SocialProviderReadyError extends Error {
  readonly code = "yovoice/provider-ready";
  readonly provider: SocialProvider;

  constructor(provider: SocialProvider) {
    super(`${SOCIAL_PROVIDER_NAME[provider]} sign-in is available.`);
    this.provider = provider;
    this.name = "SocialProviderReadyError";
  }
}

export class SocialProviderUnavailableError extends Error {
  readonly code = "auth/provider-unavailable";

  constructor(provider: SocialProvider) {
    super(`${SOCIAL_PROVIDER_NAME[provider]} sign-in is not available right now.`);
    this.name = "SocialProviderUnavailableError";
  }
}
