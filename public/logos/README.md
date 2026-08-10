# Brand assets

`yo-voice-symbol.png` — the canonical YO Voice symbol (362x375, 44.6%
transparent). Everything in `src/` that draws the mark uses this.

`yovoice-logo.png` — **do not delete, and do not rename.** Nothing in this
codebase imports it. It exists because the transactional email templates
(`yovoice/docs/email-templates/*.html`, pasted into the Firebase Console)
hotlink `https://yovoice.app/logos/yovoice-logo.png`, and emails already
delivered cannot be updated. The file used to be a version of the mark with
a solid black square baked in; it now holds the same artwork as
`yo-voice-symbol.png`, so those emails render the current branding on their
`#0d0618` background without their `<img>` breaking.

The supplied `yo-voice-with-text.png` lockup is deliberately not kept here.
The header/footer/auth lockup is the symbol plus live HTML text — see
`src/components/layout/brand-lockup.tsx` for why.
