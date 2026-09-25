"use client";

import { useId } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { useHeroTour } from "@/components/hero/hero-tour";

/**
 * The hero's device frames, showing the app as it is today: YO Voice 3.0.0,
 * the Slim redesign that testers have had since 19 September 2026.
 *
 * Every frame in `appScreens` is a real screenshot of the released build's own
 * widgets, rendered by the app repository's preview harness from sample
 * fixtures (no account, no network) — not a CSS drawing of remembered UI.
 * Provenance, including how each frame was made, is in
 * docs/design/current-screenshots.md.
 *
 * The four tabs are the app's own first four destinations, Servers among them.
 * They advance with the hero's one tour clock (`hero-tour.tsx`), so the phone
 * always shows the screen the welcome sentence beside it describes. WCAG 2.2.2
 * is met by that tour: hover and focus pause it, choosing a tab by hand stops
 * it for good, the one visible Pause control toggles it, and
 * `prefers-reduced-motion` means it never starts.
 */
export const appScreens = [
  {
    id: "home",
    label: "Home",
    phone: "/screenshots/current/home-phone-slim.webp",
    alt: "YO Voice Home on a phone: the YO Voice logo and a greeting, a Your people row with friends and their Voice Moments, a Live now card for a live Stage channel, and Here and now with one of your servers, above the navigation dock.",
    caption: "Home opens on your people and what is live right now.",
  },
  {
    id: "servers",
    label: "Servers",
    phone: "/screenshots/current/servers-phone-slim.webp",
    alt: "Servers on a phone: a Create server button above a compact list of five servers, one of each kind — For friends, For a podcast, For a community, For family and For a company — each with its member count and a one-line description.",
    caption: "Servers keep each circle together, with voice and text channels inside.",
  },
  {
    id: "chats",
    label: "Chats",
    phone: "/screenshots/current/chats-phone-slim.webp",
    alt: "Chats on a phone: a search field, Add friend and New message beside a row of friends, and a list of private conversations with unread counts, one of them a voice message.",
    caption: "Chats carry the private thread when nobody is talking live.",
  },
  {
    id: "moments",
    label: "Moments",
    phone: "/screenshots/current/moments-phone-slim.webp",
    alt: "YO Moments on a phone: the Voice and Yeels switch, the Discover filter selected beside Following and Most engaged, and a feed of short Voice Moments with play, like, comment and Reply with voice.",
    caption: "Moments and Yeels hold the short stuff in between.",
  },
] as const;

/**
 * Type for the tab labels, carried on a `<span>` rather than on the
 * `<button>` itself.
 *
 * `src/app/globals.css` resets buttons with an unlayered `button { font:
 * inherit }`, and an unlayered declaration outranks Tailwind v4's `@layer
 * utilities` no matter how specific the utility is. A `text-[11px] font-bold`
 * written straight on the button therefore loses to the `font` shorthand and
 * computes as 16px/400 — which pushed this row onto two lines on every phone
 * and left the selected tab with no weight to distinguish it. The reset only
 * matches `button`, so a child element keeps its utilities. Moving these onto
 * the button again reopens both defects.
 */
const CONTROL_LABEL = "text-[0.6875rem] font-bold leading-none";

const PHONE_WIDTH = 1206;
const PHONE_HEIGHT = 2622;
/**
 * The same app on a large screen: Home in the desktop layout, with the
 * navigation rail. Only Home is shown at desktop width here, so
 * this frame does not follow the tabs — it is a fixed, honest second view of
 * the product rather than a picture that would imply a screen nobody
 * photographed. Its alt is empty because the phone beside it carries the
 * description; a second reading of the same UI would only repeat itself.
 */
const DESKTOP = {
  src: "/screenshots/current/home-desktop-slim.webp",
  width: 2064,
  height: 1548,
} as const;

