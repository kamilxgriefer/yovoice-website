"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

/**
 * One clock for the whole hero.
 *
 * The welcome sentence on the left and the phone on the right used to be two
 * carousels with two timers (6.2 s and 5.2 s) and two Pause buttons, so which
 * sentence stood beside which screen was an accident of drift, and pausing one
 * left the other moving. They now read one step from here: every welcome line
 * names the app screen that shows what it describes (`screen`), and the phone
 * follows the line. Choosing a screen by hand jumps the sentence to the first
 * line about that screen.
 *
 * WCAG 2.2.2 is met once, for both: hovering or focusing either carousel
 * pauses the tour, the single visible Pause control stops it for good,
 * choosing a screen by hand stops it too, and `prefers-reduced-motion` means
 * it never starts.
 */
// A hydration flag that never changes: the server snapshot is false and the client snapshot is true.
const subscribeToNothing = () => () => {};

export const appScreenIds = ["home", "servers", "chats", "moments"] as const;
export type AppScreenId = (typeof appScreenIds)[number];

/**
 * Welcome copy, not release notes. Every line describes what YO Voice is for
 * someone arriving today: Servers and their voice channels, Chats, Voice
 * Moments and Yeels. Retired product names are deliberately absent, and no
 * line carries a build number or a "what changed" claim — the release
 * boundary lives on /updates and /download, where it can be stated precisely.
 *
 * `screen` is the captured app screen that shows what the line talks about.
 * There is no Yeels capture, so the Yeels line stands beside Moments, whose
 * capture shows the Voice / Yeels switch.
 */
export const heroPrompts = [
  {
    screen: "home",
    text: "Find the people you actually want to hear — then talk to them, out loud.",
  },
  {
    screen: "servers",
    text: "A Server gathers your circle into voice channels and chats that stay put.",
  },
  {
    screen: "servers",
    text: "Five kinds of space to start from: Friends, Community, Podcast, Family and Company.",
  },
  {
    screen: "chats",
    text: "Chats keep the private conversation going between the people you know.",
  },
  {
    screen: "moments",
    text: "Voice Moments are short audio stories from your circle, and they last a day.",
  },
  {
    screen: "moments",
    text: "Yeels put the photo or video first, with your own words layered over it.",
  },
  {
    screen: "home",
    text: "Add the friends you enjoy hearing, and always know where to meet again.",
  },
  {
    screen: "servers",
    text: "No polished post required — just a topic, a microphone, and people worth meeting.",
  },
] as const satisfies readonly { screen: AppScreenId; text: string }[];

const ROTATION_INTERVAL_MS = 6200;

type HeroTour = {
  promptIndex: number;
  screenId: AppScreenId;
  paused: boolean;
  reduceMotion: boolean;
  togglePaused: () => void;
  setInteractionPaused: (value: boolean) => void;
  showPreviousPrompt: () => void;
  showNextPrompt: () => void;
  selectScreen: (id: AppScreenId) => void;
};

const HeroTourContext = createContext<HeroTour | null>(null);

export function HeroTourProvider({ children }: { children: ReactNode }) {
  // framer-motion resolves the reduced-motion preference during the first render, so
  // gating on it before hydration makes the server and client markup disagree (React #418).
  const prefersReducedMotion = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const reduceMotion = hydrated && prefersReducedMotion === true;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);

  const autoRotationPaused =
    paused || interactionPaused || reduceMotion === true;

  useEffect(() => {
    if (autoRotationPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroPrompts.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [autoRotationPaused]);

  const tour: HeroTour = {
    promptIndex: activeIndex,
    screenId: heroPrompts[activeIndex].screen,
    paused,
    reduceMotion,
    togglePaused: () => setPaused((current) => !current),
    setInteractionPaused,
    showPreviousPrompt: () =>
      setActiveIndex((current) => (current === 0 ? heroPrompts.length - 1 : current - 1)),
    showNextPrompt: () => setActiveIndex((current) => (current + 1) % heroPrompts.length),
    /** Choosing a screen by hand is a deliberate stop, not a nudge. */
    selectScreen: (id) => {
      setActiveIndex((current) =>
        heroPrompts[current].screen === id
          ? current
          : heroPrompts.findIndex((prompt) => prompt.screen === id),
      );
      setPaused(true);
    },
  };

  return <HeroTourContext.Provider value={tour}>{children}</HeroTourContext.Provider>;
}

export function useHeroTour(): HeroTour {
  const tour = useContext(HeroTourContext);
  if (!tour) throw new Error("useHeroTour must be used inside <HeroTourProvider>.");
  return tour;
}
