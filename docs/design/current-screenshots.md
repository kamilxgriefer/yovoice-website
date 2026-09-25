# Current-UI captures — `public/screenshots/current/`

Provenance for the screenshots the homepage renders. This file deliberately
lives outside `public/`: `tests/servers-landing.test.ts` fails if any `.md`
appears under `public/screenshots`, because provenance is for us, not for
visitors.

## Where they come from

- **App repository** `yovoice` at `3a4696e3f1fa2480c5694b346eb89022e1420ab4`.
  The built bundle reports `CFBundleShortVersionString 2.0.0`,
  `CFBundleVersion 30`.
- **Harness** `lib/dev/redesign_preview.dart`, built with
  `flutter build ios --simulator --debug`
  `--dart-define=YO_PREVIEW_LOCALE=en --dart-define=YO_PREVIEW_STATE=populated`.
  The harness feeds the production Home / Servers / Chats / Moments widgets
  from in-memory fixtures. No sign-in, no network, no writes.
- **Devices** — the two **spare** simulators only: iPhone 17
  `D27EA9A8-DCE1-480D-871A-2282E43EB835` for the phone frames, and iPad Pro
  13-inch (M5) `E54667C2-8824-4DDD-A1F8-737C0293C5F9`, rotated to landscape,
  for the large-screen frame. The owner's signed-in simulators (iPhone 17 Pro
  `9EA1726B…`, iPad Pro 11-inch `6AD8FC6E…`) were never installed to or
  driven. Captured with `xcrun simctl io <udid> screenshot`, status bar pinned
  via `simctl status_bar override` so no real clock, carrier or battery state
  is shown.

### The English fixture set (2026-09-17)

The harness hard-codes Polish fixture strings that do not follow
`YO_PREVIEW_LOCALE`, so an earlier capture round put "Weekendowa ekipa" and
"Masz chwilę na rozmowę?" on an English marketing site. For this round the
harness fixtures were translated to English **in a scratch copy of the file**,
the build was run, and `lib/dev/redesign_preview.dart` was then restored
byte-for-byte (verified by SHA-256) — the app repository carries none of it.
The same scratch change added three more fixture servers so the Servers
directory shows all five kinds, and implemented `watchServer`, `watchMyRole`,
`watchModerators` and `watchChannels` on the preview repository so the real
`ServerWorkspaceScreen` mounts.

**If these captures are ever regenerated, that fixture work has to be redone**,
or the frames come back partly Polish and the Servers directory comes back
with two cards over empty space.

### Why the large-screen frame comes from an iPad

`MainShell.desktopBreakpoint` is 1100. An iPad Pro 13-inch in landscape is
1376 pt wide, so it renders the same `DesktopSidebar` + `DesktopHome` code
path the web app uses above that width — it is the desktop layout, captured
without a second toolchain. `simctl` writes the portrait framebuffer, so the
PNG was rotated with `sips -r 90` before conversion. The simulator was put in
dark appearance (`simctl ui … appearance dark`) first, because the harness
follows the system theme and the site is dark.

Only **Home** exists at large-screen width: the iPad could not be driven to
its other tabs (the simulator-control tool needs a per-device grant that was
not available, and the Simulator app had no windows for AppleScript to click).
The hero therefore shows this one capture as a fixed second view rather than
switching it per tab — see the assertion in `tests/homepage-welcome.test.ts`
that pins `desktopRefs` to `["home"]`.

## The files

| File | Surface | Size | Pixels |
| --- | --- | --- | --- |
| `home-phone.webp` | Home | 98.7 KB | 1206 x 2622 |
| `servers-phone.webp` | Servers directory, all five kinds | 67.1 KB | 1206 x 2622 |
| `chats-phone.webp` | Chats | 70.6 KB | 1206 x 2622 |
| `moments-phone.webp` | YO Moments (Voice) | 72.3 KB | 1206 x 2622 |
| `workspace-phone-v2.webp` | A server's channel list | 28.0 KB | 1206 x 2160 |
| `home-desktop.webp` | Home, desktop layout | 96.7 KB | 2064 x 1548 |

All are WebP at quality 80–82, well inside the 300 KB per-frame budget.

`workspace-phone-v2.webp` is the one frame that is not 1206 x 2622. It was
captured while the channel-list sheet was still presenting, so the Servers
screen behind it was sliced across the top of the image — status bar,
“‹ Servers”, and a half-row of the directory, with the sheet's drag handle
over the cut. It is cropped to the sheet's own top edge (the first 462 rows
removed, leaving 1206 x 2160). The sheet's rounded top corners fall well
inside the frame's 148 px corner mask, so no wedge shows in the render.

It is published under a new name rather than overwriting the old file.
`ImageOptimizerCache.getCacheKey` hashes the href, width, quality and mime
type and never the source bytes, so an edited file at an unchanged path is
served from the previous transform until the cache TTL lapses — which is
exactly what happened on the first verification run here, where the page
still rendered the uncropped frame after the bytes on disk were correct.

