const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://yovoice-ec54a.web.app";

/**
 * `redirect` query param on /login, /register etc. Internal paths (e.g.
 * "/download") stay on this site; "/app" (or no param at all) sends the user
 * to the actual YO Voice web app. Anything that isn't a same-site relative
 * path (protocol-relative "//host", absolute URLs) is rejected to avoid an
 * open redirect and falls back to the app.
 */
export function resolveAuthRedirect(redirectParam: string | null): string {
  if (!redirectParam) return APP_URL;
  if (redirectParam === "/app" || redirectParam.startsWith("/app/")) return APP_URL;
  if (redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
    return redirectParam;
  }
  return APP_URL;
}

export function getAppUrl(): string {
  return APP_URL;
}
