# Accessibility review — 2026-09-01

Scope: marketing shell, home hero, site header/footer and Updates. The review
used WCAG 2.1 AA as the baseline and compared the website's semantic colours
with the current Flutter application.

## Resolved in this pass

- Replaced the hero's eight small pagination dots with previous/next controls
  that meet the 44 CSS-pixel target-size baseline and include accessible names.
- Added pause/play control, hover/focus pause behaviour and a stable screen-reader
  summary for rotating hero copy.
- Increased header, footer and hero icon/action targets to at least 44 pixels.
- Added a shared high-visibility `:focus-visible` treatment for links, buttons,
  summaries and programmatically focusable controls.
- Marked decorative icons as hidden from assistive technology and clarified
  external-link labels where a new tab opens.
- Mapped update statuses to semantic surface/foreground pairs while preserving
  their visible text and icon labels.
- Protected gradient headline descenders from clipping and allowed long update
  titles to wrap on narrow screens.
- Changed the Updates status legend to one column on the narrowest screens and
  two columns once space permits.
- Rebuilt the Community Room illustration as one labelled image with a concise
  screen-reader description of both states: passive prejoin first, docked chat
  after joining. Its decorative controls are not exposed as fake buttons.
- Kept new feature-card icons decorative and paired every capability with a
  visible heading and description.
- Verified Home and Updates without horizontal document overflow at 320, 390,
  768 and 1440 CSS pixels in the local production build.

## Automated evidence

- Node tests verify the hero descender rule, 44-pixel hero controls, exact
  Flutter-to-website semantic colour mapping and honest release-state copy.
- Calculated contrast for semantic status pairs ranges from 8.29:1 to 9.98:1;
  primary, secondary and tertiary text against the app background measure
  18.55:1, 9.49:1 and 6.17:1 respectively.
- ESLint and the production Next.js build complete without errors.
- All routes are statically or server-rendered successfully by the production
  build.
- The release ledger tests guard the new consent, message-latency and language
  claims against premature rollout, 1 ms or application-E2EE promises.

## Manual checks still required before publication

- VoiceOver reading order and spoken names in Safari on iOS and macOS.
- Keyboard traversal and focus visibility in Safari, Chrome and Firefox.
- 320-pixel viewport, landscape mobile, 200% browser zoom and increased-text
  checks on physical devices.
- Reduced-motion behaviour and colour appearance on an actual Pearl-theme app
  reference device.

The local in-app browser could not load the loopback preview because its URL
policy blocked local navigation. This audit therefore does not claim a complete
manual WCAG conformance pass; the remaining physical/browser checks above are
explicit release gates.
