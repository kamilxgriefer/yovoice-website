# YO Voice website design system

Last reviewed: 2026-09-24 (auth switch; Continue with Google / Apple, accessibility pass)

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

### Slim tokens (2026-09-19)

These sit beside the pinned palette above; they are new tokens, never new
values for the pinned ones.

| Role | Token | Value |
| --- | --- | --- |
| Field and button radius | `--radius-field` | `12px` |
| Card radius | `--radius-card` | `16px` |
| Chip and badge radius | `--radius-pill` | `999px` |
| Live state | `--live` / `--on-live` | `#FF335C` / `#16040A` |
| Floating chrome shadow | `--shadow-float` | `0 16px 40px rgba(0,0,0,.42)` |
| Fixed header height | `--header-height` | `56px` |

The `@theme inline` block at the top of `globals.css` maps Tailwind's
`--color-*` namespace onto these tokens through `var()`, so utilities such as
`bg-primary`, `text-accent`, `border-border-strong` and `bg-live` carry the
token itself instead of a copied hex. The old glass and glow compositing
tokens are gone: no card, button, badge or ring glows. Two effects remain on
purpose: the fixed header's `backdrop-blur`, which keeps its links legible
over scrolled content, and the hero's single corner glow (see below). The auth
switch adds a transient per-letter blur while its title changes (see "Auth
switch").

## Components and shape

- Inter is the shared text and display face.
- `.panel` is the one card surface: `--surface`, a 1 px `--border` hairline,
  `--radius-card`, no shadow and no blur. The transitional `.glass-panel`
  alias and the `.glass-panel-glow` gradient border were removed once every
  use had moved to `.panel`.
- Global classes in `globals.css` are deliberately unlayered, so they outrank
  any Tailwind utility left on the same element. Only new building blocks that
  must not outrank utilities (`.icon-tile`, `.feature-row`, `.status-alert`)
  live in `@layer components`.
- Primary actions use `.premium-button` (solid `--primary`, `--radius-field`,
  48 px, weight 600); lower-emphasis actions use `.premium-button-secondary`
  (`--surface` with a `--border-strong` hairline) or `.premium-button-ghost`
  (no border). The classes own their geometry, so buttons carry only layout
  utilities (`w-full`, `mt-*`, `shrink-0`), not `min-h-*`, `px-*` or `text-*`.
- Fields use `.glass-field` (52 px, `--surface`, `--border-strong` hairline,
  `--radius-field`, 2 px `--focus` ring without glow). Labels and helper text
  use `--text-secondary` / `--text-tertiary`, not translucent white.
- Every field has a visible label above it, tied with `htmlFor`: on the auth
  forms `Input` / `PasswordField` draw `.field-label` (13 px / 600,
  `--text-secondary`, sentence case); the account pages keep their small
  uppercase label. A placeholder is only an optional example
  (`you@example.com`), never the field's only name: at 200 % text on a phone
  it is cut off inside the field. Hints and errors are linked with
  `aria-describedby`.
- Chips (`.chip`, `.chip-active`) and badges (`.badge-*`) sit on the surface
  with a hairline; the active chip is solid `--primary`, the live badge is
  `--live` / `--on-live`.
- Alerts use `.status-alert` on the paired status tokens
  (`--success`/`--success-surface`, `--warning`/`--warning-surface`,
  `--info`/`--info-surface`, `--error`/`--danger-surface`) and always carry an
  icon and a text label.
- The navigation preview uses the app's navigation surface, outline and inactive
  text tokens. Pearl is intentionally shown only where the product preview
  demonstrates the optional app appearance; the marketing shell remains Dark.
- Release highlights use one shared pattern: `.release-spotlight` for a
  cross-page release summary, `.release-build-orb` for the build identifier and
  `.release-scope-card` for capability groups. The first ledger entry may use
  `.release-card-featured`; ordinary historical cards use `.panel`.
- Decorative icons are hidden from assistive technology. Meaningful icons sit
  beside a visible label or receive an explicit accessible name.

## Slim rules

- Chrome is thin: a 56 px fixed header (`--header-height`), 14 px links, one
  primary action ("Open YO Voice"). Pages pad their top by the header height
  rather than by a hard-coded 80 px.
- One accent. Highlighted words in section headings use solid `--accent`.
  Gradient text exists only on the hero headline ("Start talking."), with
  `.text-gradient-descender-safe`; the lockup tagline and every other
  highlight are solid `--accent`. The premium ring keeps its conic gradient
  as the one ornament, without a glow.
- No decoration behind content: no deep-space background, blurred blobs,
  grid texture or particles outside the hero, which keeps one calm radial glow
  in its corner. The body's top-to-background gradient is the only page
  gradient.
- No card in a card. A surface either is a `.panel` or sits on one; auth
  pages are a single surface, not a shell around an inner card.
- Feature lists are rows (`.feature-row`: a 40 px `.icon-tile`, title and
  description) in a two-column grid (one on phones), not boxes.
- Section type scale: eyebrow 11 px / 700 / `.12em` in `--text-tertiary`;
  section title 40 px desktop / 30 px phone, 800, `-0.025em`; copy 16 px / 1.6
  in `--text-secondary`. One `<h1>` per page.
- Motion (framer-motion) is reserved for the hero rotators, the hero CTA spring
  and the menu. Use Tailwind v4's `motion-reduce:` variant. The one other
  motion moment is the auth switch below; it uses CSS and the Web Animations
  API, not framer-motion.

## Auth switch (Log in / Create account)

The owner-approved exception to "no decoration" and "motion is reserved"
(September 2026). It applies to `/login` and `/register` only; the five
mail-action and recovery pages keep the accounts panel with its three rings.

- **Stage.** The desktop brand panel shows the page's title said large
  (`.auth-spoken--stage`, Inter 800, up to 64 px, two lines for both titles)
  with the page's note under it, and a stylised waveform of that phrase (a
  hand-authored loudness contour) along the bottom edge. The waveform
  (`.auth-wave`, bars graded from `--accent` to `--primary`) is the panel's
  one ornament, in place of the rings, and the one gradient besides the
  body's. Below `lg` the same title, note and a 56 px waveform sit above the
  form. The title sizes against its column (container units), so enlarged
  text shrinks it rather than clipping it.
