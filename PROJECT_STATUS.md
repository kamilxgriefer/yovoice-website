# YO Voice Website — Project Status

_Last updated: September 24, 2026_

## Summary

The marketing website at yovoice.app is now feature-complete: every page
referenced from navigation or the footer exists, has real content, and
every link/CTA resolves to something real. This document tracks what
changed in this pass and what's intentionally deferred.

## Continue with Google / Apple (September 2026)

`/login` and `/register` now open with the same block the app has: "Continue
with Google" and "Continue with Apple", then "or with email". Behaviour
mirrors the app's `AuthService` on the web: Google is a popup with
`prompt=select_account`; Apple is a popup for `apple.com` with the `email` and
`name` scopes, gated by the app's `createAuthUri` availability probe (fails
closed; not configured = disabled "Coming soon", unconfirmed = "Try again",
which probes again). A first sign-in bootstraps `users/{uid}` with the same
rule-safe `planUserProfileBootstrap` transaction as email registration
(non-fatal, reported to the console); the page's signed-in redirect is held
until that write settles. An account with an authenticator gets the TOTP step
on either page. Social accounts skip `/verify-email` and go where a login
would. Errors are worded in `getSocialAuthErrorMessage` (closing the window
says nothing). The block is identical on both forms, so the mode switch keeps
it still; the desktop card is now pinned at a stable offset so it no longer
re-centres when the taller form arrives. Branding exception for the two
provider marks: `docs/design/design-system.md`, "Legal hygiene"; providers and
owner steps: `docs/security/security-notes.md`, "Sign-in providers".

Verified with `npm run lint`, `npx tsc --noEmit`, `npm test` (228 tests) and
`npm run build`, then on the production build with Playwright at 1440, 834
and 390 px (plus 320 px): every Apple probe state forced by intercepting
`createAuthUri`; the Google and Apple windows opening with the right
provider, parameters and scopes; the switch keeping the block, email,
password and submit at the same Y at t=0 in both directions (and the block
and card still after); and, with Firebase's popup plumbing stubbed, the TOTP
step after Google on both pages, the "account exists", "popup blocked" and
"window closed" outcomes, and a new account's `users/{uid}` commit (keys
inside the plan only, redirect held until it settled). Real Google / Apple
OAuth cannot be completed in that environment and was not exercised.

Owner steps (consoles, not code): Firebase Authorized domains must list
`yovoice.app` and `www.yovoice.app`; the Google provider enabled; the Apple
provider enabled with Services ID `app.yovoice.web` returning to
`https://auth.yovoice.app/__/auth/handler`.

Known gaps this makes reachable: `/account/security` still offers only
password-based "change password / change email" forms, which a Google- or
Apple-only account cannot satisfy (the deletion page already has an honest
panel for such accounts; security needs the same). At 200 % text-only zoom
on phone widths the email and password inputs (not the new block) still
force a horizontal scroll.

## Auth switch (September 2026)

`/login` and `/register` now share one animated surface: the page title said
large in the brand panel with a stylised waveform of that phrase, and a `Log in |
Create account` switch. Switching modes blurs the old title out, says the new
one letter by letter at one even size, runs a front across the waveform and
unfolds only the rows that differ, so shared fields never jump. The other auth
pages are unchanged. Rules and the documented exception:
`docs/design/design-system.md`, "Auth switch". Verified with `npm run lint`,
`npx tsc --noEmit`, `npm test`, `npm run build` and screenshots plus seeked
animation frames at 1440, 834 and 390 px; real sign-in is not exercised by
that local check (dummy Firebase config).

## Slim redesign (September 2026, branch `slim/website`)

The site now speaks the app's "Slim" visual language: presentation changed,
content and behaviour did not.

- **Tokens**: new `--radius-field`, `--radius-card`, `--live` / `--on-live`,
  `--shadow-float` and `--header-height` beside the 21 palette tokens pinned
  by `tests/design-system.test.ts`; an `@theme inline` block exposes them as
  Tailwind colour utilities.
- **Surfaces**: `.panel` (flat surface, hairline, 16 px radius) replaced the
  blurred, glowing `.glass-panel`; buttons, fields, chips and badges lost their
  gradients, glows and sheen. The hero keeps its rotators, gradient headline and
  one calm radial glow; every other section sits flat.
- **Chrome**: 56 px header, full-screen mobile menu with focus trap and scroll
  lock, four-column footer.
- **Auth and account**: one surface instead of a card in a card; one `<h1>` per
  page; alerts on the semantic status tokens with icon and label.
- **Cleanup**: removed the `.glass-panel` alias, `.glass-panel-glow`, unused
  glass/glow tokens and background textures, 17 zero-import components and
  hooks (old hero orbit/deep-space art, `ui/card|chip|badge|loader|tooltip|
  avatar-portrait`, `stats-section`, `product-experience-section` and its
  showcase/room previews) and the five scaffold SVGs from `public/`. Each was
  confirmed to have no import in `src` or `tests`; `src/lib/public-showcase.ts`,
  `hooks/use-public-stats.ts` and `public/logos/yovoice-logo.png` (linked from
  Firebase emails) stay.
