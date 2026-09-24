# Website security notes

Last reviewed: 2026-09-24 (sign-in providers)

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
  `parseAppleProviderProbeResponse` in `src/lib/auth/social-sign-in.ts`).
  The probe fails closed: only an https `appleid.apple.com` authorisation URL
  for `apple.com` enables the button; `OPERATION_NOT_ALLOWED` shows it
  disabled as "Coming soon"; anything else (network, quota, an origin
  Firebase does not accept, which answers `INVALID_CONTINUE_URI`) shows
  "Try again", which probes again before opening Apple's window.
- Popups only, as the app does on the web; there is no `signInWithRedirect`
  path. The popup is the first thing awaited after the click, so pop-up
  blockers let it through (the one exception is Apple's "Try again", which
  probes before opening; a browser that then blocks the window gets the
  "allow pop-ups" message, and the next press opens it directly).
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
- The Report-Only CSP above already names every host these flows use
  (`*.googleapis.com`, `auth.yovoice.app`, `accounts.google.com`,
  `appleid.apple.com`, `apis.google.com`).

Owner configuration (Firebase / Apple consoles; nothing in this repository
can change it):

1. Firebase Console > Authentication > Settings > Authorized domains lists
   `yovoice.app` and `www.yovoice.app` (a Vercel preview origin is not
   listed, so provider sign-in fails there by design: Google reports "not
   available right now", Apple shows "Try again"). On 2026-09-24 the
   production `createAuthUri` accepted both origins as `continueUri` and
   rejected an unlisted one, which indicates they are listed; confirm in the
   console.
2. Google provider enabled (Authentication > Sign-in method).
3. Apple provider enabled with the Services ID `app.yovoice.web`, whose
   Return URLs include `https://auth.yovoice.app/__/auth/handler` — the
   handler of the website's `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`. If that
   variable ever points elsewhere, that domain's `/__/auth/handler` must be
   added in Apple's console as well.