- **One size for every letter.** The title never varies weight or size per
  letter, at rest or in motion; only opacity, blur and the word's vertical
  position animate. Letters are inline spans so kerning is identical to a
  plain text run. The loudness contour of the phrase (`AUTH_MODE_VOICE` in
  `src/lib/auth/auth-mode.ts`) drives only the waveform.
- **Headings.** The visible title and note are decorative (`aria-hidden`,
  and the stage is not a named region); each page keeps its single `<h1>` and
  note as `sr-only` text from the same copy constants.
- **Switch.** `Log in | Create account` is a `<nav>` of two links with
  `aria-current="page"`, drawn as a segmented control whose pill slides.
  When the column is too narrow for "account" in half of it (200-300 % text
  or page zoom on a phone) the options stack and the pill slides down, so no
  word breaks inside. It
  keeps `?redirect=` (`authModeHref`). In forced-colours mode the current
  option is drawn in `Highlight`. It is hidden during the second-factor step,
  whose only way out is "Back to password" ("Back" when the step follows
  Google or Apple).
- **Transition.** About one second, once per switch, nothing loops: the old
  title blurs out while the new one arrives letter by letter; a front travels
  across the waveform, each bar ducking and springing slightly past its new
  height; rows that belong to one mode unfold (`AuthFold`) while the previous
  form's rows fold away (`AuthFoldAway`), so the email and password fields and
  the submit button start exactly where they were. The two pages have no
  `<Suspense>` around their forms, so the router keeps the old form on screen
  until the new one is ready instead of showing an empty boundary. The
  choreography plays once per switch (not again after the second-factor
  step). With `prefers-reduced-motion` the change is immediate: no fold, no
  label entrance, no pill or note transition.
