"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase/config";
import {
  parseVerifiedPublicShowcase,
  type VerifiedPublicShowcase,
} from "@/lib/public-showcase";

export type PublicShowcaseState =
  | { status: "loading"; showcase: null }
  | { status: "fresh"; showcase: VerifiedPublicShowcase }
  | { status: "stale" | "unavailable"; showcase: null };

export function usePublicShowcase(): PublicShowcaseState {
  const [state, setState] = useState<PublicShowcaseState>({
    status: "loading",
    showcase: null,
  });

  useEffect(() => {
    let cancelled = false;
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;
    let activityTimer: ReturnType<typeof setTimeout> | null = null;

    const clearExpiry = () => {
      if (expiryTimer !== null) clearTimeout(expiryTimer);
      if (activityTimer !== null) clearTimeout(activityTimer);
      expiryTimer = null;
      activityTimer = null;
    };

    try {
      const unsubscribe = onSnapshot(
        doc(getFirebaseFirestore(), "publicShowcase", "live"),
        (snapshot) => {
          if (cancelled) return;
          clearExpiry();
          if (!snapshot.exists()) {
            setState({ status: "unavailable", showcase: null });
            return;
          }
          const parsed = parseVerifiedPublicShowcase(
            snapshot.data() as Record<string, unknown>,
          );
          setState(parsed);
          if (parsed.status === "fresh") {
            const activityRemaining = Math.max(
              0,
              parsed.showcase.activityValidUntil.getTime() - Date.now(),
            );
            activityTimer = setTimeout(() => {
              if (!cancelled) {
                setState((current) =>
                  current.status === "fresh"
                    ? {
                        status: "fresh",
                        showcase: {
                          ...current.showcase,
                          people: current.showcase.people.map((person) => ({
                            ...person,
                            activity: "undisclosed" as const,
                          })),
                        },
                      }
                    : current,
                );
              }
            }, activityRemaining + 100);
            const remaining = Math.max(
              0,
              parsed.showcase.validUntil.getTime() - Date.now(),
            );
            expiryTimer = setTimeout(() => {
              if (!cancelled) setState({ status: "stale", showcase: null });
            }, remaining + 100);
          }
        },
        () => {
          if (!cancelled) setState({ status: "unavailable", showcase: null });
        },
      );
      return () => {
        cancelled = true;
        clearExpiry();
        unsubscribe();
      };
    } catch {
      queueMicrotask(() => {
        if (!cancelled) setState({ status: "unavailable", showcase: null });
      });
      return () => {
        cancelled = true;
        clearExpiry();
      };
    }
  }, []);

  return state;
}
