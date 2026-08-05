"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  // User agent doesn't change during a session — nothing to subscribe to.
  return () => {};
}

function getSnapshot(): boolean | null {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent || "");
}

function getServerSnapshot(): boolean | null {
  return null;
}

/** Detects a mobile browser client-side. `null` while undetermined (first
 * render / SSR) so callers can wait before deciding what to show. */
export function useIsMobile(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
