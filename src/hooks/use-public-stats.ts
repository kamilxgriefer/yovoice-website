"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase/config";
import {
  parseVerifiedPublicStats,
  publicStatsFreshnessMs,
  type VerifiedPublicStats,
} from "@/lib/public-stats";

export type PublicStatsState =
  | { status: "loading"; stats: null }
  | { status: "fresh"; stats: VerifiedPublicStats }
  | { status: "stale"; stats: null }
  | { status: "unavailable"; stats: null };

export function usePublicStats(): PublicStatsState {
  const [state, setState] = useState<PublicStatsState>({
    status: "loading",
    stats: null,
  });

  useEffect(() => {
    let cancelled = false;
    let staleTimer: ReturnType<typeof setTimeout> | null = null;

    function clearStaleTimer() {
      if (staleTimer !== null) clearTimeout(staleTimer);
      staleTimer = null;
    }

    try {
      const unsubscribe = onSnapshot(
        doc(getFirebaseFirestore(), "publicStats", "live"),
        (snapshot) => {
          if (cancelled) return;
          clearStaleTimer();
          if (!snapshot.exists()) {
            setState({ status: "unavailable", stats: null });
            return;
          }

          const parsed = parseVerifiedPublicStats(
            snapshot.data() as Record<string, unknown>,
          );
          setState(parsed);

          if (parsed.status === "fresh") {
            const remaining = Math.max(
              0,
              parsed.stats.updatedAt.getTime() + publicStatsFreshnessMs - Date.now(),
            );
            staleTimer = setTimeout(() => {
              if (!cancelled) setState({ status: "stale", stats: null });
            }, remaining + 100);
          }
        },
        () => {
          if (!cancelled) {
            clearStaleTimer();
            setState({ status: "unavailable", stats: null });
          }
        },
      );

      return () => {
        cancelled = true;
        clearStaleTimer();
        unsubscribe();
      };
    } catch {
      queueMicrotask(() => {
        if (!cancelled) setState({ status: "unavailable", stats: null });
      });
      return () => {
        cancelled = true;
        clearStaleTimer();
      };
    }
  }, []);

  return state;
}
