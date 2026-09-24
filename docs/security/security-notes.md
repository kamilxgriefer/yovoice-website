# Website security notes

Last reviewed: 2026-09-24 (sign-in providers; popup handler domain)

## Dependency baseline

The production dependency tree is currently verified with:

```bash
npm ci --ignore-scripts
npm audit --omit=dev --audit-level=high
npm test
npm run lint
npm run build
```

The September 2026 dependency pass moved Next.js and its matching ESLint
configuration from 16.2.12 to 16.3.4. This stays within the existing Next.js
major and follows the active-LTS security line. It resolves these transitive
paths without a force install or broad override:

- `next -> postcss`: 8.4.31 to 8.5.23, clearing the source-map path traversal
  and CSS-stringification advisories.
- `next -> sharp`: 0.34.5 to 0.35.4, clearing the inherited libvips advisory.
- `next/@tailwindcss -> postcss -> nanoid`: the shared resolution is pinned by
  the lockfile at 3.3.18, clearing the zero-size custom-generator loop advisory.

`eslint-config-next` remains exactly aligned with the installed Next.js
version. `package-lock.json` is authoritative and must be committed together
with `package.json`; deployment should use `npm ci` rather than recomputing the
tree with `npm install`.

## Install-script boundary

Only reviewed native packages listed in `package.json#allowScripts` may run
install scripts. Do not approve a new package merely to silence an install
warning: inspect the exact package version, script and release provenance first.
The application build does not currently require the pending Firebase Util or
protobufjs postinstall scripts.

## Ongoing checks

- Keep Next.js and `eslint-config-next` on the same patch version.
- Run the production audit and full test/lint/build chain before every website
  release.
- Treat a zero-result dependency audit as one control, not a complete security
  guarantee; Firebase rules, environment configuration and platform headers
  require independent review.

## Browser response baseline

All routes now declare the following low-risk response controls through
`next.config.ts`:

- `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`;
- `Referrer-Policy: strict-origin-when-cross-origin`, tightened to `no-referrer`
  on Firebase action-code pages;
- two-year HSTS on the marketing origin. Subdomain inclusion remains a DNS and
  infrastructure release decision rather than being assumed by application
  source;
- a restrictive Permissions Policy. The marketing/account website itself does
  not request camera, microphone, location or sensor access;
- a `Content-Security-Policy-Report-Only` baseline that names the current
  Firebase, Google/Apple Auth and Stripe boundaries.

The CSP is intentionally not enforcing yet. Firebase provider popups and
Stripe account/payment hand-offs require production violation telemetry before
`Content-Security-Policy-Report-Only` can safely become
`Content-Security-Policy`. This staging choice is a release gate, not a claim
that CSP enforcement is already active.

## Sign-in providers

`/login` and `/register` sign in with email and password, Google or Apple,
all through Firebase Authentication on the shared project, mirroring the
app's `AuthService` on the web:

- **Google**: `GoogleAuthProvider` with `prompt=select_account`,
  `signInWithPopup`.
- **Apple**: `OAuthProvider('apple.com')` with the `email` and `name` scopes,
  `signInWithPopup`, gated by the same probe the app uses (`POST
  identitytoolkit.googleapis.com/v1/accounts:createAuthUri` for `apple.com`
  with this page's origin as `continueUri`, parsed by
  `parseAppleProviderProbeResponse` in `src/lib/auth/social-sign-in.ts`;
  cached per tab by `src/lib/auth/apple-availability-cache.ts`).
  The probe fails closed: only an https `appleid.apple.com` authorisation URL
  for `apple.com` enables the button; `OPERATION_NOT_ALLOWED` shows it
  unavailable as "Coming soon"; anything else (network, timeout, quota, an
  origin Firebase does not accept, which answers `INVALID_CONTINUE_URI`)
  shows "Couldn't check — try again", which probes again before opening
  Apple's window.
