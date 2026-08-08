/**
 * Validation for the `continueUrl` / `redirect` values that ride along on
 * Firebase auth action links.
 *
 * These arrive as query parameters on a page a user reaches from an email,
 * which makes them a textbook open-redirect vector: anyone can craft
 * `.../auth/action?...&continueUrl=https://evil.example` and mail it out —
 * the domain in the address bar would be ours while the post-action
 * "Continue" button walks the victim somewhere else. Firebase itself only
 * enforces that continueUrl's domain is authorized *when it generates
 * links*; nothing enforces it on arbitrary URLs pasted into our pages, so
 * we allowlist explicitly and fall back to a safe default.
 */

const ALLOWED_HOSTS = new Set([
  "yovoice.app",
  "www.yovoice.app",
  "app.yovoice.app",
  // The Flutter web app's current production origin (app.yovoice.app is
  // planned but its DNS isn't live yet — see the app repo's Roadmap).
  "yovoice-ec54a.web.app",
  "yovoice-ec54a.firebaseapp.com",
]);

/**
 * Returns a destination that is safe to navigate to after an auth action:
 * either a same-site relative path, or an absolute https URL whose host is
 * allowlisted. Anything else — protocol-relative `//evil.example`,
 * `javascript:` URIs, unknown hosts, malformed input — yields null so the
 * caller can use its own default.
 */
export function safeContinueUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (value.length === 0 || value.length > 2048) return null;

  // Same-site relative path. Reject protocol-relative ("//host") and
  // backslash tricks ("/\host"), which browsers treat as authority-form.
  if (value.startsWith("/")) {
    if (value.startsWith("//") || value.startsWith("/\\")) return null;
    return value;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (!ALLOWED_HOSTS.has(parsed.hostname)) return null;
  // Credentials embedded in a URL ("https://user:pass@host") are never
  // legitimate here and are a classic look-alike trick.
  if (parsed.username || parsed.password) return null;

  return parsed.toString();
}
