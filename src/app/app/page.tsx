"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { AppEntryTransition } from "@/components/app-launch/app-entry-transition";
import { useAuth } from "@/hooks/use-auth";
import { getAppUrl } from "@/lib/auth/auth-redirect";

/**
 * The front door to the YO Voice app. Everything on this site that means
 * "open YO Voice" routes here rather than jumping straight to the app
 * origin, so the hand-off always looks the same — and so the browser has a
 * dark, painted page to sit on instead of a white inter-navigation flash.
 *
 * Readiness is this page's own initialization, not a guess about the app:
 *   - Firebase auth resolving (AuthProvider's onAuthStateChanged),
 *   - the mark decoding,
 *   - webfonts being ready to paint.
 * There is no measurable "the Flutter app has booted" signal available from
 * a different origin, so beyond those three the animation timeline is used
 * exactly as the spec's minimum: a floor, never a fake percentage.
 */

/** Hard cap on waiting for the above. Nothing here is a prerequisite for the
 * destination — the app authenticates independently — so a wedged font load
 * or a stalled auth handshake must not strand anyone. Sits inside
 * AuthProvider's own 8s fail-open so we never race it. */
const INIT_TIMEOUT_MS = 6000;
/** When we're clearly waiting on something slow, surface a real link so the
 * screen is never a dead end. */
const STALL_HINT_MS = 4000;

const APP_URL = getAppUrl();
const APP_ORIGIN = (() => {
  try {
    return new URL(APP_URL).origin;
  } catch {
    return null;
  }
})();

export default function AppEntryPage() {
  const { loading: authLoading } = useAuth();

  const [logoReady, setLogoReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [initTimedOut, setInitTimedOut] = useState(false);
  const [stalled, setStalled] = useState(false);
  const handedOff = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setFontsReady(true);
    };
    // No FontFaceSet (older Safari) means nothing to wait on — resolve on a
    // microtask rather than synchronously, so this stays a subscription
    // rather than a render-cascading setState.
    const waitFor = "fonts" in document ? document.fonts.ready : Promise.resolve();
    void waitFor.then(markReady);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const hint = setTimeout(() => setStalled(true), STALL_HINT_MS);
    const cap = setTimeout(() => setInitTimedOut(true), INIT_TIMEOUT_MS);
    return () => {
      clearTimeout(hint);
      clearTimeout(cap);
    };
  }, []);

  const handleLogoReady = useCallback(() => setLogoReady(true), []);

  // Monotonic by construction: every input only ever goes false → true.
  const ready = initTimedOut || (!authLoading && logoReady && fontsReady);

  const handleComplete = useCallback(() => {
    if (handedOff.current) return;
    handedOff.current = true;
    // replace(), not assign(): /app must not survive in history, or Back out
    // of the app would land here and immediately throw the user forward
    // again. Replacing means Back returns to whatever preceded the launch.
    window.location.replace(APP_URL);
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[var(--background)]">
      {APP_ORIGIN ? <link rel="preconnect" href={APP_ORIGIN} /> : null}

      <AppEntryTransition
        ready={ready}
        onComplete={handleComplete}
        onLogoReady={handleLogoReady}
      />

      {/* Escape hatches. Absolutely positioned so neither can shift the
          composition when it appears. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: stalled && !ready ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <a
          href={APP_URL}
          className={`focus-ring rounded-full px-4 py-2 text-sm text-white/40 transition hover:text-white ${
            stalled && !ready ? "pointer-events-auto" : ""
          }`}
          tabIndex={stalled && !ready ? undefined : -1}
        >
          Taking a while — continue to YO Voice
        </a>
      </motion.div>

      <noscript>
        <div className="absolute inset-x-0 bottom-10 flex justify-center px-6">
          <a href={APP_URL} className="text-sm text-fuchsia-300 underline">
            Continue to YO Voice
          </a>
        </div>
      </noscript>
    </main>
  );
}
