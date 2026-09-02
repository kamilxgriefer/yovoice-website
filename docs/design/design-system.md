# YO Voice website design system

Last reviewed: 2026-09-01

## Source of truth

The website mirrors the semantic Dark palette used by the Flutter application
in `lib/core/theme/app_palette.dart`. Website components consume the tokens in
`src/app/globals.css`; they should not copy raw colours into individual pages.

| Role | Website token | Dark value |
| --- | --- | --- |
| App background | `--background` | `#080711` |
| Top background | `--background-top` | `#130A22` |
| Surface | `--surface` | `#17121F` |
| Raised surface | `--surface-raised` | `#21192B` |
| Sunken surface | `--surface-sunken` | `#0C0814` |
| Primary | `--primary` | `#7B2FF7` |
| Secondary | `--secondary` | `#C026FF` |
| Accent/focus | `--accent`, `--focus` | `#D986FF` |
| Brand cyan | `--brand-cyan` | `#5CE1E6` |
| Primary text | `--foreground` | `#F8F5FC` |
| Secondary text | `--text-secondary` | `#B8AFC2` |
| Tertiary text | `--text-tertiary` | `#958B9F` |
| Border | `--border` | `#342A43` |
| Strong border | `--border-strong` | `#7C6790` |

Success, warning, information and danger messages use paired foreground and
surface tokens. Product-update statuses use those pairs through
`.release-status`; colour never carries the status without an icon and label.

## Components and shape

- Inter is the shared text and display face.
- Cards use `--radius-lg` or `--radius-xl`; compact controls and badges use
  `--radius-pill`.
- The navigation preview uses the app's navigation surface, outline and inactive
  text tokens. Pearl is intentionally shown only where the product preview
  demonstrates the optional app appearance; the marketing shell remains Dark.
- Primary actions use `.premium-button`; lower-emphasis actions use the
  secondary or ghost variants. Interactive components should not introduce a
  new gradient or glow without a distinct hierarchy reason.
- Decorative icons are hidden from assistive technology. Meaningful icons sit
  beside a visible label or receive an explicit accessible name.

## Product illustrations

- App previews are labelled illustrations, not simulated live accounts. They
  never contain fabricated member names, audience totals or online states.
- Room artwork follows the current consent boundary: a passive **Before you
  join** surface comes before **Join conversation**; only the connected state
  shows the room chat. The chat is shown open by default and visibly hideable.
- Account-readiness artwork may show the persistent verification reminder, but
  it must not imply that an email has been sent or verified without a real
  account action.
- Dark is the website shell. Pearl appears as a clearly bounded application
  preview using the exact light `AppPalette` colours; it is not a second,
  partially implemented website theme.

## Interaction and accessibility

- Pointer and touch targets are at least 44 by 44 CSS pixels.
- Keyboard focus uses a visible two-pixel `--focus` outline with four-pixel
  offset. Do not remove it for mouse styling.
- Motion is optional enrichment. Components respect `prefers-reduced-motion`,
  avoid forced autoplay where possible and expose pause/manual controls.
- Text and controls must reflow at 320 CSS pixels and at 200% text zoom without
  horizontal page scrolling. Use `min-width: 0`, wrapping and `break-words` for
  user- or release-authored strings.
- Gradient display text reserves descender paint space via
  `.text-gradient-descender-safe`; do not place it in an overflow-clipped
  wrapper.

## Release-truth content

`src/content/product-updates.ts` is a release ledger rather than a roadmap.
Use `live` only after production verification, `testing` only when the named
tester channel actually has the build, `ready` when release gates are complete,
and `verification` for source work that still has rollout or physical-device
gates. Unfinished work belongs on the roadmap, not in Updates.
