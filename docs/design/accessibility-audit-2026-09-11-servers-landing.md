# Accessibility review — Build 26 website surfaces

Standard: WCAG 2.2 AA  
Reviewed: 2026-09-13  
Status: local branch `codex/build-26-website-sync`; not committed or published

## Scope

The review covers the rebuilt homepage and `/servers` experience:

- `src/components/servers/servers-landing.tsx`
- `src/components/servers/server-explorer.tsx`
- `src/components/servers/servers-landing.module.css`
- `src/components/sections/build-26-experience.tsx`
- `src/components/sections/build-26-experience.module.css`
- the Build 26 release, Premium and notification-preference wording exposed
  from those journeys

The production build was inspected in Chrome at the default 1430 px viewport,
390 x 844 and 320 x 568. Source checks, the browser accessibility tree,
keyboard interaction, rendered images, console output and horizontal reflow
were reviewed. No screen reader, real browser zoom, forced-colors session or
physical touch device was used.

## Result

No P0, P1 or P2 issues were found in the reviewed Build 26 surfaces. The
following checks passed:

- One `main` landmark, one page `h1`, ordered section headings, a working
  skip link and labelled navigation.
- Both selectors use `tablist`, `tab` and `tabpanel`, with
  `aria-controls`, `aria-labelledby`, `aria-selected`, roving
  `tabIndex` and visible focus.
- Arrow keys wrap between choices; Home and End move to the first and last
  tab. Browser verification confirmed End selects Company and Yeels and
  exposes the matching panel.
- Server tabs are at least 76 px high and Build 26 area tabs are 50 px high.
  Main links are at least 44 px high.
- Unselected interactive tab boundaries use `--border-strong`; selected
  state, focus outline and text remain distinguishable without relying on
  animation.
- The 390 px and 320 px layouts have no document-level horizontal overflow.
  Long tab rows remain intentionally swipeable within their labelled
  containers.
- The mobile menu exposes a labelled, expanded Close menu control and a
  labelled Mobile navigation region.
- App images have descriptive alternative text. Decorative brand images are
  empty-alt, all screenshots loaded successfully, and each figure identifies
  fixture data rather than implying live account activity.
- Reduced-motion and forced-colors rules cover the new interactive sections.
  Captions use 12 px text and increased foreground opacity.
- The rendered page produced no browser warnings or errors.

## Product-truth checks

- Build 26 is described as internal testing on the existing Google Play and
  TestFlight channels, never as a public store release.
- Server creation, membership, channel actions and Podcast recording remain
  visibly gated.
- Creator following requires Premium, age verification and explicit opt-in;
  notification visibility consumes the server-derived
  `creatorAudienceVisible` signal.
- The established Hub is shown in actual Build 26 captures and is described as
  preserved. The old `/clubs` URL resolves to `/servers`.

## Verification

- `npm test`: 101/101 passed
- `npm run lint`: passed with no warnings
- `npx tsc --noEmit`: passed
- `npm run build`: passed; 46 routes generated
- `git diff --check`: passed
- Browser smoke: default desktop, 390 px and 320 px; no horizontal overflow,
  no failed images and no console warnings or errors

## Follow-up coverage

VoiceOver or NVDA announcements, 200% and 400% browser zoom, a live
forced-colors session, text-spacing overrides and physical-device touch
testing remain suitable release-candidate checks. They are not represented as
completed by this review.

## Addendum — 2026-09-16

Before publication the reviewed homepage section moved to
`src/components/sections/tester-build-experience.tsx` (with
`tester-build-experience.module.css`), and release copy was corrected so the
site calls only Build 26 available to internal testers; Build 27 is described
as an unconfirmed candidate. The tab, tabpanel, roving focus, image and caption
structure reviewed above is unchanged. The Servers hero image now uses the
Next.js 16 `preload` prop instead of the deprecated `priority` prop. The
verification counts above are from the original 2026-09-13 review, not from
the published revision.
