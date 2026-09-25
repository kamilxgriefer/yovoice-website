# Current-UI captures — `public/screenshots/current/`

Provenance for the screenshots the homepage and /updates render. This file
deliberately lives outside `public/`: `tests/servers-landing.test.ts` fails if
any `.md` appears under `public/screenshots`, because provenance is for us,
not for visitors.

## YO Voice 3.0.0 recapture (2026-09-25)

Every frame below shows **YO Voice 3.0.0 (34), the Slim redesign**, which
testers have had since 19 September 2026. They replace the 2.0.0 (30) frames
of 2026-09-17 (hero, Servers section) and the Polish Build 26 frames of the
/updates walkthrough (audit items W07, W09, W10).

### Where they come from

- **App source** `yovoice` at `f71a2ae2` — the commit every 3.0.0 (34) store
  and web build was made from (`pubspec.yaml` `version: 3.0.0+34`). The tree
  was exported with `git archive f71a2ae2` over an rsync'd **scratch copy** of
  the capture worktree (`tmp/app-capture`, main `87a2f996`); files added after
  f71a2ae2 were removed from the copy. Between the two commits `lib/` differs
  only in the sound files and the push-notification sound profile, so nothing
  visible changes. The app worktree was never modified: a SHA-256 manifest of
  all 2983 of its files was taken before and compared after (identical).
- **Harness** `lib/dev/redesign_preview.dart`, built with Flutter 3.44.6:
  `flutter build web --debug -t lib/dev/redesign_preview.dart`
  `--dart-define=YO_PREVIEW_LOCALE=en --dart-define=YO_PREVIEW_THEME=dark`
  `--dart-define=YO_PREVIEW_STATE=populated --dart-define=YO_PREVIEW_TAB=home`.
  Release and profile builds render a grey error screen, so it is a debug
  build. The harness feeds the production Home / Servers / Chats / Friends /
  Moments widgets and the production `DesktopSidebar` from in-memory
  fixtures. No sign-in, no network, no writes.
- **Scratch-only harness changes** (the patch is in
  `yovoice-evidence/2026-09-25/website-fix/captures/redesign_preview.scratch.patch`;
  the original file is SHA-256 `e7c4923b…c225e`, identical at f71a2ae2 and
  87a2f996):
  - the Polish fixture strings (people, chat messages, captions, server and
    channel names, descriptions) translated to natural English with neutral
    sample names — Alex, Maya, Leo, Ada, Sam, Nina, Tom — because the
    fixtures do not follow `YO_PREVIEW_LOCALE`;
  - three more fixture servers (Book club, Family table, North Studio) so the
    Servers list shows all five kinds;
  - two capture hooks: `?tab=` picks the opening tab without a tap (a tap on
    a callback would show a "Preview callback" snackbar), and `?inset=59,34`
    gives the phone frames an iPhone's safe areas, which a browser does not
    report. Nothing in a production widget was changed.
- **Capture**: served from `127.0.0.1`, driven by headless Chromium
  (Playwright 1.62) in a dark colour scheme. Every request that was not to
  the local server was aborted (Firebase JS SDK, Google sign-in, Roboto);
  CanvasKit was answered from the build's own `canvaskit/` folder, and the
  engine's Noto Color Emoji request from the copy that ships inside the
  Flutter SDK, so the greeting's wave renders without leaving the machine.
  The browser ran in `Europe/London` with a fixed clock (2026-09-19,
  19:30 local), so the desktop rail's world-clock card shows a parked
  "7:30 PM London" rather than the capturing machine's zone and time, and
  the "since" times are fixed relative to it.
  - Phone frames: 402 x 874 CSS px at 3x (iPhone 17 size) — 1206 x 2622.
  - Hero large-screen frame: 1600 x 1200 at 1.29x — 2064 x 1548. At 1600 px
    the Your people row fits, including "Add friends".
  - /updates walkthrough: 1440 x 900 at 1.5x — 2160 x 1350, one frame per
    tab. Exactly one rail item is lit in each: Home, Chats, and More for
    Friends. Friends has no rail row in 3.0.0 and the production shell
    (`MainShell.desktopNavItemForSlot`) keeps More lit while it is open; the
    harness maps it the same way, so the frame shows what a tester sees.
- **Servers-section frame** (`workspace-phone-slim.webp`): the harness cannot
  mount a server's workspace, so it comes from a scratch widget test modelled
  on `test/slim_servers_capture.dart`, switched to `Locale('en')`, English
  server names and each template channel's `englishName`, rendered at
  402 x 874 with the same safe areas, dark theme, 3x, after tapping the real
  `server-open-channels` button. The PNG was cropped to the Channels sheet's
  own top edge (the first 458 rows removed), leaving 1206 x 2164. The test
  file is in the same evidence folder.