export function AppScreenRotator() {
  // The step, the pause state and the reduced-motion gate belong to the
  // hero's one tour (`hero-tour.tsx`): the phone shows the screen that the
  // welcome sentence beside it describes, and the one Pause control in that
  // sentence's row stops both.
  const { screenId, reduceMotion, selectScreen, setInteractionPaused } = useHeroTour();
  const panelId = useId();
  const active = appScreens.find((screen) => screen.id === screenId) ?? appScreens[0];

  return (
    <div
      className="relative mx-auto w-full max-w-[560px]"
      onMouseEnter={() => setInteractionPaused("hoverScreens", true)}
      onMouseLeave={() => setInteractionPaused("hoverScreens", false)}
      onFocusCapture={() => setInteractionPaused("focusScreens", true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setInteractionPaused("focusScreens", false);
        }
      }}
    >
      {/* The large-screen layout, behind and to the left, so its navigation
          rail — the one that names Servers — stays clear of the phone in
          front. It does not follow the tabs, and it carries no chrome that
          would claim a particular operating system: it is one real capture of
          the same app at a width where it lays itself out in columns. */}
      <div
        className="absolute left-0 top-0 hidden w-[74%] overflow-hidden rounded-[16px] border border-white/10 bg-[#0d0716] shadow-[0_28px_90px_rgba(8,4,20,.65)] sm:block"
        aria-hidden="true"
      >
        <div
          className="relative w-full"
          style={{ aspectRatio: `${DESKTOP.width} / ${DESKTOP.height}` }}
        >
          <Image
            src={DESKTOP.src}
            alt=""
            width={DESKTOP.width}
            height={DESKTOP.height}
            sizes="(max-width: 1024px) 50vw, 420px"
            className="size-full object-cover object-left-top"
          />
        </div>
      </div>

      {/* Centred on a phone, where the web-app window behind it is hidden;
          pushed right and down on wider screens so that window's navigation
          rail stays readable beside it. */}
      <div className="relative z-10 mx-auto w-full max-w-[300px] sm:ml-auto sm:mr-0 sm:mt-[13%] sm:max-w-[286px] lg:max-w-[300px]">
        {/* The phone body. The screen inside keeps the capture's own aspect
            ratio, so nothing is stretched to fit a frame it never had. */}
        <div className="relative rounded-[2.6rem] border border-[#342a43] bg-[#0b0714] p-[7px] shadow-[0_38px_120px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.07)]">
          <div
            className="relative overflow-hidden rounded-[2.2rem] bg-[#08040f]"
            style={{ aspectRatio: `${PHONE_WIDTH} / ${PHONE_HEIGHT}` }}
            id={panelId}
            role="group"
            aria-live="off"
            aria-label={active.label}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={active.phone}
                  alt={active.alt}
                  width={PHONE_WIDTH}
                  height={PHONE_HEIGHT}
                  sizes="(max-width: 640px) 80vw, 326px"
                  preload={active.id === "home"}
                  className="size-full object-cover object-top"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* The tabs. They name the app's own destinations, so the rotation is
          also a map of where Servers sits in the product. */}
      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-1.5 lg:justify-start">
        <div
          className="flex flex-wrap items-center gap-1 rounded-full border border-white/[.08] bg-white/[.025] p-1"
          role="group"
          aria-label="Choose an app screen"
        >
          {appScreens.map((screen) => (
            <button
              key={screen.id}
              type="button"
              onClick={() => selectScreen(screen.id)}
              aria-current={screen.id === active.id ? "true" : undefined}
              aria-controls={panelId}
              className={`focus-ring inline-flex min-h-11 items-center rounded-full px-2.5 transition motion-reduce:transition-none sm:px-3.5 ${
                screen.id === active.id
                  ? "bg-white/[.12] text-white"
                  : "text-white/55 hover:bg-white/[.06] hover:text-white"
              }`}
            >
              <span className={CONTROL_LABEL}>{screen.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="relative z-10 mt-3 min-h-10 text-center text-[0.75rem] leading-5 text-white/50 lg:text-left">
        {active.caption}
      </p>
    </div>
  );
}