```
47034c87d927bb7369dc4ec194e642b8a3b6cd738b422fcc0d2f92d167d81580  chats-phone.webp
48809d8e8bbaf0bb4d0a0aa548e6fca9161716ed98259f3a9e559a76a720a89f  home-desktop.webp
371827288ccf1a5403ad616f061c277d84bc2f687eaaf677e5d3906c9f44d584  home-phone.webp
c45be3b69689e1d3ee5a26b1fc455f23b609cd3e6550ba6050d0c258d2694d2c  moments-phone.webp
d7fde94e2b96a34d77293f70607288643db67326df5160eae7e8d6d10af8fb86  servers-phone.webp
daec39d985fee004a21cf85d7a51c250addb1a41101f5bb115db1102b617f0cf  workspace-phone-v2.webp
```

## What the frames show, checked by opening each one

- The mobile dock is the bead-and-socket bar with five destinations —
  **Home / Servers / Chats / Moments / More**. There is **no centre logo
  button**, which is the defect the owner reported in the old hero mockup.
- The large-screen rail reads YO Voice, Home, Servers, Chats, Moments, then
  CREATE (Create Server, Create Voice Moment), then MORE.
- Home: greeting, "Your people", "Here and now", Create server / Friends,
  "In your servers", and a "Got a minute? Record a Voice Moment" card.
- Servers: a Create server action above all five kinds — For friends,
  For a podcast, For a community, For family, For a company.
- The server channel list: "Private server · 8 people", Invite, a TEXT group
  (general, plans) and a VOICE group (Lounge, Late night), then Add channel.
  After the crop this frame shows the settled sheet only, with nothing of the
  screen behind it.
- Chats: search, Add friend / New message, unread badges.
- Moments: the Voice / Yeels switch over Discover / Following / Most engaged.
- No "rooms", no "Open conversation" card, no Clubs, no orbits, no "Heart of
  the Community" in any frame. Every string is English.

## Known gaps

- **The channel's own content is not captured.** Opening a text channel in the
  harness reaches `ClubChatService`, which has no fake, so the message list
  renders "Something went wrong". Only the channel *list* is used on the site;
  the error frame was never saved under `public/`.
- **Yeels has no capture.** Its media is a fixture still that draws
  "Fixture still · no decoder" on screen.
- **Servers / Chats / Moments have no large-screen capture** — see above.

## Servers page hero — `public/screenshots/build-35/create-server-desktop.webp`

The `/servers` hero used the Polish Build 26 frame
`build-26/servers-desktop.jpg` on an English site. It was replaced
(2026-09-25) by an English capture of the same surface — the server-type
picker, "Create your server." with all five kinds — from the released app.

- **App repository** `yovoice` at `87a2f9968bcbd481502ca6dc384b267d11f65281`
  (`pubspec.yaml` `version: 3.0.0+35`), from a scratch copy of that tree; the
  app worktree was never modified.
- **Harness** `lib/dev/redesign_preview.dart`, **unmodified**, built with
  `flutter build web --debug -t lib/dev/redesign_preview.dart`
  `--dart-define=YO_PREVIEW_LOCALE=en --dart-define=YO_PREVIEW_THEME=dark`
  `--dart-define=YO_PREVIEW_TAB=servers --dart-define=YO_PREVIEW_STATE=populated`
  (Flutter 3.44.6). Release and profile builds render a grey error screen:
  the harness's mock plugin platforms refuse to run without assertions.
- **Capture** headless Chromium (Playwright) at a 1440 x 800 CSS-px viewport,
  device scale factor 1, dark colour scheme. The harness opened on Servers,
  and its own **Create server** button was clicked, which pushes the
  production `CreateServerScreen` exactly as `MainShell` does. Every request
  that was not to the local server was aborted (Firebase JS SDK, Google
  sign-in client, font CDN); CanvasKit was answered from the build's own
  `canvaskit/` folder. No account, no network.
- **The Polish-fixture trap did not apply.** The picker draws only localized
  UI strings (`server_localized_copy.dart`), no fixture names, so no fixture
  translation was needed. In 3.0.0 the picker is a full-window route (back
  arrow and "YO Voice" app bar) at every width, so the desktop sidebar is
  not in the frame — unlike the Build 26 frame, which showed it.
- Encoded with `cwebp -q 82 -m 6`: 1440 x 800, 45.2 KB. Published under a new
  path so the image optimizer's href-keyed cache cannot serve the old frame.
  `build-26/servers-desktop.jpg` stays on disk; it is no longer rendered.

```
8731f4d3a8f1e7275fa8d9e0be35fd5c793d742838571233e6cf1fa1c0738c4e  create-server-desktop.webp
```

Checked by opening it: the back arrow and "YO Voice", "YOUR SPACE STARTS
HERE", "Create your server.", "Who are you creating a place for? Choose a
starting point. Then make it your own.", then For friends, For a community,
For a podcast, For family and For a company, each with its two features and
Choose, and "One server. Many channels. Your character." Every string is
English.
