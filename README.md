# 🎙️ YO Voice

<p align="center">
  <strong>Be You.</strong><br>
  The next-generation voice platform where communities connect, creators grow, and conversations come alive.
</p>

---

## 🌌 About

YO Voice is a modern cross-platform voice communication platform built with cutting-edge web technologies.

The official website serves as the public face of the project, allowing users to:

- Learn about YO Voice
- Explore features
- Download desktop and mobile applications
- Create an account
- Access their downloads
- Stay updated with product news and roadmap

---

# 🚀 Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Firebase
- Framer Motion
- Three.js
- Vercel

---

# 📁 Project Structure

```
src/
├── app/
├── components/
├── config/
├── content/
├── hooks/
├── lib/
├── providers/
├── services/
├── store/
├── styles/
└── types/
```

---

# ✨ Features

## Marketing

- [x] Modern Landing Page
- [x] Feature Showcase
- [x] Interactive Animations
- [ ] FAQ
- [ ] Roadmap page
- [ ] Blog

## Authentication

- [x] Sign In
- [x] Register
- [x] Password Recovery
- [x] Email Verification (sent on register, resend from `/verify-email`)

All backed by Firebase Authentication (email/password), shared with the
Flutter app via the `auth.yovoice.app` custom auth domain — one account
works everywhere.

## User Portal (`/account/*`)

- [x] Profile (display name)
- [x] Security (change password, change email — both require
      re-authentication)
- [x] Devices & Sessions (current-session info only; a full multi-device
      registry needs backend work — see Known Limitations)
- [ ] Notifications (placeholder — needs a Firestore preferences schema)
- [x] Downloads

## Download Center (`/download`, post-login)

- [x] Web (works today — links straight to the Flutter web app)
- [x] Windows / macOS — honest "not published yet" state linking to GitHub
      Releases, not a fabricated installer link
- [x] Mobile — "coming soon", links to the GitHub repo

---

# 🚀 Getting Started

```bash
npm install
cp .env.example .env.local   # fill in Firebase config, see below
npm run dev
```

Requires Node 20+. Uses [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) (`next dev`/`next build --turbopack`).

```bash
npm run lint     # ESLint
npm run build    # production build (also runs the TypeScript check)
```

---

# 🔑 Environment Variables

All Firebase config is `NEXT_PUBLIC_*` (safe to expose — this is the
standard Firebase Web SDK client config, not a secret) and comes from the
**same Firebase project as the Flutter app** (`yovoice-ec54a`, "yo_voice
(web)" app), so the same account works across the marketing site, the
account pages, and the actual app.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web SDK config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `auth.yovoice.app` — the shared custom auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `yovoice-ec54a` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Web SDK config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Web SDK config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web SDK config |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics |
| `NEXT_PUBLIC_APP_URL` | Where "Launch Web App" / post-login redirects send signed-in users. `https://yovoice-ec54a.web.app` until `app.yovoice.app` DNS exists, then switch to `https://app.yovoice.app` |

Set these locally in `.env.local` (gitignored) and in Vercel via
`vercel env add <NAME> <environment>` for `production`, `preview`, and
`development` — all three, since Next reads different files depending on
the run context.

---

# ☁️ Deployment

- **Hosting:** Vercel, project `yo-voice/yovoice-website`, auto-deploys on
  push to `main`.
- **Local ↔ Vercel link:** `vercel link` (already linked to
  `yo-voice/yovoice-website`); `vercel env pull .env.local` to sync env
  vars locally.
- **DNS:** `yovoice.app` is on Cloudflare. `app.yovoice.app` is **not
  configured yet** — it needs a `CNAME app.yovoice.app → yovoice-ec54a.web.app`
  record added in Cloudflare (this was added as a custom domain in
  Firebase Hosting; that's the exact record Firebase's own setup flow
  asked for). Nobody but whoever controls the Cloudflare DNS zone can add
  this — it's not something achievable from code.

---

# ⚠️ Known Limitations

- **Devices & Sessions** only shows the current browser session. Firebase
  Auth's client SDK has no API for listing/revoking sessions on other
  devices — that needs a backend session registry, not implemented.
- **Notifications** page is a placeholder — no Firestore preferences
  schema exists yet for it to read/write.
- **Desktop/mobile installers** aren't published — the download center
  is honest about this rather than linking to store pages that don't
  exist.
- **`npm audit`** currently reports 3 high-severity advisories, all
  transitive (bundled inside `next`'s own `postcss`/`sharp` deps, not a
  direct dependency of this project). `npm audit fix` should resolve
  them once verified not to break the Next.js build.

---

# 🎨 Design Philosophy

YO Voice combines

- modern UI
- premium animations
- immersive interactions
- clean typography
- responsive layouts

to create a memorable first impression.

---

# 🔐 Authentication Flow

Desktop:

```
Landing Page
      ↓
Download
      ↓
Login
      ↓
Dashboard
      ↓
Download Installer
```

Mobile:

```
Landing Page
      ↓
Download
      ↓
Google Play / App Store
```

---

# 📅 Roadmap

- [ ] Landing Page
- [ ] Hero Animation
- [ ] Community Showcase
- [ ] Download Center
- [ ] User Dashboard
- [ ] Blog
- [ ] SEO
- [ ] Analytics
- [ ] Production Release

---

# 🛡 License

Private repository.

All rights reserved.

---

<p align="center">
Made with ❤️ for the future of voice communities.
</p>