- **Where the popups finish.** The SDK's `authDomain` is always the project's
  Firebase handler domain, `<projectId>.firebaseapp.com` — in production
  `https://yovoice-ec54a.firebaseapp.com/__/auth/handler` — derived in
  `src/lib/firebase/auth-domain.ts`. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is no
  longer read. On 2026-09-24 a `createAuthUri` for Google with
  `continueUri=https://auth.yovoice.app/__/auth/handler` led Google to
  `/signin/oauth/error` with `redirect_uri_mismatch`, while the
  `firebaseapp.com` handler reached Google's account chooser: a Firebase
  authorized domain is not automatically a registered OAuth redirect URI. The
  app hit the same error on Flutter Web and moved to the same handler (app
  repository: `docs/Bugs.md`, "Google Sign-In on Flutter Web returned Google
  error 400 redirect_uri_mismatch"; `docs/Decisions.md`, ADR-068). Password
  sign-in and the emailed action links never use the client's `authDomain`,
  so they are unaffected. The branded domain can become the handler only
  after its exact `/__/auth/handler` URL is registered on Google's OAuth
  client and Apple's Services ID and proven with a real sign-in; that change
  is made in `auth-domain.ts` and the CSP `frame-src`, not in an environment
  variable.
- Popups only, as the app does on the web; there is no `signInWithRedirect`
  path. The popup is the first thing started after the click, so pop-up
  blockers let it through (the one exception is Apple's "try again", which
  probes before opening; a browser that then blocks the window gets the
  "allow pop-ups" message, and the next press opens it directly).
- One attempt at a time per tab (`src/lib/auth/social-sign-in-flow.ts`). It
  outlives a switch between Log in and Create account: the form on screen
  when it settles shows its second-factor step or error, and a completed
  sign-in is navigated by that page's `RedirectIfAuthenticated`, once, with
  that page's `?redirect=` (always re-validated by `resolveAuthRedirect`).
  With no auth form on screen the outcome is dropped.
- A second factor is enforced the same way as for passwords: a
  `multi-factor-auth-required` result leads to the TOTP challenge on either
  page; SMS is never offered.
- A first sign-in (`getAdditionalUserInfo(result).isNewUser`) writes
  `users/{uid}` through the same `planUserProfileBootstrap` transaction as
  email registration, so it can only write keys inside the app's
  `userCreateAllowed` / owner-update allowlists. A refused write is logged
  and does not undo the sign-in; the app completes a missing profile on first
  open. The page's "already signed in" redirect is held
  (`src/lib/auth/signed-in-redirect-hold.ts`) until that write settles, so
  the `/app` hand-off (a full-page `location.replace`) cannot cut it off.
- The Report-Only CSP above names what these flows load: gapi from
  `apis.google.com` (`script-src`), the SDK's `/__/auth/iframe` on
  `https://yovoice-ec54a.firebaseapp.com` (`frame-src`) and the Identity
  Toolkit calls on `*.googleapis.com` (`connect-src`). The provider window
  itself is a new window, which CSP does not govern. `auth.yovoice.app` was
  removed from the policy: the page no longer loads anything from it.
- `/account/security` offers password and email changes only to an account
  with a password; a Google- or Apple-only account is told it has no YO Voice
  password and is given the support route for an email change (the
  deletion page does the same for deletion).

### Pre-registered addresses (decision, 2026-09-24)

Firebase keeps one account per email address on this project, and anyone can
register an address with a password before its owner ever uses YO Voice.
That account stays unverified, because only the owner can open the
verification email.

Decision: rely on Firebase's documented behaviour for a provider that is
authoritative for the address (Google, for Gmail and Google Workspace
addresses). When the owner signs in with Google, Google's verified identity
takes the account over and Firebase unlinks the unverified password, so the
pre-registrant's password stops working. The website adds no linking flow of
its own and never offers "multiple accounts per email".

- Unverified password accounts exist only until their address is verified:
  every email registration, here and in the app, sends a verification email
  and lands on `/verify-email`. The takeover protection above applies in that
  window only; a verified password is treated as the address owner's.
- Apple is not authoritative (its addresses can be private relays), so an
  Apple sign-in for an address that already has an account is refused with
  `auth/account-exists-with-different-credential`; the form tells the visitor
  to use the password or the method they created the account with. The same
  applies to Google for addresses Google is not authoritative for.
- Residual risk, accepted: whatever the pre-registrant wrote under that
  account before the takeover (for example a display name in `users/{uid}`)
  stays with it, and this repository does not rely on Firebase ending a
  session the pre-registrant already holds. An owner who follows the
  verification link of an account they did not create verifies the
  pre-registrant's password, which Google sign-in then no longer replaces. If
  either ever needs closing, it belongs server-side (for example revoking the
  account's refresh tokens when a password credential is unlinked), not in
  this website.

Owner configuration (Firebase / Google / Apple consoles; nothing in this
repository can change it):

1. Firebase Console > Authentication > Settings > Authorized domains lists
   `yovoice.app` and `www.yovoice.app` (a Vercel preview origin is not
   listed, so provider sign-in fails there by design: Google reports "not
   available right now", Apple shows "Couldn't check — try again"). On
   2026-09-24 the production `createAuthUri` accepted both origins as
   `continueUri` and rejected an unlisted one, which indicates they are
   listed; confirm in the console.
2. Google provider enabled (Authentication > Sign-in method). Its OAuth web
   client already accepts `https://yovoice-ec54a.firebaseapp.com/__/auth/handler`
   (checked 2026-09-24: it reaches the account chooser); the website needs no
   new redirect URI.
3. Apple provider enabled with the Services ID `app.yovoice.web`, whose
   Return URLs include the Firebase callback
   `https://yovoice-ec54a.firebaseapp.com/__/auth/handler` (registered for the
   app, per its `docs/Bugs.md`). The website uses that same callback, so
   Apple needs no new return URL.
4. Optional clean-up: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` can be deleted from
   Vercel; it is ignored.

A real Google and Apple sign-in on production (new account and returning
account) remains the release evidence: automated checks stub Firebase's popup
plumbing and cannot complete OAuth.