Encoded with `cwebp -q 80 -m 6` and published under new `-slim` names:
Next's image optimizer keys its cache on the href, width, quality and mime
type, never on the source bytes, so a new picture at an old path would keep
serving the old transform.

## The files

| File | Where | Surface | Size | Pixels |
| --- | --- | --- | --- | --- |
| `home-phone-slim.webp` | hero | Home | 81.4 KB | 1206 x 2622 |
| `servers-phone-slim.webp` | hero | Servers, all five kinds | 65.1 KB | 1206 x 2622 |
| `chats-phone-slim.webp` | hero | Chats | 61.4 KB | 1206 x 2622 |
| `moments-phone-slim.webp` | hero | YO Moments (Voice, Discover) | 65.1 KB | 1206 x 2622 |
| `home-desktop-slim.webp` | hero | Home, desktop layout | 83.8 KB | 2064 x 1548 |
| `workspace-phone-slim.webp` | Servers section | a server's Channels sheet | 37.8 KB | 1206 x 2164 |
| `home-wide-slim.webp` | /updates | Home, desktop layout | 83.2 KB | 2160 x 1350 |
| `chats-wide-slim.webp` | /updates | Chats, desktop layout | 60.7 KB | 2160 x 1350 |
| `friends-wide-slim.webp` | /updates | Friends, desktop layout | 54.4 KB | 2160 x 1350 |
| `create-server-desktop-slim.webp` | /servers | Create your server (type picker) | 45.2 KB | 1440 x 800 |

```
077e1c216a930b642b3225b1d0ad1f4359fb1db59b77116e11673a4fe3eb556d  chats-phone-slim.webp
7207dc7660f93d76e9dd0add825e34c45f96b4d32bdf729a7487e85f1f48561b  chats-wide-slim.webp
42d31558a393fc7d1bed99c97dc4e8081f19a9a7b690d23eae4085b65bc09a6f  friends-wide-slim.webp
5bc2061c04c9a4d66aaca1b9a796a6ea9844fe89f14ccc4b99965f28fd47ec5a  home-desktop-slim.webp
97fff3457fb2156bf73c4746e614d72e4abf17009f6e90119f341008b6b6f9c6  home-phone-slim.webp
67e37f71722b2949a7c021974da7cebc5f71b49ffe35720ca7a5d57199b17248  home-wide-slim.webp
d9f7e481dbdd43fbf5e2d6eaa10fecd7ab5ccde6f45979e8b84b09af8e3aa9c7  moments-phone-slim.webp
6066da247747dd99f5c2b1c43d90cd36403bd8525cbb748f3708ede02cdeb2ad  servers-phone-slim.webp
7a8b04bdd3fa7eea3852658b152c01abaedd6cd006061190c44a46976d371fee  workspace-phone-slim.webp
```

The 2.0.0 (30) files (`home-phone.webp`, `servers-phone.webp`,
`chats-phone.webp`, `moments-phone.webp`, `home-desktop.webp`,
`workspace-phone-v2.webp`) and every file in `public/screenshots/build-26/`
were deleted in the same change.

## What the frames show, checked by opening each one

Every visible string is English; there is no debug text, no snackbar, and no
real person's name or data.

- **Phone dock**: the 3.0.0 bead-and-socket dock — Home, Servers, Chats,
  Moments and More — with the selected destination
  raised and labelled.
