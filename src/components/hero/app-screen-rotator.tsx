"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";

/**
 * The hero's device frames, showing the app as it is today.
 *
 * Every frame in `appScreens` is a real screenshot of the current build's own
 * widgets, captured from the app repository's preview harness on a spare
 * simulator with fixture data — not a CSS drawing of remembered UI. That
 * distinction is the whole point of this component: the illustration it
 * replaced still drew a navigation dock with a centre logo and no Servers
 * destination, which the shipped app has not had for some time.
 *
 * The four tabs are the app's own first four destinations, Servers among them,
 * and they advance by themselves — the rotation the hero had before, now
 * carrying the interface rather than only a sentence. WCAG 2.2.2 is met the
 * same way the prompt rotator meets it: hover and focus pause it, choosing a
 * tab by hand stops it for good, a visible labelled control toggles it, and
 * `prefers-reduced-motion` means it never starts.
 */
// A hydration flag that never changes: the server snapshot is false and the client snapshot is true.
const subscribeToNothing = () => () => {};

export const appScreens = [
  {
    id: "home",
    label: "Home",
    phone: "/screenshots/current/home-phone.webp",
    alt: "YO Voice Home on a phone: a greeting, a Your people avatar row, a Here and now card with Create server and Friends actions, and the servers you belong to above the navigation dock.",
    caption: "Home opens on your people and the servers you are already in.",
  },
  {
    id: "servers",
    label: "Servers",
    phone: "/screenshots/current/servers-phone.webp",
    alt: "The Servers directory on a phone: a Create server action above a list of servers, each showing its name, its kind and a one-line description.",
    caption: "Servers keep each circle together, with voice and text channels inside.",
  },
  {
    id: "chats",
    label: "Chats",
    phone: "/screenshots/current/chats-phone.webp",
    alt: "Chats on a phone: a search field, Add friend and New message actions, and a list of private conversations with unread counts.",
    caption: "Chats carry the private thread when nobody is talking live.",
  },
  {
    id: "moments",
    label: "Moments",
    phone: "/screenshots/current/moments-phone.webp",
    alt: "YO Moments on a phone: the Voice and Yeels switch above a feed of short voice posts from people you follow.",
    caption: "Moments and Yeels hold the short stuff in between.",
  },
] as const;

const ROTATION_INTERVAL_MS = 5200;

/**
 * Type for the tab and pause labels, carried on a `<span>` rather than on the
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
const CONTROL_LABEL = "text-[11px] font-bold leading-none";

const PHONE_WIDTH = 1206;
const PHONE_HEIGHT = 2622;
/**
 * The same app on a large screen. Only Home was captured at desktop width, so
 * this frame does not follow the tabs — it is a fixed, honest second view of
 * the product rather than a picture that would imply a screen nobody
 * photographed. Its alt is empty because the phone beside it carries the
 * description; a second reading of the same UI would only repeat itself.
 */
const DESKTOP = {
  src: "/screenshots/current/home-desktop.webp",
  width: 2064,
  height: 1548,
} as const;

export function AppScreenRotator() {
  // framer-motion resolves the reduced-motion preference during the first render, so
  // gating on it before hydration makes the server and client markup disagree (React #418).
  const prefersReducedMotion = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const reduceMotion = hydrated && prefersReducedMotion === true;
  const panelId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);

  const autoRotationPaused = paused || interactionPaused || reduceMotion === true;
  const active = appScreens[activeIndex];

  /** Choosing a tab by hand is a deliberate stop, not a nudge. */
  function selectScreen(index: number) {
    setActiveIndex(index);
    setPaused(true);
  }

  useEffect(() => {
    if (autoRotationPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % appScreens.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [autoRotationPaused]);

  return (
    <div
      className="relative mx-auto w-full max-w-[560px]"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setInteractionPaused(false);
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-[10%] top-[6%] h-[80%] rounded-full bg-fuchsia-500/12 blur-[90px]"
        aria-hidden="true"
      />

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
        {reduceMotion !== true && (
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-white/55 transition hover:bg-white/[.04] hover:text-white/80 motion-reduce:transition-none"
            aria-label={paused ? "Play the app screen tour" : "Pause the app screen tour"}
          >
            {paused ? (
              <Play className="size-3" aria-hidden="true" />
            ) : (
              <Pause className="size-3" aria-hidden="true" />
            )}
            <span className={CONTROL_LABEL}>{paused ? "Play" : "Pause"}</span>
          </button>
        )}

        <div
          className="flex flex-wrap items-center gap-1 rounded-full border border-white/[.08] bg-white/[.025] p-1"
          role="group"
          aria-label="Choose an app screen"
        >
          {appScreens.map((screen, index) => (
            <button
              key={screen.id}
              type="button"
              onClick={() => selectScreen(index)}
              aria-current={index === activeIndex ? "true" : undefined}
              aria-controls={panelId}
              className={`focus-ring inline-flex min-h-11 items-center rounded-full px-2.5 transition motion-reduce:transition-none sm:px-3.5 ${
                index === activeIndex
                  ? "bg-white/[.12] text-white"
                  : "text-white/55 hover:bg-white/[.06] hover:text-white"
              }`}
            >
              <span className={CONTROL_LABEL}>{screen.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="relative z-10 mt-3 min-h-10 text-center text-[12px] leading-5 text-white/50 lg:text-left">
        {active.caption}
      </p>
    </div>
  );
}
