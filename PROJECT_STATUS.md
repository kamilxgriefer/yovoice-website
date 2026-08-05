# YO Voice Website — Project Status

_Last updated: August 5, 2026_

## Summary

The marketing website at yovoice.app is now feature-complete: every page
referenced from navigation or the footer exists, has real content, and
every link/CTA resolves to something real. This document tracks what
changed in this pass and what's intentionally deferred.

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
- **Social links**: LinkedIn and Instagram footer icons still point to
  generic placeholder URLs (`linkedin.com/`, `instagram.com/`), not real
  company profiles — explicitly deferred by request, not forgotten.
- **`app.yovoice.app` DNS**: not live yet; `getAppUrl()` falls back to
  `https://yovoice-ec54a.web.app`. Switching later is an env var change
  (`NEXT_PUBLIC_APP_URL`), not a code change.
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