- **Home (phone)**: the YO Voice logo row, "Hi, Alex" with a wave and "Good
  to see you again!", the bell and avatar, Your people (You, Ada, Leo, Maya,
  Nina, with Voice Moment durations), Live now (a LIVE Stage card, "Live
  studio · Voice studio · Stage"), and Here and now with the Weekend crew
  server, whose card continues under the dock as the list scrolls.
- **Servers (phone)**: "Servers" and Create server over a compact list —
  Weekend crew (For friends · 8 people), Voice studio (For a podcast · 126),
  Book club (For a community · 184), Family table (For family · 6), North
  Studio (For a company · 23) — each with a one-line description.
- **Chats (phone)**: "Chats — Private conversations with your friends.",
  search, a row with Add friend, New message, Maya and Leo, and Messages:
  Maya (2 unread), Leo (a long message the app ends with an ellipsis), Ada
  (voice message, 1 unread).
- **Moments (phone)**: Voice / Yeels with Voice selected, Discover selected
  beside Following and Most engaged, a rail of voices, and Voice Moment
  cards with play, like, comment, Share and Reply with voice.
- **Channels sheet (Servers section)**: the server rail (W, B, F, L, N), then
  Weekend crew, "Private server · 12 people", Invite, TEXT (general, memes),
  VOICE (Lounge and Gaming, both LIVE), ORGANISATION (Events, Rules), Add
  channel.
- **Desktop layout (hero, /updates)**: the rail reads YO Voice and the bell,
  Home, Servers, Chats (2), Moments, CREATE (Create Server, Create Voice
  Moment), MORE (More), then the parked world clock and the profile card
  (Alex, USER, @alex). Home adds Got a minute? / Record a Voice Moment and
  Your recent chats; that row is a carousel and, as in the app, the third
  card peeks in at the right edge. The hero frame also shows In your servers.
  Chats and Friends show the same content as on the phone, plus Friends'
  All / Online / Requests / Blocked, "6 friends · 4 online" and a message
  button on each row.

## Known gaps

- **Yeels has no capture.** Its media is a fixture still that draws
  "Fixture still · no decoder" on screen, so the /updates walkthrough no
  longer has a Yeels tab. A truthful Yeels frame needs real media from a
  signed-in test account; that is the owner's call.
- **A channel's own content is not captured.** Only the channel list is used.
- **Servers / Chats / Moments are not shown at desktop width in the hero** —
  it keeps one fixed large-screen view (Home), pinned by
  `tests/homepage-welcome.test.ts` (`desktopRefs` equals `["home"]`).

## Servers page hero — `public/screenshots/current/create-server-desktop-slim.webp`

The `/servers` hero used the Polish Build 26 frame
`build-26/servers-desktop.jpg` on an English site. It was replaced
(2026-09-25) by an English capture of the same surface — the server-type
picker, "Create your server." with all five kinds — as testers have it in
YO Voice 3.0.0 (34).

- **App source** `yovoice` at `f71a2ae2`, the commit every 3.0.0 (34) store
  and web build was made from — the same English scratch harness build as
  the frames above (its `version.json` reads 3.0.0 / 34). The app worktree
  was never modified.
- **Harness** `lib/dev/redesign_preview.dart`, built with
  `flutter build web --debug -t lib/dev/redesign_preview.dart`
  `--dart-define=YO_PREVIEW_LOCALE=en --dart-define=YO_PREVIEW_THEME=dark`
  `--dart-define=YO_PREVIEW_STATE=populated` (Flutter 3.44.6), opened with
  `?tab=servers`. Release and profile builds render a grey error screen: the
  harness's mock plugin platforms refuse to run without assertions.
- **Capture** headless Chromium (Playwright) at a 1440 x 800 CSS-px viewport,
  device scale factor 1, dark colour scheme. The harness opened on Servers,
  and its own **Create server** button was clicked, which pushes the
  production `CreateServerScreen` exactly as `MainShell` does. Every request
  that was not to the local server was aborted (Firebase JS SDK, Google
  sign-in client, font CDN); CanvasKit was answered from the build's own
  `canvaskit/` folder. No account, no network. Script and raw PNG:
  `yovoice-evidence/2026-09-25/website-fix/review-round/create-server/`.
- **The Polish-fixture trap does not apply.** The picker draws only localized
  UI strings (`server_localized_copy.dart`), no fixture names. In 3.0.0 the
  picker is a full-window route (back arrow and "YO Voice" app bar) at every
  width, so the desktop sidebar is not in the frame.
- An earlier capture of this surface was taken from a later tree whose
  `lib/` differs from `f71a2ae2` only in four sound and push-notification
  files. The recapture from `f71a2ae2` encodes to the identical file (same
  SHA-256 below), which confirms that nothing visible differs.
- Encoded with `cwebp -q 82 -m 6`: 1440 x 800, 45.2 KB, under a new
  `-slim` path so the image optimizer's href-keyed cache cannot serve an
  older transform. `build-26/servers-desktop.jpg` was deleted on 2026-09-25
  with the rest of the Build 26 folder.

```
8731f4d3a8f1e7275fa8d9e0be35fd5c793d742838571233e6cf1fa1c0738c4e  create-server-desktop-slim.webp
```

Checked by opening it: the back arrow and "YO Voice", "YOUR SPACE STARTS
HERE", "Create your server.", "Who are you creating a place for? Choose a
starting point. Then make it your own.", then For friends, For a community,
For a podcast, For family and For a company, each with its two features and
Choose, and "One server. Many channels. Your character." Every string is
English.