- While the switch is on screen the auth column is pinned to the top
  (`.auth-shell`, `.auth-pane`) so the taller form never re-centres the page.
  On desktop the whole card is pinned too, at an offset that centres the
  taller Create account card: with the Google / Apple block both forms are
  taller than the brand panel's 640 px minimum, so a centred card would drift
  by half the height difference while the rows unfold.
- **Google / Apple block.** `SocialSignIn` sits first in both forms,
  rendered identically (same props, same probe state from a per-tab cache),
  so the switch never moves it and the fold choreography below it is
  unchanged: two full-width `.premium-button-secondary` buttons (48 px, 12 px
  apart), "Continue with Google" and "Continue with Apple", each with its
  provider mark, then the divider "or with email" in sentence case (hairline
  either side, `--text-tertiary`; not an all-caps eyebrow). The form's alert
  sits under the block, above the first field, so a social or a password
  error appears next to what caused it. A status or progress is a second,
  smaller line under the name (12 px / 600, as in the app), not a pill: the
  social buttons use 4 px block padding so both lines sit inside the 48 px
  minimum at every width down to 320 px, and nothing below moves when the
  probe answers or an attempt starts. While a provider window is open its
  button shows an arc spinner in place of the mark and "Waiting for
  Google…" (or Apple); the other button and the email submit wait. Apple
  mirrors the app's availability probe: "Checking…" with the spinner while it
  runs, "Coming soon" when the provider is not configured, "Couldn't check —
  try again" (probes again on press) when the probe could not confirm it.
- **Unavailable, not disabled.** The two buttons are never `disabled`: an
  unavailable one is `aria-disabled` (the pointer passes through it), so
  keyboard focus stays on the button that was pressed while its window is
  open and after it closes, and "Coming soon" stays reachable with Tab. A
  dimmed button is recoloured, never faded: border `--border`, name
  `--text-secondary` (8.7:1), second line `--text-tertiary` (5.7:1), mark at
  60 %. The button whose window is open keeps full colour. In forced colours
  a dimmed button is `GrayText`, and the spinner is an open arc, so it keeps
  its shape where every border takes one system colour; under reduced motion
  it stops turning and the words carry the state.
- **What is spoken.** A polite status region in the block says "Waiting for
  Google…", "Checking whether Apple sign-in is available…", "Google sign-in
  cancelled." and "Signed in with Google. Continuing…"; errors go to the
  form's alert like every other form error. Leaving the second-factor step
  ("Back", "Back to password") returns focus to the button or the password
  field that led there.

## Legal hygiene

- Borrow patterns, never names, logos, icons or colours of other products
  (for example other social or voice products). Such names may appear only in
  ADRs and code comments, never as a description of our own features in copy
  or UI.
- Exceptions that stay as they are: links to our own accounts (the footer's
  Instagram link to @yovoice.app and the matching `sameAs` entry, where the
  label names the service the link goes to) and historical release-ledger
  text in `src/content/product-updates.ts`, which is a factual record.
- Provider sign-in buttons (2026-09-24). "Continue with Google" and
  "Continue with Apple" on `/login` and `/register` carry the provider's own
  mark because Google's and Apple's branding rules require it on a button
  that signs in with them: the four-colour Google "G" unaltered (the app's
  `assets/icons/icon_google_g.svg`) and the Apple glyph in the label colour
  (`src/components/auth/provider-marks.tsx`). The label names the provider
  in one of the wordings both allow, and the two buttons are the same size
  and emphasis. The marks appear nowhere else: not in copy, feature lists,
  illustrations or any other control.
- App previews are captions on real captures; they never invent member names,
  counts or online states (see below).

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

The website may surface a tester release on Home only when that surface reads
from the same ledger entry and repeats its distribution boundary. Build 19 is
labelled **Invited testing** because Google Play Internal Testing and both
TestFlight groups are confirmed; the copy must still say that public App Store
and Google Play release is a separate milestone.
