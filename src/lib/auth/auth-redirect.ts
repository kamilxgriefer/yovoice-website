const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://yovoice-ec54a.web.app";

/**
 * The on-site launch route. It plays the entry transition, waits on real
 * initialization, then hands off to {@link getAppUrl}. Every "open YO Voice"
 * affordance on this site points here — the app origin is navigated to from
 * exactly one place, so the hand-off is consistent and never flashes white.
 */
export const APP_ENTRY_PATH = "/app";

/**
 * `redirect` query param on /login, /register etc. Any same-site relative
 * path is honoured ("/download", "/app"); anything that isn't one
 * (protocol-relative "//host", absolute URLs) is rejected to avoid an open
 * redirect and falls back to the launch route, as does a missing param.
 *
 * Always returns a same-site path — callers can route it with the Next
 * router and never need a `location.href` branch.
 */
export function resolveAuthRedirect(redirectParam: string | null): string {
  if (!redirectParam) return APP_ENTRY_PATH;
  if (redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
    return redirectParam;
  }
  return APP_ENTRY_PATH;
}

/**
 * The real application origin. Link to {@link APP_ENTRY_PATH} instead unless
 * you *are* the launch route — that's what puts the transition in front of
 * the hand-off.
 */
export function getAppUrl(): string {
  return APP_URL;
}
