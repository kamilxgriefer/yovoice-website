/**
 * The Firebase Web SDK's `authDomain`: the host whose `/__/auth/handler`
 * finishes every Google and Apple popup and whose `/__/auth/iframe` the SDK
 * frames to receive the result.
 *
 * It is always the project's default Firebase Hosting domain,
 * `<projectId>.firebaseapp.com`, never the branded `auth.yovoice.app`:
 *
 * - Google only redirects to OAuth redirect URIs registered on the project's
 *   OAuth client. Firebase registers its own handler
 *   (`https://yovoice-ec54a.firebaseapp.com/__/auth/handler`), which reaches
 *   Google's account chooser; `https://auth.yovoice.app/__/auth/handler` is
 *   not registered and ends in Google's `redirect_uri_mismatch` error page
 *   (checked on 2026-09-24 through `accounts:createAuthUri`). Being a Firebase
 *   authorized domain does not make a host a registered redirect URI.
 * - The YO Voice app hit the same error on Flutter Web and moved to this
 *   handler (app repository: docs/Bugs.md, "Google Sign-In on Flutter Web
 *   returned Google error 400 redirect_uri_mismatch"; docs/Decisions.md,
 *   ADR-068). Apple's Services ID `app.yovoice.web` returns to this Firebase
 *   callback as well.
 *
 * Deriving it from the project id keeps production correct without a manual
 * Vercel edit: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is no longer read. Password
 * sign-in and the emailed action links never use the client's authDomain,
 * so they are unaffected.
 *
 * Kept free of Firebase and path-alias imports so `node --test` can load it.
 */
export function firebaseAuthDomain(
  projectId: string | null | undefined,
): string | undefined {
  const id = projectId?.trim();
  return id ? `${id}.firebaseapp.com` : undefined;
}
