export const CANONICAL_APP_URL = "https://app.yovoice.app";

const LEGACY_FIREBASE_APP_URLS = new Set([
  "https://yovoice-ec54a.web.app",
  "https://yovoice-ec54a.firebaseapp.com",
]);

/**
 * Keeps preview/custom deployments configurable while permanently migrating
 * the old Firebase Hosting origins to the public YO Voice app domain. This
 * also protects production if a stale Vercel environment variable is still
 * present during the rollout.
 */
export function resolveConfiguredAppUrl(configuredUrl?: string): string {
  const normalized = configuredUrl?.trim().replace(/\/+$/, "");
  if (!normalized || LEGACY_FIREBASE_APP_URLS.has(normalized)) {
    return CANONICAL_APP_URL;
  }
  return normalized;
}

const APP_URL = resolveConfiguredAppUrl(process.env.NEXT_PUBLIC_APP_URL);

const CAMPAIGN_QUERY_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
]);

/**
 * Carries only campaign attribution through the marketing-site hand-off.
 * The allowlist prevents unrelated or sensitive query parameters from being
 * forwarded to the application origin.
 */
export function buildAppHandoffUrl(
  appUrl: string,
  sourceSearch: string,
): string {
  const destination = new URL(appUrl);
  const source = new URLSearchParams(sourceSearch);

  for (const [key, value] of source) {
    if (CAMPAIGN_QUERY_KEYS.has(key) && value) {
      destination.searchParams.set(key, value);
    }
  }

  return destination.toString();
}

/**
 * The on-site launch route. It plays the entry transition, waits on real
 * initialization, then hands off to {@link getAppUrl}. Every "open YO Voice"
 * affordance on this site points here — the app origin is navigated to from
 * exactly one place, so the hand-off is consistent and never flashes white.
 */
export const APP_ENTRY_PATH = "/app";
export const ACCOUNT_ENTRY_PATH = "/account/profile";

/**
 * A launch intent must never be satisfied by authenticating on the marketing
 * origin first. Firebase Auth persistence is origin-scoped, so a website
 * session cannot authenticate the separate app.yovoice.app origin. Sending
 * this intent straight to /app makes the application own the only login.
 */
export function isAppLaunchRedirect(
  redirectParam: string | string[] | null | undefined,
): boolean {
  return typeof redirectParam === "string" && redirectParam === APP_ENTRY_PATH;
}

/**
 * `redirect` query param on /login, /register etc. Any same-site relative
 * path is honoured ("/download", "/app"); anything that isn't one
 * (protocol-relative "//host", absolute URLs) is rejected to avoid an open
 * redirect and falls back to the account portal, as does a missing param.
 *
 * Always returns a same-site path — callers can route it with the Next
 * router and never need a `location.href` branch.
 */
export function resolveAuthRedirect(redirectParam: string | null): string {
  if (!redirectParam) return ACCOUNT_ENTRY_PATH;
  // A prefix check alone is not enough: browsers normalize backslashes in
  // http(s) URLs, so "/\evil.com" resolves off-site even though it starts
  // with a single "/". Parse against a fixed base and require that the
  // candidate stays on that origin and still reads back as a plain path.
  if (redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
    let resolved: URL;
    try {
      resolved = new URL(redirectParam, "https://relative.invalid");
    } catch {
      return ACCOUNT_ENTRY_PATH;
    }
    if (
      resolved.origin === "https://relative.invalid" &&
      !redirectParam.includes("\\") &&
      resolved.pathname.startsWith("/")
    ) {
      return redirectParam;
    }
  }
  return ACCOUNT_ENTRY_PATH;
}

/**
 * The real application origin. Link to {@link APP_ENTRY_PATH} instead unless
 * you *are* the launch route — that's what puts the transition in front of
 * the hand-off.
 */
export function getAppUrl(): string {
  return APP_URL;
}