- Rules live in `docs/design/design-system.md` ("Slim rules", "Legal
  hygiene").

## What shipped this pass

### Navigation & footer
- Top nav and footer previously pointed at homepage-only anchors
  (`#experience`, `#community`, etc.) or `mailto:` placeholders. They now
  route to real pages everywhere on the site, not just the homepage.
- The header's global "Download" CTA (desktop + mobile menu) had the same
  anchor bug — fixed to route to `/download`.
- Fixed `<header>`/`<footer>` being nested inside `<main>` across every
  layout (marketing, homepage, account) — invalid landmark structure that
  breaks screen-reader navigation.
- Removed ~20 confirmed-dead, zero-import scaffold files (empty
  `components/ui/*`, `config/*`, `constants/*`, `lib/downloads/*` stubs).

### Pages built from scratch
These routes previously had an empty directory (`.gitkeep` only, no
`page.tsx` — a 404 in production). All now have real, product-accurate
content, SEO metadata, and are in `sitemap.xml`:

- **Legal**: Privacy, Terms, Cookies — grounded in the app's actual data
  practices (Firebase, LiveKit, Resend, no ad tracking today).
- **Support**: FAQ (working accordion), Help Center, Safety, Status,
  Contact.
- **Company**: About, Roadmap, Careers.
- **Product**: Features, Community, Clubs, Achievements — Achievements
  content is grounded in the real 10-track / 6-tier catalog
  (`lib/features/achievements/data/achievement_catalog.dart`) in the
  Flutter app, not invented copy.

`/download` already existed and was extended rather than rebuilt (see
below).

### Download flow
- **Desktop**: Download → Login/Register → Verify email → Download. The
  page now also checks `emailVerified`, not just auth — previously an
  unverified account could reach installer links.
- **Mobile**: Download → App Store / Google Play status ("Coming soon") —
  no login required. Detected client-side via `useIsMobile`
  (`useSyncExternalStore` over `navigator.userAgent`); previously mobile
  visitors hit the same login wall as desktop.
- Fixed Login ↔ Register cross-links dropping the `?redirect=` param —
  previously, a visitor who needed to register (not just log in) at the
  download gate lost their way back to `/download` after verifying.

### Other
- Added a real `/api/health` endpoint; the Status page does a live
  client-side check against it rather than showing fabricated uptime
  numbers.
- Added a branded 404 page (previously the bare Next.js default).
- `sitemap.ts` only listed 4 routes — now lists all public pages.

## Known limitations / honest gaps

- **Contact form**: uses `mailto:` links, not a backend-processed form —
  there's no email-sending infrastructure wired into the website (the
  Resend integration that exists is Firebase Auth's transactional email,
  not a general API key this site can use). Revisit if/when a proper
  support inbox or ticketing flow is wanted.
- **In-app abuse reporting**: doesn't exist yet in the Flutter app (only
  blocking does). The Safety page is explicit about this and gives a real
  email-based reporting path instead of pretending a report button exists.
- **Careers**: no open roles — page says so honestly rather than listing
  fake jobs.
- **Social links**: the footer's destinations live in `siteConfig.social`
  (`src/config/site.ts`). GitHub, Instagram (`@yovoice.app`) and
  `hello@yovoice.app` are real. LinkedIn has no company page yet, so
  `social.linkedin` is unset and the footer renders no LinkedIn icon at all
  — the old `https://www.linkedin.com/` placeholder is gone rather than
  pointing people at LinkedIn's front page. Set the field to bring the icon
  back the day the page exists.
- **`app.yovoice.app` DNS**: live and canonical. The website launch route
  normalizes legacy Firebase Hosting origins to `https://app.yovoice.app`.
- **Blog**: `src/app/(marketing)/blog/` is still an empty directory. Not
  linked from anywhere, so it isn't a broken link — just genuinely out of
  scope for this pass (wasn't in the requested page list).

## Verified

- `npm run lint` and `npm run build` clean after every milestone.
- Manually walked the site in a real browser: homepage, every new page,
  footer/nav link-by-link, FAQ accordion interaction, Status page live
  check, legal page table-of-contents anchors, mobile viewport rendering,
  and both download-flow branches (desktop gated on verification; mobile
  bypassing the gate entirely) using a real unverified test account.

## Deferred (explicit "future roadmap" per prior instruction)

Not touched in this pass — Flutter app UI-consistency pass, micro-
animations/premium polish, full accessibility pass, dark-theme polish,
icon/illustration replacement, premium onboarding flow, "App Store launch
readiness" pass. These remain queued until explicitly re-raised.
