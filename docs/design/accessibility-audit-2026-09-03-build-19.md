# Accessibility review — Build 19 website sync

Standard: WCAG 2.1 AA | Date: 2026-09-03

## Scope

Home release spotlight, Updates hero, status legend, current-wave header and
featured Build 19 ledger card.

## Resolved in this pass

- Gave the release spotlight a labelled section and a real heading hierarchy.
- Kept capability groups as a semantic list; their icons and sequence numbers
  are decorative and do not add screen-reader noise.
- Labelled the featured update article from its unique release heading.
- Kept both new links at least 48 CSS pixels tall with the global visible focus
  treatment.
- Used text and icons together for every rollout status; colour is not the only
  signal.
- Kept release-authored strings breakable and all grids stackable at narrow
  widths.
- Preserved the global reduced-motion override for hover and transition effects.

## Contrast evidence

| Pair | Ratio | AA result |
| --- | ---: | --- |
| Primary text / app background | 18.55:1 | Pass |
| Secondary text / app background | 9.49:1 | Pass |
| Secondary text / standard surface | 8.71:1 | Pass |
| Accent / standard surface | 7.70:1 | Pass |
| Accent / sunken surface | 8.30:1 | Pass |
| White / primary build orb | 5.85:1 | Pass |

## Responsive evidence

- Home and Updates were inspected in the local browser at 320, 390 and 1440
  CSS-pixel widths.
- At 320 pixels, both documents reported equal client and scroll widths; no
  horizontal page overflow was introduced.
- The 320-pixel check is stricter than the effective layout width of a typical
  desktop page at 200% zoom, but manual browser-zoom and increased-text checks
  remain part of release acceptance.

## Automated evidence

- Product-ledger tests require Build 19 to remain in verification and reject
  premature tester-availability, one-millisecond and end-to-end-encryption
  claims.
- Design-system tests require the shared release classes, semantic section
  label and matching heading identifier.
- Product-visual tests require all six Build 19 scope labels and the physical
  device rollout boundary.

## Manual checks still required before publication

- VoiceOver reading order and spoken link names in Safari.
- Complete keyboard traversal in Safari, Chrome and Firefox.
- 200% browser zoom and platform increased-text settings on physical devices.
- Colour appearance on a calibrated display and forced-colours behavior.
