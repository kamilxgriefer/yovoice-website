"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { CINEMA_QUERY, useCinema } from "@/components/animations/cinema";

const STORAGE_KEY = "yovoice:home-scroll";

type SavedPosition = { y: number; cinema: boolean; width: number };

const subscribeToNothing = () => () => {};

/**
 * Keeps in-page links and scroll restoration landing where they should while
 * the scroll cinema changes the page's length.
 *
 * The server sends the static layout. When the cinema arms after hydration,
 * its pinned scenes make the page much longer (about 10k px becomes 17k px
 * at 1440 x 900), so everything the browser did against the static layout
 * lands in the wrong place: `/#download` stops in the middle of another
 * scene, and a reload restores to where the static layout would have ended.
 *
 * So on this page the position is ours to restore:
 *
 * - `history.scrollRestoration` is `manual` while the homepage is open, and
 *   the position is saved when the page is left (reload, another document, a
 *   client navigation away);
 * - once the layout for this visit is in place (the cinema's, or the static
 *   one when the cinema stays off), a URL fragment is scrolled to again, and
 *   a reload or a back/forward arrival returns to the saved position if it
 *   was saved in the same layout at the same width.
 *
 * Every jump is instant: `html { scroll-behavior: smooth }` would otherwise
 * sweep the visitor through every scene on the way.
 */
export function CinemaScrollAnchor() {
  const cinema = useCinema();
  // False only in the render that hydrates the server's HTML: this mount is
  // the document's own load, not a client navigation to the homepage.
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const [documentLoad] = useState(!hydrated);
  const cinemaNow = useRef(cinema);
  const saved = useRef<SavedPosition | null | undefined>(undefined);
  const handled = useRef(false);

  useEffect(() => {
    cinemaNow.current = cinema;
  }, [cinema]);

  useEffect(() => {
    // Read before this mount can overwrite it (development runs effects twice).
    if (saved.current === undefined) saved.current = readSaved();
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const save = () => {
      const position: SavedPosition = {
        y: window.scrollY,
        cinema: cinemaNow.current,
        width: window.innerWidth,
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      } catch {
        // Storage can be unavailable (private mode, blocked site data).
      }
    };
    // A client navigation away resets the scroll to the top before this
    // unmounts, so the position is taken when the link is followed.
    let leaving = false;
    const follow = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.pathname === window.location.pathname && link.origin === window.location.origin) return;
      save();
      leaving = true;
    };
    document.addEventListener("click", follow, true);
    window.addEventListener("pagehide", save);
    return () => {
      if (!leaving) save();
      document.removeEventListener("click", follow, true);
      window.removeEventListener("pagehide", save);
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (handled.current) return;
    // Wait for the cinema's layout if this visit will have one.
    if (window.matchMedia(CINEMA_QUERY).matches && !cinema) return;

    const land = landing(cinema, documentLoad, saved.current ?? null);
    if (!land) {
      handled.current = true;
      return;
    }
    // Two frames: the scenes have committed, sticky stages have their height.
    // Only a landing that actually ran counts as handled.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        handled.current = true;
        land();
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [cinema, documentLoad]);

  return null;
}

function readSaved(): SavedPosition | null {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as SavedPosition | null;
  } catch {
    return null;
  }
}

/** Where this visit should land once its layout is in place, if anywhere. */
function landing(
  cinema: boolean,
  documentLoad: boolean,
  saved: SavedPosition | null,
): (() => void) | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (target) {
    return () => target.scrollIntoView({ block: "start", behavior: "instant" });
  }

  if (!arrivedByHistory(documentLoad)) return null;
  if (!saved || saved.cinema !== cinema || saved.width !== window.innerWidth) return null;
  const y = saved.y;
  return () => window.scrollTo({ top: y, behavior: "instant" });
}

let lastPopState = -Infinity;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopState = performance.now();
  });
}

/** A reload or a back/forward arrival — of the document, or of the route. */
function arrivedByHistory(documentLoad: boolean): boolean {
  if (!documentLoad) return performance.now() - lastPopState < 2000;
  const [navigation] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return navigation?.type === "reload" || navigation?.type === "back_forward";
}
